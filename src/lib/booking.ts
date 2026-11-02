import { z } from 'zod'
import type { AvailabilityDay, Slot } from './content/types'
import { addDays, addMonths, todayISO } from './dates'

export interface BookingWindow {
  leadDays: number
  monthsAhead: number
}

/** First and last date couples may pick. */
export function bookingRange(w: BookingWindow, today = todayISO()) {
  return { first: addDays(today, w.leadDays), last: addMonths(today, w.monthsAhead) }
}

export type DayState = 'available' | 'limited' | 'booked' | 'unavailable' | 'outside'

export const SLOTS: Slot[] = ['day', 'night']

export function dayState(iso: string, map: Map<string, AvailabilityDay>, range: { first: string; last: string }): DayState {
  if (iso < range.first || iso > range.last) return 'outside'
  return map.get(iso)?.status ?? 'available'
}

export const isBookable = (s: DayState) => s === 'available' || s === 'limited'

/** Slots still open on a day (a "limited" day without a slot predates slots: both stay open). */
export function openSlots(row: AvailabilityDay | undefined): Slot[] {
  if (!row) return SLOTS
  if (row.status === 'booked' || row.status === 'unavailable') return []
  if (row.status === 'limited' && row.slot) return SLOTS.filter((s) => s !== row.slot)
  return SLOTS
}

export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'err.calendarDate'),
  slot: z.enum(['day', 'night'], { message: 'err.slot' }),
  fullName: z.string().trim().min(1, 'err.name').max(120, 'err.nameLong'),
  location: z.string().trim().min(1, 'err.location').max(200),
  coverTime: z.string().trim().min(1, 'err.coverTime').max(80, 'err.long'),
  instagram: z.string().trim().max(120, 'err.long').default(''),
  email: z.string().trim().max(254).email('err.email').or(z.literal('')).default(''),
  consent: z.literal(true, { message: 'err.consent' }),
  website: z.string().max(500).default(''),
  startedAt: z.number().int().positive(),
  lang: z.enum(['en', 'ms']).default('en'),
})

export type BookingInput = z.input<typeof bookingSchema>

export interface MessageValues {
  /** In the visitor's language, e.g. Thursday, 5 November 2026 / Khamis, 5 November 2026 */
  date: string
  /** Always English (kept for older message templates) */
  date_en: string
  name: string
  /** Day / Night (Siang / Malam) */
  slot: string
  location: string
  /** Cover time the couple typed, e.g. 11am – 4pm */
  time: string
  instagram: string
  ref: string
  // Older templates may still use these
  partner?: string
  type?: string
  service?: string
  notes?: string
}

/** Fill the owner's WhatsApp template. Lines whose placeholders are all empty are dropped. */
/**
 * Fill the owner's WhatsApp template. Details the template has no placeholder
 * for (e.g. an older, edited template) are added before the reference line, so
 * the owner always receives the full booking.
 */
export function fillMessage(template: string, v: MessageValues, required: [keyof MessageValues, string][] = []) {
  const lines = template.split('\n')
  const missing = required.filter(([k]) => !template.includes(`{${k}}`)).map(([k, label]) => `${label}: {${k}}`)
  if (missing.length) {
    const at = lines.findIndex((l) => l.includes('{ref}'))
    if (at === -1) lines.push('', ...missing)
    else lines.splice(at > 0 && !lines[at - 1].trim() ? at - 1 : at, 0, ...missing)
  }
  const out: string[] = []
  for (const line of lines) {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1] as keyof MessageValues)
    if (keys.length && keys.every((k) => !(v[k] ?? '').trim())) continue
    out.push(line.replace(/\{(\w+)\}/g, (_, k: keyof MessageValues) => (v[k] ?? '').trim()))
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
