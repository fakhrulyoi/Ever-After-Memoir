import 'server-only'
import { SITE_URL } from './env'

/** Email the owner about a new inquiry or booking — only if Resend is configured. */
export async function notifyOwner(fields: Record<string, string>, opts: { id: string; subject: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.INQUIRY_NOTIFY_EMAIL
  const from = process.env.RESEND_FROM || 'Ever After Memoir <onboarding@resend.dev>'
  if (!key || !to) return
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#606B4F;vertical-align:top">${esc(k)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')
  const html = `<div style="font-family:Georgia,serif;color:#282923"><h2 style="font-weight:400">${esc(opts.subject)}</h2><table cellpadding="6">${rows}</table><p><a href="${SITE_URL}/admin/inquiries/${opts.id}">Open in admin</a></p></div>`
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], ...(opts.replyTo ? { reply_to: opts.replyTo } : {}), subject: opts.subject, html }),
  })
  if (!res.ok) throw new Error(`Resend responded ${res.status}`)
}
