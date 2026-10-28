'use client'
import { getBrowserSupabase } from '@/lib/supabase/browser'
import { IMAGE_MIME, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, MEDIA_BUCKET, SUPABASE_ANON_KEY, SUPABASE_URL, VIDEO_MIME } from '@/lib/env'

export interface UploadedFile {
  path: string
  mime: string
  size: number
  width: number | null
  height: number | null
  duration: number | null
}

export function validateFile(file: File): string | null {
  const isImage = IMAGE_MIME.includes(file.type)
  const isVideo = VIDEO_MIME.includes(file.type)
  if (!isImage && !isVideo) return `${file.name}: only JPG, PNG, WebP, AVIF, GIF, MP4, WebM or MOV files can be uploaded.`
  if (isImage && file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 15 MB. Export it smaller and try again.`
  if (isVideo && file.size > MAX_VIDEO_BYTES) return `${file.name} is larger than 50 MB. Export a shorter or compressed version.`
  return null
}

async function readDimensions(file: File): Promise<Pick<UploadedFile, 'width' | 'height' | 'duration'>> {
  const url = URL.createObjectURL(file)
  try {
    if (file.type.startsWith('image/')) {
      const img = new Image()
      img.src = url
      await img.decode()
      return { width: img.naturalWidth || null, height: img.naturalHeight || null, duration: null }
    }
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.src = url
    await new Promise<void>((res, rej) => {
      v.onloadedmetadata = () => res()
      v.onerror = () => rej(new Error('metadata'))
    })
    return { width: v.videoWidth || null, height: v.videoHeight || null, duration: Number.isFinite(v.duration) ? v.duration : null }
  } catch {
    return { width: null, height: null, duration: null }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Upload straight from the browser to Supabase Storage, reporting progress (0–1). */
export async function uploadFile(file: File, onProgress: (p: number) => void): Promise<UploadedFile> {
  const problem = validateFile(file)
  if (problem) throw new Error(problem)
  const { data } = await getBrowserSupabase().auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Your session has expired. Sign in again to upload.')
  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin'
  const now = new Date()
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${ext}`
  const dims = await readDimensions(file)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('cache-control', 'max-age=31536000')
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let msg = `Upload failed (${xhr.status}).`
      try {
        const body = JSON.parse(xhr.responseText)
        if (/size/i.test(body.message ?? '')) msg = 'This file is larger than your storage plan allows.'
        else if (/mime|type/i.test(body.message ?? '')) msg = 'This file type is not allowed.'
        else if (xhr.status === 403 || xhr.status === 401) msg = 'Upload refused: your session expired or this account is not an admin.'
        else if (body.message) msg = body.message
      } catch {}
      reject(new Error(msg))
    }
    xhr.onerror = () => reject(new Error('The connection dropped during upload. Check your internet and retry.'))
    xhr.send(file)
  })
  onProgress(1)
  return { path, mime: file.type, size: file.size, ...dims }
}
