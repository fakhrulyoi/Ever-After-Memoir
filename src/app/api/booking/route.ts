import { NextResponse, type NextRequest } from 'next/server'
import { bookingRange, bookingSchema, dayState, fillMessage, isBookable, openSlots } from '@/lib/booking'
import { DEFAULT_SETTINGS } from '@/lib/content/defaults'
import { normalize } from '@/lib/content/schemas'
import type { AvailabilityDay } from '@/lib/content/types'
import { formatLong } from '@/lib/dates'
import { localize, t, type Lang } from '@/lib/i18n'
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
    return json({ ok: false, error: t('en', 'api.origin') }, 403)
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: t('en', 'api.unreadable') }, 400)
  }
  const lang: Lang = (body as { lang?: string } | null)?.lang === 'ms' ? 'ms' : 'en'
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return json({ ok: false, error: t(lang, 'api.check'), fieldErrors: fieldErrors(parsed.error as never) }, 422)
  }
  const d = parsed.data
  if (d.website || Date.now() - d.startedAt < 2500) return json({ ok: true, whatsappUrl: null, ref: '' })

  const sb = createServiceClient()
  if (!sb) return json({ ok: false, error: t(lang, 'api.notConnected') }, 503)

  // Read the live settings and the date's status fresh, never from cache
  const [{ data: settingsRow }, { data: dayRow }] = await Promise.all([
    sb.from('site_settings').select('published').eq('status', 'published').limit(1).maybeSingle(),
    sb.from('availability').select('*').eq('day', d.date).maybeSingle(),
  ])
  const settings = localize(normalize('site_settings', settingsRow?.published, DEFAULT_SETTINGS), lang)
  if (!settings.bookingEnabled) return json({ ok: false, error: t(lang, 'api.paused') }, 409)

  const row = dayRow ? ({ day: d.date, status: dayRow.status, slot: dayRow.slot ?? null } as AvailabilityDay) : undefined
  const map = new Map<string, AvailabilityDay>(row ? [[d.date, row]] : [])
  const state = dayState(d.date, map, bookingRange({ leadDays: settings.bookingLeadDays, monthsAhead: settings.bookingMonthsAhead }))
  if (!isBookable(state)) {
    return json({ ok: false, error: t(lang, state === 'outside' ? 'api.outside' : 'api.taken') }, 409)
  }
  if (!openSlots(row).includes(d.slot)) {
    return json({ ok: false, error: t(lang, 'api.slotTaken'), fieldErrors: { slot: 'api.slotTaken' } }, 409)
  }

  const wa = settings.whatsappNumber
  if (!wa && !d.email) {
    return json({ ok: false, error: t(lang, 'err.emailNeeded'), fieldErrors: { email: 'err.emailNeeded' } }, 422)
  }

  const hash = ipHash(req)
  const limited = await overLimit(sb, hash)
  if (limited === 'error') return json({ ok: false, error: t(lang, 'api.retry') }, 500)
  if (limited) return json({ ok: false, error: t(lang, 'api.limit') }, 429)

  const slotLabel = t(lang, d.slot === 'day' ? 'slot.day' : 'slot.night')
  const base = {
    source: 'booking',
    full_name: d.fullName,
    email: d.email.toLowerCase(),
    wedding_date: d.date,
    location: d.location,
    consent: d.consent,
    ip_hash: hash,
  }
  let { data: inserted, error } = await sb
    .from('inquiries')
    .insert({ ...base, slot: d.slot, cover_time: d.coverTime, instagram: d.instagram })
    .select('id')
    .single()
  // Databases without the slot columns yet (before 0005_slots.sql): keep the details in the notes
  if (error && /slot|cover_time|instagram/.test(error.message)) {
    ;({ data: inserted, error } = await sb
      .from('inquiries')
      .insert({ ...base, notes: [`Slot: ${slotLabel}`, `Cover time: ${d.coverTime}`, d.instagram && `Instagram: ${d.instagram}`].filter(Boolean).join('\n') })
      .select('id')
      .single())
  }
  if (error || !inserted) {
    console.error('booking insert failed', error?.message)
    return json({ ok: false, error: t(lang, 'api.retry') }, 500)
  }
  await recordHit(sb, hash)

  const ref = inserted.id.slice(0, 8).toUpperCase()
  const fallback = lang === 'ms' ? DEFAULT_SETTINGS.ms?.bookingMessage : DEFAULT_SETTINGS.bookingMessage
  const message = fillMessage(settings.bookingMessage || fallback || DEFAULT_SETTINGS.bookingMessage, {
    date: formatLong(d.date, lang),
    date_en: formatLong(d.date),
    name: d.fullName,
    slot: slotLabel,
    location: d.location,
    time: d.coverTime,
    instagram: d.instagram,
    ref,
  }, lang === 'ms'
    ? [['name', 'Nama'], ['date', 'Tarikh'], ['slot', 'Slot'], ['location', 'Tempat'], ['time', 'Cover time'], ['instagram', 'IG pengantin']]
    : [['name', 'Name'], ['date', 'Date'], ['slot', 'Slot'], ['location', 'Location'], ['time', 'Cover time'], ['instagram', 'Instagram']])
  await notifyOwner(
    { Date: formatLong(d.date), Slot: d.slot === 'day' ? 'Day' : 'Night', Name: d.fullName, Location: d.location, 'Cover time': d.coverTime, Instagram: d.instagram, Email: d.email, Reference: ref },
    { id: inserted.id, subject: `New booking — ${formatLong(d.date)}, ${d.slot === 'day' ? 'day' : 'night'} (${d.fullName})`, replyTo: d.email || undefined },
  ).catch((e) => console.error('notification email failed', e))
  return json({ ok: true, ref, whatsappUrl: wa ? waLink(wa, message) : null })
}
