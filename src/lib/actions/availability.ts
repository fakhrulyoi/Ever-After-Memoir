'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import type { AvailabilityStatus } from '../content/types'
import { friendlyDbError, type ActionResult } from './result'

export interface AdminDay {
  day: string
  status: AvailabilityStatus
  note: string
}

export interface DayInquiry {
  id: string
  wedding_date: string
  full_name: string
  partner_name: string
  status: string
  source: string
}

const dayRe = /^\d{4}-\d{2}-\d{2}$/

export async function loadAvailability(from: string, to: string): Promise<{ days: AdminDay[]; inquiries: DayInquiry[] }> {
  await requireAdmin()
  if (!dayRe.test(from) || !dayRe.test(to)) return { days: [], inquiries: [] }
  const sb = await createSupabaseServer()
  const [{ data: days }, { data: inquiries }] = await Promise.all([
    sb.from('availability').select('day, status, note').gte('day', from).lte('day', to).order('day'),
    sb
      .from('inquiries')
      .select('id, wedding_date, full_name, partner_name, status, source')
      .gte('wedding_date', from)
      .lte('wedding_date', to)
      .neq('status', 'closed')
      .order('created_at'),
  ])
  return { days: (days ?? []) as AdminDay[], inquiries: (inquiries ?? []) as DayInquiry[] }
}

const input = z.object({
  days: z.array(z.string().regex(dayRe)).min(1).max(400),
  status: z.enum(['available', 'booked', 'limited', 'unavailable']),
  note: z.string().max(300).default(''),
})

/** Set one or more dates. "available" removes the mark. */
export async function setAvailability(days: string[], status: AvailabilityStatus | 'available', note = ''): Promise<ActionResult> {
  const admin = await requireAdmin()
  const p = input.safeParse({ days, status, note })
  if (!p.success) return { ok: false, error: 'Those dates could not be saved. Please try again.' }
  const sb = await createSupabaseServer()
  const { error } =
    p.data.status === 'available'
      ? await sb.from('availability').delete().in('day', p.data.days)
      : await sb
          .from('availability')
          .upsert(p.data.days.map((day) => ({ day, status: p.data.status, note: p.data.note, updated_by: admin.userId })), { onConflict: 'day' })
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  revalidatePath('/', 'layout')
  return { ok: true }
}
