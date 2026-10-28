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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date on the calendar'),
  fullName: z.string().trim().min(1, 'Please tell us your name').max(120),
  partnerName: z.string().trim().max(120).default(''),
  celebrationType: z.string().trim().min(1, 'Choose the type of celebration').max(80),
  serviceInterest: z.string().trim().min(1, 'Choose a service — “Not sure yet” is fine').max(120),
  location: z.string().trim().min(1, 'Where is the wedding? A town or venue is fine').max(200),
  notes: z.string().trim().max(1000, 'Please keep this under 1,000 characters').default(''),
  email: z.string().trim().max(254).email('Please enter a valid email address').or(z.literal('')).default(''),
  consent: z.literal(true, { message: 'Please agree so we can keep your details to reply' }),
  website: z.string().max(500).default(''),
  startedAt: z.number().int().positive(),
})

export type BookingInput = z.input<typeof bookingSchema>

export interface MessageValues {
  /** Malay, e.g. Khamis, 5 November 2026 */
  date: string
  /** English, e.g. Thursday, 5 November 2026 */
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
