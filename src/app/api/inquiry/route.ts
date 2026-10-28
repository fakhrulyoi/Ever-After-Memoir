import { NextResponse, type NextRequest } from 'next/server'
import { fieldErrors, inquirySchema } from '@/lib/inquiry'
import { createServiceClient } from '@/lib/supabase/service'
import { ipHash, overLimit, recordHit } from '@/lib/ratelimit'
import { notifyOwner } from '@/lib/notify'
import { SITE_URL } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIN_FILL_MS = 3000

const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(req: NextRequest) {
  // Only accept submissions from this website
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url).origin && origin !== SITE_URL) {
    return json({ ok: false, error: 'This form can only be sent from the website.' }, 403)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Your inquiry could not be read. Please try again.' }, 400)
  }
  if (typeof body === 'object' && body && JSON.stringify(body).length > 20000) {
    return json({ ok: false, error: 'Your message is too long.' }, 413)
  }

  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    return json({ ok: false, error: 'Please check the highlighted fields.', fieldErrors: fieldErrors(parsed.error) }, 422)
  }
  const d = parsed.data

  // Spam traps: bots fill the hidden field or submit instantly. Pretend success.
  if (d.website || Date.now() - d.startedAt < MIN_FILL_MS) return json({ ok: true })

  const supabase = createServiceClient()
  if (!supabase) {
    return json({ ok: false, error: 'The inquiry form is not connected yet. Please contact us on Instagram or TikTok for now.' }, 503)
  }
  const hash = ipHash(req)
  const limited = await overLimit(supabase, hash)
  if (limited === 'error') return json({ ok: false, error: 'Your inquiry was not sent. Please try again in a few minutes.' }, 500)
  if (limited) {
    return json({ ok: false, error: 'You have sent several inquiries already. Please wait an hour, or message us on Instagram.' }, 429)
  }

  const { data: row, error } = await supabase
    .from('inquiries')
    .insert({
      full_name: d.fullName,
      partner_name: d.partnerName,
      email: d.email.toLowerCase(),
      whatsapp: d.whatsapp,
      wedding_date: d.weddingDate,
      location: d.location,
      celebration_type: d.celebrationType,
      service_interest: d.serviceInterest,
      budget: d.budget,
      notes: d.notes,
      consent: d.consent,
      ip_hash: hash,
    })
    .select('id')
    .single()

  if (error || !row) {
    console.error('inquiry insert failed', error?.message)
    return json({ ok: false, error: 'Your inquiry was not sent. Please try again in a few minutes.' }, 500)
  }

  await recordHit(supabase, hash)

  await notifyOwner(
    {
      Name: d.fullName,
      Partner: d.partnerName,
      Email: d.email,
      WhatsApp: d.whatsapp,
      'Wedding date': d.weddingDate,
      Location: d.location,
      Celebration: d.celebrationType,
      Service: d.serviceInterest,
      Budget: d.budget,
      Notes: d.notes,
    },
    { id: row.id, subject: `New inquiry — ${d.fullName} (${d.weddingDate})`, replyTo: d.email },
  ).catch((e) => console.error('notification email failed', e))
  return json({ ok: true })
}
