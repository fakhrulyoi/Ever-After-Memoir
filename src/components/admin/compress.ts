'use client'
/**
 * Shrinks videos in the browser before they reach storage.
 *
 * Phone videos (.mov, 1080p/4K, 60fps) are 20–50 MB. Every visitor who sees a
 * looping video downloads the whole file, so a few of them use up the Supabase
 * bandwidth quota fast. The site never shows video larger than ~720px wide, so
 * we re-encode to 720p H.264 MP4 at 30fps with "fast start" (plays before the
 * whole file has arrived). Typical result: 5–10× smaller, same look on screen.
 */

/** Short side of the output, in pixels */
const TARGET_SHORT_SIDE = 720
const VIDEO_BITRATE = 1_800_000
const AUDIO_BITRATE = 96_000
const MAX_FPS = 30
/** Videos this small (and already MP4 at ≤720p) are left alone */
export const SMALL_VIDEO_BYTES = 8 * 1024 * 1024

export function videoNeedsCompress(v: { mime: string; size: number; width?: number | null; height?: number | null }) {
  if (v.mime !== 'video/mp4') return true
  if (v.size > SMALL_VIDEO_BYTES) return true
  const short = Math.min(v.width ?? 0, v.height ?? 0)
  return short > TARGET_SHORT_SIDE
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2)

// Encode one video at a time: several at once can exhaust the hardware encoder
let lock: Promise<unknown> = Promise.resolve()

/**
 * Re-encode a video. Resolves with the original file if the browser can't
 * encode video or if compressing would not make it smaller.
 */
export function compressVideo(file: Blob, name: string, onProgress?: (p: number) => void): Promise<File> {
  const run = lock.then(() => encode(file, name, onProgress))
  lock = run.catch(() => {})
  return run
}

async function encode(file: Blob, name: string, onProgress?: (p: number) => void): Promise<File> {
  const original = file instanceof File ? file : new File([file], name, { type: file.type })
  if (typeof window === 'undefined' || !('VideoEncoder' in window)) return original
  const mb = await import('mediabunny')
  if (!(await mb.canEncodeVideo('avc'))) return original

  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS })
  try {
    const track = await input.getPrimaryVideoTrack()
    if (!track) return original
    const dw = track.displayWidth
    const dh = track.displayHeight
    const scale = Math.min(1, TARGET_SHORT_SIDE / Math.min(dw, dh))
    // Only lower the frame rate (60fps phone clips); never add frames to 24/30fps clips
    const fps = await track.computePacketStats(120).then((s) => s.averagePacketRate).catch(() => 0)
    const target = new mb.BufferTarget()
    const output = new mb.Output({ format: new mb.Mp4OutputFormat({ fastStart: 'in-memory' }), target })
    const conversion = await mb.Conversion.init({
      input,
      output,
      video: {
        width: even(dw * scale),
        height: even(dh * scale),
        fit: 'fill',
        codec: 'avc',
        quality: new mb.Quality({ bitrate: VIDEO_BITRATE }),
        ...(fps > MAX_FPS + 1 ? { frameRate: MAX_FPS } : {}),
        keyFrameInterval: 2,
        forceTranscode: true,
      },
      // Re-encode audio to AAC where the browser can; otherwise copy the original
      // track (phone videos already carry AAC, which MP4 plays everywhere)
      audio: (await mb.canEncodeAudio('aac')) ? { codec: 'aac', quality: new mb.Quality({ bitrate: AUDIO_BITRATE }) } : {},
      showWarnings: false,
    })
    // e.g. HEVC on a browser that cannot decode it: keep the original rather than upload audio only
    if (!conversion.isValid || !conversion.utilizedTracks.some((t) => t.isVideoTrack())) return original
    if (onProgress) conversion.onProgress = (p) => onProgress(Math.min(1, p))
    await conversion.execute()
    const buf = target.buffer
    if (!buf || buf.byteLength >= file.size) return original
    const base = name.replace(/\.[^.]+$/, '') || 'video'
    return new File([buf], `${base}.mp4`, { type: 'video/mp4' })
  } finally {
    input.dispose()
  }
}
