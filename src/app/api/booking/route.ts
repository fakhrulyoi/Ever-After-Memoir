import { NextResponse, type NextRequest } from 'next/server'
import { bookingRange, bookingSchema, dayState, fillMessage, isBookable } from '@/lib/booking'
import { DEFAULT_SETTINGS } from '@/lib/content/defaults'
import { normalize } from '@/lib/content/schemas'
import type { AvailabilityStatus } from '@/lib/content/types'
import { formatLong, formatLongMs } from '@/lib/dates'
import { SITE_URL } from '@/lib/env'
import { fieldErrors } from '@/lib/inquiry'
import { ipHash, overLimit, recordHit } from '@/lib/ratelimit'
import { createServiceClient } from '@/lib/supabase/service'
import { notifyOwner } from '@/lib/notify'
import { waLink } from '@/lib/text'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin && origin !== SITE_URL) {
    return json({ ok: false, error: 'Bookings can only be sent from the website.' }, 403)
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Your booking could not be read. Please try again.' }, 400)
  }
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return json({ ok: false, error: 'Please check the highlighted fields.', fieldErrors: fieldErrors(parsed.error as never) }, 422)
  }
  const d = parsed.data
  if (d.website || Date.now() - d.startedAt < 2500) return json({ ok: true, whatsappUrl: null, ref: '' })

  const sb = createServiceClient()
  if (!sb) return json({ ok: false, error: 'Booking is not connected yet. Please message us on Instagram or TikTok for now.' }, 503)

  // Read the live settings and the date's status fresh, never from cache
  const [{ data: settingsRow }, { data: dayRow }] = await Promise.all([
    sb.from('site_settings').select('published').eq('status', 'published').limit(1).maybeSingle(),
    sb.from('availability').select('status').eq('day', d.date).maybeSingle(),
  ])
  const settings = normalize('site_settings', settingsRow?.published, DEFAULT_SETTINGS)
  if (!settings.bookingEnabled) return json({ ok: false, error: 'Online booking is paused right now. Please send an inquiry instead.' }, 409)

  const map = new Map<string, AvailabilityStatus>(dayRow ? [[d.date, dayRow.status as AvailabilityStatus]] : [])
  const state = dayState(d.date, map, bookingRange({ leadDays: settings.bookingLeadDays, monthsAhead: settings.bookingMonthsAhead }))
  if (!isBookable(state)) {
    return json({ ok: false, error: state === 'outside' ? 'That date can’t be booked online. Please choose another date.' : 'Sorry — that date was just booked. Please choose another one.' }, 409)
  }

  const wa = settings.whatsappNumber
  if (!wa && !d.email) {
    return json({ ok: false, error: 'Please add your email so we can reply.', fieldErrors: { email: 'Please add your email so we can reply' } }, 422)
  }

  const hash = ipHash(req)
  const limited = await overLimit(sb, hash)
  if (limited === 'error') return json({ ok: false, error: 'Your booking was not sent. Please try again in a few minutes.' }, 500)
  if (limited) return json({ ok: false, error: 'You have sent several requests already. Please wait an hour, or message us on Instagram.' }, 429)

  const { data: row, error } = await sb
    .from('inquiries')
    .insert({
      source: 'booking',
      full_name: d.fullName,
      partner_name: d.partnerName,
      email: d.email.toLowerCase(),
      wedding_date: d.date,
      location: d.location,
      celebration_type: d.celebrationType,
      service_interest: d.serviceInterest,
      notes: d.notes,
      consent: d.consent,
      ip_hash: hash,
    })
    .select('id')
    .single()
  if (error || !row) {
    console.error('booking insert failed', error?.message)
    return json({ ok: false, error: 'Your booking was not sent. Please try again in a few minutes.' }, 500)
  }
  await recordHit(sb, hash)

  const ref = row.id.slice(0, 8).toUpperCase()
  const message = fillMessage(settings.bookingMessage || DEFAULT_SETTINGS.bookingMessage, {
    date: formatLongMs(d.date),
    date_en: formatLong(d.date),
    name: d.fullName,
    partner: d.partnerName,
    type: d.celebrationType,
    service: d.serviceInterest,
    location: d.location,
    notes: d.notes,
    ref,
  })
  await notifyOwner(
    { Date: formatLong(d.date), Name: d.fullName, Partner: d.partnerName, Email: d.email, Location: d.location, Celebration: d.celebrationType, Service: d.serviceInterest, Notes: d.notes, Reference: ref },
    { id: row.id, subject: `New booking request — ${formatLong(d.date)} (${d.fullName})`, replyTo: d.email || undefined },
  ).catch((e) => console.error('notification email failed', e))
  return json({ ok: true, ref, whatsappUrl: wa ? waLink(wa, message) : null })
}
