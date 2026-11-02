'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import { friendlyDbError, type ActionResult } from './result'

const STATUSES = ['new', 'contacted', 'booked', 'closed'] as const
export type InquiryStatus = (typeof STATUSES)[number]

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult<{ dateMarked?: string; slotMarked?: string }>> {
  const admin = await requireAdmin()
  if (!STATUSES.includes(status)) return { ok: false, error: 'Unknown status.' }
  const sb = await createSupabaseServer()
  const { data: row, error } = await sb.from('inquiries').update({ status }).eq('id', id).select('*').single()
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  const data = row as { wedding_date: string | null; full_name: string; partner_name: string; slot?: string | null }
  // Booking confirmed: take that slot (or the whole day) on the public calendar
  let dateMarked: string | undefined
  let slotMarked: string | undefined
  if (status === 'booked' && data?.wedding_date) {
    const { data: existing } = await sb.from('availability').select('*').eq('day', data.wedding_date).maybeSingle()
    const ex = existing as { status: string; slot?: string | null; note?: string } | null
    const who = [data.full_name, data.partner_name].filter(Boolean).join(' & ')
    const slot = data.slot === 'day' || data.slot === 'night' ? data.slot : null
    let next: { status: string; slot: string | null; note: string } | null = null
    if (!slot) {
      if (!ex || ex.status !== 'booked') next = { status: 'booked', slot: null, note: `Booked: ${who}` }
    } else if (!ex) {
      next = { status: 'limited', slot, note: `${slot === 'day' ? 'Day' : 'Night'}: ${who}` }
    } else if (ex.status === 'limited' && ex.slot && ex.slot !== slot) {
      next = { status: 'booked', slot: null, note: `${ex.note ?? ''} · ${slot === 'day' ? 'Day' : 'Night'}: ${who}` }
    } else if (ex.status === 'limited' && !ex.slot) {
      next = { status: 'booked', slot: null, note: `Booked: ${who}` }
    }
    if (next) {
      let { error: e2 } = await sb
        .from('availability')
        .upsert({ day: data.wedding_date, status: next.status, slot: next.slot, note: next.note.slice(0, 300), updated_by: admin.userId }, { onConflict: 'day' })
      // Before 0005_slots.sql there is no slot column: close the whole day
      if (e2 && /slot/.test(e2.message))
        ({ error: e2 } = await sb.from('availability').upsert({ day: data.wedding_date, status: 'booked', note: `Booked: ${who}`.slice(0, 300), updated_by: admin.userId }, { onConflict: 'day' }))
      if (!e2) {
        dateMarked = data.wedding_date
        slotMarked = next.status === 'limited' ? next.slot ?? undefined : undefined
        revalidatePath('/', 'layout')
      }
    }
  }
  revalidatePath('/admin/inquiries')
  return { ok: true, dateMarked, slotMarked }
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
