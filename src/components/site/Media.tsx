'use client'
import Image, { getImageProps } from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { MediaRef } from '@/lib/content/types'
import { IconExpand, IconMute, IconPause, IconPlay, IconSound } from './icons'
import { useT } from './context'

/** Optimised (resized, WebP/AVIF) URL for a video poster image. */
export function posterUrl(url: string | null | undefined, width = 1280) {
  if (!url) return undefined
  return getImageProps({ src: url, alt: '', width, height: Math.round(width * 0.5625), quality: 70 }).props.src
}

/** Responsive image from a media library reference. */
export function SmartImage({
  media,
  sizes = '100vw',
  fill = true,
  priority = false,
  className = '',
  focal,
  alt,
}: {
  media: MediaRef | null | undefined
  sizes?: string
  fill?: boolean
  priority?: boolean
  className?: string
  focal?: string
  alt?: string
}) {
  if (!media) return <div className={`bg-cream ${fill ? 'absolute inset-0' : ''} ${className}`} aria-hidden />
  const src = media.type === 'video' ? media.poster : media.url
  if (!src) return <div className={`bg-olive-deep ${fill ? 'absolute inset-0' : ''} ${className}`} aria-hidden />
  const common = {
    src,
    alt: alt ?? media.alt ?? '',
    sizes,
    priority,
    className: `object-cover ${className}`,
    style: { objectPosition: focal ?? '50% 50%' },
  }
  return fill ? (
    <Image {...common} fill />
  ) : (
    <Image {...common} width={media.width ?? 1600} height={media.height ?? 1000} />
  )
}

/** Silent decorative loop (hero, reels). Never plays sound. Pauses for reduced motion. */
export function LoopVideo({
  media,
  poster,
  className = '',
  focal,
  defer = false,
  noPoster = false,
}: {
  media: MediaRef
  poster?: string | null
  className?: string
  focal?: string
  /** Wait until the page has finished loading before fetching the video (hero) */
  defer?: boolean
  /** An image is already shown underneath, so skip the poster */
  noPoster?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [src, setSrc] = useState<string | undefined>()
  const holder = useRef<HTMLDivElement>(null)
  // Fetch the file only when it is about to scroll into view (and, for the
  // hero, after the page has finished loading) so it never delays the page.
  useEffect(() => {
    if (reduce) return
    const el = holder.current
    if (!el) return
    let t: ReturnType<typeof setTimeout> | undefined
    const load = () => {
      if (!defer || document.readyState === 'complete') t = setTimeout(() => setSrc(media.url), defer ? 400 : 0)
      else window.addEventListener('load', () => (t = setTimeout(() => setSrc(media.url), 400)), { once: true })
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect()
        load()
      }
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => {
      io.disconnect()
      if (t) clearTimeout(t)
    }
  }, [defer, reduce, media.url])
  useEffect(() => {
    const v = ref.current
    if (!v || !src) return
    if (reduce) {
      v.pause()
      return
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.1 })
    io.observe(v)
    return () => io.disconnect()
  }, [reduce, src])
  const posterSrc = noPoster ? null : (poster ?? media.poster)
  if (!src)
    return (
      <div ref={holder} className={`absolute inset-0 ${className}`} aria-hidden>
        {posterSrc && <Image src={posterSrc} alt="" fill sizes="(min-width: 768px) 25vw, 60vw" className="object-cover" style={{ objectPosition: focal ?? '50% 50%' }} />}
      </div>
    )
  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ objectPosition: focal ?? '50% 50%' }}
      src={src}
      poster={posterUrl(posterSrc, 828)}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    />
  )
}

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/** Cinematic player with custom, accessible controls. Starts only when the visitor presses play. */
export function VideoPlayer({
  media,
  poster,
  title,
  aspect = '16 / 9',
  dark = true,
}: {
  media: MediaRef
  poster?: MediaRef | null
  title: string
  aspect?: string
  dark?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const t = useT()
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      setStarted(true)
      setLoading(true)
      v.play().catch(() => setLoading(false))
    } else v.pause()
  }
  const seek = (ratio: number) => {
    const v = ref.current
    if (v && Number.isFinite(v.duration)) v.currentTime = Math.max(0, Math.min(1, ratio)) * v.duration
  }
  const fullscreen = () => {
    const el = wrap.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el?.requestFullscreen) el.requestFullscreen()
    else v?.webkitEnterFullscreen?.()
  }
  const onKey = (e: React.KeyboardEvent) => {
    const v = ref.current
    if (!v) return
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle() }
    if (e.key === 'm') { v.muted = !v.muted; setMuted(v.muted) }
    if (e.key === 'f') fullscreen()
    if (e.key === 'ArrowRight') v.currentTime += 5
    if (e.key === 'ArrowLeft') v.currentTime -= 5
  }
  const posterSrc = posterUrl(poster?.url ?? media.poster)
  const tone = dark ? 'text-ivory' : 'text-olive-deep'

  return (
    <div
      ref={wrap}
      className={`group relative w-full overflow-hidden bg-charcoal ${tone}`}
      style={{ aspectRatio: aspect }}
      onKeyDown={onKey}
    >
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={media.url}
        poster={posterSrc}
        preload="none"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
        onError={() => { setFailed(true); setLoading(false) }}
        onClick={toggle}
        aria-label={title}
      />
      {!started && (
        <button
          type="button"
          onClick={toggle}
          className="on-dark absolute inset-0 flex items-center justify-center bg-charcoal/25 transition-colors duration-700 hover:bg-charcoal/10"
          aria-label={t('video.play', { title })}
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-ivory/80 text-ivory transition-transform duration-700 ease-[var(--ease-film)] group-hover:scale-110 md:h-28 md:w-28">
            <IconPlay size={26} />
          </span>
        </button>
      )}
      {loading && started && !failed && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" role="status">
          <span className="h-10 w-10 animate-spin rounded-full border border-ivory/30 border-t-ivory" />
          <span className="sr-only">{t('video.loading')}</span>
        </span>
      )}
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center bg-charcoal/70 p-6 text-center text-sm text-ivory" role="alert">
          {t('video.failed')}
        </p>
      )}
      {started && !failed && (
        <div className="on-dark absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-charcoal/70 to-transparent px-4 pb-3 pt-10 text-ivory opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <button type="button" onClick={toggle} className="p-2" aria-label={playing ? t('reels.pause') : t('reels.play')}>
            {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1000}
            value={duration ? Math.round((time / duration) * 1000) : 0}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            className="h-px flex-1 cursor-pointer appearance-none bg-ivory/40 accent-ivory"
            aria-label={t('video.seek')}
          />
          <span className="meta w-20 text-right">{fmt(time)} / {fmt(duration)}</span>
          <button
            type="button"
            onClick={() => { const v = ref.current; if (v) { v.muted = !v.muted; setMuted(v.muted) } }}
            className="p-2"
            aria-label={muted ? t('reels.unmute') : t('reels.mute')}
          >
            {muted ? <IconMute size={18} /> : <IconSound size={18} />}
          </button>
          <button type="button" onClick={fullscreen} className="p-2" aria-label={t('video.fullscreen')}>
            <IconExpand size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
