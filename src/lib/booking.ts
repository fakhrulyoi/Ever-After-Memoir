import { z } from 'zod'
import type { AvailabilityStatus } from './content/types'
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

export function dayState(iso: string, map: Map<string, AvailabilityStatus>, range: { first: string; last: string }): DayState {
  if (iso < range.first || iso > range.last) return 'outside'
  return map.get(iso) ?? 'available'
}

export const isBookable = (s: DayState) => s === 'available' || s === 'limited'

export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'err.calendarDate'),
  fullName: z.string().trim().min(1, 'err.name').max(120, 'err.nameLong'),
  partnerName: z.string().trim().max(120, 'err.long').default(''),
  celebrationType: z.string().trim().min(1, 'err.type').max(80),
  serviceInterest: z.string().trim().min(1, 'err.service').max(120),
  location: z.string().trim().min(1, 'err.location').max(200),
  notes: z.string().trim().max(1000, 'err.notes').default(''),
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
  partner: string
  type: string
  service: string
  location: string
  notes: string
  ref: string
}

/** Fill the owner's WhatsApp template. Lines whose placeholders are all empty are dropped. */
export function fillMessage(template: string, v: MessageValues) {
  const lines = template.split('\n')
  const out: string[] = []
  for (const line of lines) {
    const keys = [...line.matchAll(/\{(\w+)\}/g)].map((m) => m[1] as keyof MessageValues)
    if (keys.length && keys.every((k) => !(v[k] ?? '').trim())) continue
    out.push(line.replace(/\{(\w+)\}/g, (_, k: keyof MessageValues) => (v[k] ?? '').trim()))
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
