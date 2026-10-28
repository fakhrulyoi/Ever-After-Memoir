import { createHash } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { fieldErrors, inquirySchema } from '@/lib/inquiry'
import { createServiceClient } from '@/lib/supabase/service'
import { SITE_URL } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_PER_HOUR = 5
const MIN_FILL_MS = 3000

function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

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

  const salt = process.env.INQUIRY_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const ipHash = createHash('sha256').update(`${salt}:${clientIp(req)}`).digest('hex')

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countError } = await supabase
    .from('inquiry_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)
  if (countError) {
    console.error('rate limit check failed', countError.message)
    return json({ ok: false, error: 'Your inquiry was not sent. Please try again in a few minutes.' }, 500)
  }
  if ((count ?? 0) >= MAX_PER_HOUR) {
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
      ip_hash: ipHash,
    })
    .select('id')
    .single()

  if (error || !row) {
    console.error('inquiry insert failed', error?.message)
    return json({ ok: false, error: 'Your inquiry was not sent. Please try again in a few minutes.' }, 500)
  }

  await supabase.from('inquiry_rate_limits').insert({ ip_hash: ipHash })
  // Housekeeping: forget rate-limit entries older than a day
  await supabase.from('inquiry_rate_limits').delete().lt('created_at', new Date(Date.now() - 86400000).toISOString())

  await notifyOwner(d, row.id).catch((e) => console.error('notification email failed', e))
  return json({ ok: true })
}

async function notifyOwner(d: ReturnType<typeof inquirySchema.parse>, id: string) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.INQUIRY_NOTIFY_EMAIL
  const from = process.env.RESEND_FROM || 'Ever After Memoir <onboarding@resend.dev>'
  if (!key || !to) return
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
  const rows: [string, string][] = [
    ['Name', d.fullName],
    ['Partner', d.partnerName],
    ['Email', d.email],
    ['WhatsApp', d.whatsapp],
    ['Wedding date', d.weddingDate],
    ['Location', d.location],
    ['Celebration', d.celebrationType],
    ['Service', d.serviceInterest],
    ['Budget', d.budget],
    ['Notes', d.notes],
  ]
  const html = `<div style="font-family:Georgia,serif;color:#282923"><h2 style="font-weight:400">New wedding inquiry</h2><table cellpadding="6">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#606B4F;vertical-align:top">${k}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table><p><a href="${SITE_URL}/admin/inquiries/${id}">Open in admin</a></p></div>`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: d.email, subject: `New inquiry — ${d.fullName} (${d.weddingDate})`, html }),
  })
  if (!res.ok) throw new Error(`Resend responded ${res.status}`)
}
