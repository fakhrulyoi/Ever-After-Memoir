'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import { IMAGE_MIME, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, MEDIA_BUCKET, VIDEO_MIME } from '../env'
import { friendlyDbError, type ActionResult } from './result'

export interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'video'
  mime: string
  size_bytes: number
  width: number | null
  height: number | null
  duration: number | null
  alt_text: string
  caption: string
  folder: string
  is_sample: boolean
  storage_path: string | null
  created_at: string
}

const uploadSchema = z.object({
  path: z.string().regex(/^uploads\/[a-z0-9/_.-]{5,200}$/i),
  mime: z.string().max(100),
  size: z.number().int().positive(),
  width: z.number().int().positive().max(20000).nullable(),
  height: z.number().int().positive().max(20000).nullable(),
  duration: z.number().nonnegative().nullable(),
  alt: z.string().max(300).default(''),
  folder: z.string().max(60).default('General'),
})

function checkFile(mime: string, size: number): string | null {
  if (IMAGE_MIME.includes(mime)) return size > MAX_IMAGE_BYTES ? 'Images must be 15 MB or smaller.' : null
  if (VIDEO_MIME.includes(mime)) return size > MAX_VIDEO_BYTES ? 'Videos must be 50 MB or smaller.' : null
  return 'Only JPG, PNG, WebP, AVIF, GIF, MP4, WebM or MOV files can be uploaded.'
}

/** Called after the browser has uploaded a file to storage: records it in the library. */
export async function registerMedia(input: z.input<typeof uploadSchema>): Promise<ActionResult<{ asset: MediaAsset }>> {
  const admin = await requireAdmin()
  const p = uploadSchema.safeParse(input)
  if (!p.success) return { ok: false, error: 'The upload details were not valid. Please try again.' }
  const bad = checkFile(p.data.mime, p.data.size)
  const sb = await createSupabaseServer()
  if (bad) {
    await sb.storage.from(MEDIA_BUCKET).remove([p.data.path])
    return { ok: false, error: bad }
  }
  const url = sb.storage.from(MEDIA_BUCKET).getPublicUrl(p.data.path).data.publicUrl
  const { data, error } = await sb
    .from('media_assets')
    .insert({
      storage_path: p.data.path,
      url,
      type: p.data.mime.startsWith('video/') ? 'video' : 'image',
      mime: p.data.mime,
      size_bytes: p.data.size,
      width: p.data.width,
      height: p.data.height,
      duration: p.data.duration,
      alt_text: p.data.alt,
      folder: p.data.folder || 'General',
      uploaded_by: admin.userId,
    })
    .select('*')
    .single()
  if (error || !data) {
    await sb.storage.from(MEDIA_BUCKET).remove([p.data.path])
    return { ok: false, error: friendlyDbError(error?.message) }
  }
  return { ok: true, asset: data as MediaAsset }
}

export async function updateMedia(
  id: string,
  fields: { alt_text?: string; caption?: string; folder?: string },
): Promise<ActionResult> {
  await requireAdmin()
  const clean = z
    .object({ alt_text: z.string().max(300).optional(), caption: z.string().max(500).optional(), folder: z.string().min(1).max(60).optional() })
    .safeParse(fields)
  if (!clean.success) return { ok: false, error: 'Please keep alt text under 300 and captions under 500 characters.' }
  const sb = await createSupabaseServer()
  const { error } = await sb.from('media_assets').update(clean.data).eq('id', id)
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  revalidatePath('/', 'layout')
  return { ok: true }
}

/** Swap the file behind an asset. Every page using it shows the new file. */
export async function replaceMedia(
  id: string,
  input: z.input<typeof uploadSchema>,
): Promise<ActionResult<{ asset: MediaAsset }>> {
  await requireAdmin()
  const p = uploadSchema.safeParse(input)
  if (!p.success) return { ok: false, error: 'The upload details were not valid. Please try again.' }
  const sb = await createSupabaseServer()
  const bad = checkFile(p.data.mime, p.data.size)
  const { data: old } = await sb.from('media_assets').select('storage_path, type').eq('id', id).single()
  if (!old) return { ok: false, error: 'This file no longer exists in the library.' }
  const newType = p.data.mime.startsWith('video/') ? 'video' : 'image'
  if (bad || newType !== old.type) {
    await sb.storage.from(MEDIA_BUCKET).remove([p.data.path])
    return { ok: false, error: bad ?? `Replace a ${old.type} with another ${old.type}.` }
  }
  const url = sb.storage.from(MEDIA_BUCKET).getPublicUrl(p.data.path).data.publicUrl
  const { data, error } = await sb
    .from('media_assets')
    .update({
      storage_path: p.data.path,
      url,
      mime: p.data.mime,
      size_bytes: p.data.size,
      width: p.data.width,
      height: p.data.height,
      duration: p.data.duration,
      is_sample: false,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) {
    await sb.storage.from(MEDIA_BUCKET).remove([p.data.path])
    return { ok: false, error: friendlyDbError(error?.message) }
  }
  if (old.storage_path) await sb.storage.from(MEDIA_BUCKET).remove([old.storage_path])
  revalidatePath('/', 'layout')
  return { ok: true, asset: data as MediaAsset }
}

export interface MediaUsage {
  content_type: string
  item_id: string
  label: string
  in_published: boolean
  in_draft: boolean
}

export async function getMediaUsage(id: string): Promise<MediaUsage[]> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb.rpc('media_usage', { p_id: id })
  return (data ?? []) as MediaUsage[]
}

/** Delete a file. Refuses when live pages use it, unless `force` is set. */
export async function deleteMedia(id: string, force = false): Promise<ActionResult<{ usage?: MediaUsage[] }>> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const usage = await getMediaUsage(id)
  if (usage.some((u) => u.in_published) && !force) {
    return { ok: false, error: 'This file is used on the live website. Remove it from those pages first, or confirm to delete anyway.' }
  }
  const { data: row } = await sb.from('media_assets').select('storage_path').eq('id', id).single()
  if (!row) return { ok: false, error: 'This file was already deleted.' }
  if (row.storage_path) {
    const { error: se } = await sb.storage.from(MEDIA_BUCKET).remove([row.storage_path])
    if (se) return { ok: false, error: friendlyDbError(se.message) }
  }
  const { error } = await sb.from('media_assets').delete().eq('id', id)
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function listMedia(): Promise<MediaAsset[]> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb.from('media_assets').select('*').order('created_at', { ascending: false }).limit(1000)
  return (data ?? []) as MediaAsset[]
}
