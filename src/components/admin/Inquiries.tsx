'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  addInquiryNote,
  deleteInquiry,
  deleteInquiryNote,
  purgeClosedInquiries,
  setInquiryStatus,
  type InquiryNote,
  type InquiryStatus,
} from '@/lib/actions/inquiries'
import type { InquiryRow } from '@/lib/data/admin'
import { formatDate, waLink } from '@/lib/text'
import { Button, Confirm, EmptyState, formatWhen, inputClass } from './ui'

const STATUS: Record<InquiryStatus, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-olive-deep text-ivory' },
  contacted: { label: 'Contacted', cls: 'bg-[#efe3c8] text-[#6b4f1d]' },
  booked: { label: 'Booked', cls: 'bg-[#e2e7d8] text-success' },
  closed: { label: 'Closed', cls: 'bg-cream text-ink-soft' },
}

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS[status].cls}`}>{STATUS[status].label}</span>
}

function csv(rows: InquiryRow[]) {
  const cols: (keyof InquiryRow)[] = ['created_at', 'status', 'full_name', 'partner_name', 'email', 'whatsapp', 'wedding_date', 'location', 'celebration_type', 'service_interest', 'budget', 'notes']
  const esc = (v: unknown) => {
    const s = String(v ?? '')
    // Prevent spreadsheet formula injection
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return `"${safe.replace(/"/g, '""')}"`
  }
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
}

export function InquiryInbox({ rows, retentionMonths }: { rows: InquiryRow[]; retentionMonths: number }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | InquiryStatus>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [purging, setPurging] = useState(false)
  const [confirmPurge, setConfirmPurge] = useState(false)

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== 'all' && r.status !== status) return false
        if (from && (r.wedding_date ?? '') < from) return false
        if (to && (r.wedding_date ?? '9999') > to) return false
        if (!query) return true
        const q = query.toLowerCase()
        return [r.full_name, r.partner_name, r.email, r.location, r.whatsapp, r.notes].some((v) => v.toLowerCase().includes(q))
      }),
    [rows, status, from, to, query],
  )

  const exportCsv = () => {
    const blob = new Blob([csv(filtered)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const purge = async () => {
    setPurging(true)
    const res = await purgeClosedInquiries(retentionMonths)
    setPurging(false)
    setConfirmPurge(false)
    if (!res.ok) return toast.error(res.error)
    toast.success(`${res.deleted} closed ${res.deleted === 1 ? 'inquiry' : 'inquiries'} deleted`)
    router.refresh()
  }

  const counts = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {} as Record<string, number>)

  if (rows.length === 0)
    return <EmptyState title="No inquiries yet" body="When a couple sends the form on your Contact page, it appears here straight away." action={<a className="text-sm underline" href="/contact" target="_blank" rel="noreferrer">Open the contact page</a>} />

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(['all', 'new', 'contacted', 'booked', 'closed'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${status === s ? 'border-olive-deep bg-olive-deep text-ivory' : 'border-charcoal/15 hover:border-olive-deep'}`}
          >
            {s === 'all' ? `All (${rows.length})` : `${STATUS[s].label} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="block text-xs font-semibold">Search</span>
          <input className={`${inputClass} !w-64`} placeholder="Name, email, location…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-semibold">Wedding date from</span>
          <input type="date" className={`${inputClass} !w-44`} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-semibold">to</span>
          <input type="date" className={`${inputClass} !w-44`} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <span className="flex-1" />
        <Button onClick={exportCsv}>Download CSV</Button>
        {retentionMonths > 0 && <Button variant="ghost" onClick={() => setConfirmPurge(true)}>Clean up old closed inquiries</Button>}
      </div>

      <div className="overflow-x-auto border-y border-charcoal/10">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="text-xs text-ink-soft">
            <tr>
              <th className="py-3 pr-3 font-semibold">Couple</th>
              <th className="py-3 pr-3 font-semibold">Wedding</th>
              <th className="py-3 pr-3 font-semibold">Service</th>
              <th className="py-3 pr-3 font-semibold">Status</th>
              <th className="py-3 font-semibold">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-cream/50">
                <td className="py-3 pr-3">
                  <Link href={`/admin/inquiries/${r.id}`} className="flex items-center gap-2 font-semibold hover:underline">
                    {r.status === 'new' && <span className="h-2 w-2 rounded-full bg-olive" aria-label="Unread" />}
                    {r.full_name}{r.partner_name && ` & ${r.partner_name}`}
                  </Link>
                  <span className="text-xs text-ink-soft">{r.source === 'booking' ? 'Booking calendar → WhatsApp' : r.email}</span>
                </td>
                <td className="py-3 pr-3">{r.wedding_date ? formatDate(r.wedding_date) : '—'}<br /><span className="text-xs text-ink-soft">{r.location}</span></td>
                <td className="py-3 pr-3">{r.service_interest}<br /><span className="text-xs text-ink-soft">{r.celebration_type}</span></td>
                <td className="py-3 pr-3"><StatusBadge status={r.status} /></td>
                <td className="py-3 text-xs text-ink-soft">{formatWhen(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-ink-soft">No inquiries match these filters.</p>}
      </div>

      <Confirm
        open={confirmPurge}
        danger
        busy={purging}
        title="Delete old closed inquiries?"
        body={`Closed inquiries older than ${retentionMonths} months will be permanently deleted.`}
        confirmLabel="Delete them"
        onConfirm={purge}
        onCancel={() => setConfirmPurge(false)}
      />
    </div>
  )
}

export function InquiryDetail({ inquiry, notes: initialNotes }: { inquiry: InquiryRow & { consent?: boolean }; notes: InquiryNote[] }) {
  const router = useRouter()
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status)
  const [notes, setNotes] = useState(initialNotes)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const changeStatus = async (s: InquiryStatus) => {
    const prev = status
    setStatus(s)
    const res = await setInquiryStatus(inquiry.id, s)
    if (!res.ok) {
      setStatus(prev)
      return toast.error(res.error)
    }
    toast.success(
      res.dateMarked
        ? `Marked as booked — ${formatDate(res.dateMarked)} is now closed on your booking calendar`
        : `Marked as ${STATUS[s].label.toLowerCase()}`,
    )
    router.refresh()
  }

  const add = async () => {
    setSaving(true)
    const res = await addInquiryNote(inquiry.id, note)
    setSaving(false)
    if (!res.ok) return toast.error(res.error)
    setNotes([...notes, res.note])
    setNote('')
  }
  const removeNote = async (id: string) => {
    const res = await deleteInquiryNote(id)
    if (!res.ok) return toast.error(res.error)
    setNotes(notes.filter((n) => n.id !== id))
  }
  const remove = async () => {
    const res = await deleteInquiry(inquiry.id)
    if (!res.ok) return toast.error(res.error)
    toast.success('Inquiry deleted')
    router.push('/admin/inquiries')
    router.refresh()
  }

  const subject = `Your wedding on ${inquiry.wedding_date ? formatDate(inquiry.wedding_date) : 'your big day'} — Ever After Memoir`
  const wa = waLink(inquiry.whatsapp, `Hi ${inquiry.full_name}, thank you for your inquiry with Ever After Memoir!`)
  const rows: [string, string][] = [
    ['Came from', inquiry.source === 'booking' ? 'Booking calendar (continued on WhatsApp)' : 'Inquiry form'],
    ['Name', inquiry.full_name],
    ['Partner', inquiry.partner_name],
    ['Email', inquiry.email],
    ['WhatsApp', inquiry.whatsapp],
    ['Wedding date', inquiry.wedding_date ? formatDate(inquiry.wedding_date) : ''],
    ['Location or venue', inquiry.location],
    ['Type of celebration', inquiry.celebration_type],
    ['Service', inquiry.service_interest],
    ['Budget', inquiry.budget],
  ]

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-8">
        <dl className="grid gap-x-8 gap-y-5 border-y border-charcoal/10 py-6 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold text-ink-soft">{k}</dt>
              <dd className="mt-0.5 text-[0.9375rem]">{v || '—'}</dd>
            </div>
          ))}
        </dl>
        <div>
          {inquiry.source === 'booking' && !inquiry.whatsapp && (
          <p className="border-l-2 border-sage bg-cream px-3 py-2 text-sm">This couple was sent to WhatsApp to finish booking. Look for their message there — it includes reference <strong>{inquiry.id.slice(0, 8).toUpperCase()}</strong>.</p>
        )}
        <h2 className="mb-2 text-xs font-semibold text-ink-soft">Their notes</h2>
          <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{inquiry.notes || '—'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {inquiry.email && (
            <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`} className="inline-flex min-h-10 items-center rounded-[2px] bg-olive-deep px-4 text-[0.8125rem] font-semibold text-ivory hover:bg-olive">Reply by email</a>
          )}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-[2px] border border-charcoal/20 px-4 text-[0.8125rem] font-semibold hover:border-olive-deep">Message on WhatsApp</a>}
        </div>
      </div>
      <aside className="space-y-6">
        <div className="border border-charcoal/10 bg-white/55 p-5">
          <label htmlFor="inq-status" className="text-[0.8125rem] font-semibold">Status</label>
          <select id="inq-status" className={`${inputClass} mt-2`} value={status} onChange={(e) => changeStatus(e.target.value as InquiryStatus)}>
            {(Object.keys(STATUS) as InquiryStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
          <p className="mt-3 text-xs text-ink-soft">Received {formatWhen(inquiry.created_at)}</p>
        </div>
        <div className="border border-charcoal/10 bg-white/55 p-5">
          <h2 className="text-[0.8125rem] font-semibold">Private notes</h2>
          <p className="text-xs text-ink-soft">Only admins can see these.</p>
          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="border-l-2 border-sage pl-3 text-sm">
                <p className="whitespace-pre-wrap">{n.note}</p>
                <p className="mt-1 flex justify-between text-xs text-ink-soft">
                  {formatWhen(n.created_at)}
                  <button type="button" className="hover:text-danger" onClick={() => removeNote(n.id)}>Delete</button>
                </p>
              </li>
            ))}
          </ul>
          <label htmlFor="inq-note" className="sr-only">New note</label>
          <textarea id="inq-note" rows={3} className={`${inputClass} mt-4`} placeholder="e.g. Called on Tuesday, sending quote" value={note} onChange={(e) => setNote(e.target.value)} maxLength={4000} />
          <Button variant="primary" className="mt-2 w-full" busy={saving} disabled={!note.trim()} onClick={add}>Add note</Button>
        </div>
        <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>Delete inquiry</Button>
      </aside>
      <Confirm
        open={confirmDelete}
        danger
        title="Delete this inquiry?"
        body="The inquiry and its private notes will be permanently deleted."
        confirmLabel="Delete permanently"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
