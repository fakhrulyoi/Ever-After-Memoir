'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import { friendlyDbError, type ActionResult } from './result'

const STATUSES = ['new', 'contacted', 'booked', 'closed'] as const
export type InquiryStatus = (typeof STATUSES)[number]

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult<{ dateMarked?: string }>> {
  const admin = await requireAdmin()
  if (!STATUSES.includes(status)) return { ok: false, error: 'Unknown status.' }
  const sb = await createSupabaseServer()
  const { data, error } = await sb.from('inquiries').update({ status }).eq('id', id).select('wedding_date, full_name, partner_name').single()
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  // Booking confirmed: close that date on the public calendar (unless already marked)
  let dateMarked: string | undefined
  if (status === 'booked' && data?.wedding_date) {
    const { data: existing } = await sb.from('availability').select('status').eq('day', data.wedding_date).maybeSingle()
    if (!existing || existing.status !== 'booked') {
      const who = [data.full_name, data.partner_name].filter(Boolean).join(' & ')
      const { error: e2 } = await sb
        .from('availability')
        .upsert({ day: data.wedding_date, status: 'booked', note: `Booked: ${who}`.slice(0, 300), updated_by: admin.userId }, { onConflict: 'day' })
      if (!e2) {
        dateMarked = data.wedding_date
        revalidatePath('/', 'layout')
      }
    }
  }
  revalidatePath('/admin/inquiries')
  return { ok: true, dateMarked }
}

export interface InquiryNote {
  id: string
  note: string
  created_at: string
}

export async function addInquiryNote(id: string, note: string): Promise<ActionResult<{ note: InquiryNote }>> {
  const admin = await requireAdmin()
  const text = note.trim()
  if (!text) return { ok: false, error: 'Write a note first.' }
  if (text.length > 4000) return { ok: false, error: 'Notes can be up to 4,000 characters.' }
  const sb = await createSupabaseServer()
  const { data, error } = await sb
    .from('inquiry_notes')
    .insert({ inquiry_id: id, note: text, author_id: admin.userId })
    .select('id, note, created_at')
    .single()
  if (error || !data) return { ok: false, error: friendlyDbError(error?.message) }
  return { ok: true, note: data }
}

export async function deleteInquiryNote(noteId: string): Promise<ActionResult> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { error } = await sb.from('inquiry_notes').delete().eq('id', noteId)
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  return { ok: true }
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const sb = await createSupabaseServer()
  const { data, error } = await sb.from('inquiries').delete().eq('id', id).select('id')
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  if (!data?.length) return { ok: false, error: 'This inquiry was already deleted.' }
  await sb.from('audit_log').insert({ actor: admin.userId, action: 'delete', entity: 'inquiries', entity_id: id })
  revalidatePath('/admin/inquiries')
  return { ok: true }
}

export async function purgeClosedInquiries(months: number): Promise<ActionResult<{ deleted: number }>> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data, error } = await sb.rpc('purge_closed_inquiries', { p_months: months })
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  revalidatePath('/admin/inquiries')
  return { ok: true, deleted: Number(data ?? 0) }
}
