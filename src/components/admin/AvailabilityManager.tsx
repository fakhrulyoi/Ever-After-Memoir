'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { setAvailability, type AdminDay, type DayInquiry } from '@/lib/actions/availability'
import type { AvailabilityStatus } from '@/lib/content/types'
import { addDays, addMonths, daysInMonth, formatLong, formatMonth, monthStart, todayISO, weekdayMon } from '@/lib/dates'
import { Button, inputClass } from './ui'

type Choice = AvailabilityStatus | 'available'

const STYLE: Record<Choice, { cell: string; label: string; dot: string }> = {
  available: { cell: 'bg-white/70 text-charcoal hover:border-olive-deep', label: 'Available', dot: 'bg-white border border-charcoal/25' },
  limited: { cell: 'bg-sage/45 text-olive-deep', label: 'Few slots left', dot: 'bg-sage' },
  booked: { cell: 'bg-olive-deep text-ivory', label: 'Booked', dot: 'bg-olive-deep' },
  unavailable: { cell: 'bg-[repeating-linear-gradient(135deg,#eeeae0_0,#eeeae0_4px,#e2dccf_4px,#e2dccf_8px)] text-ink-soft', label: 'Not available', dot: 'bg-taupe' },
}

export function AvailabilityManager({ initialDays, inquiries }: { initialDays: AdminDay[]; inquiries: DayInquiry[] }) {
  const today = todayISO()
  const [days, setDays] = useState(() => new Map(initialDays.map((d) => [d.day, d])))
  const [view, setView] = useState(monthStart(today))
  const [selected, setSelected] = useState<string[]>([])
  const [anchor, setAnchor] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState<Choice | null>(null)

  const byDate = useMemo(() => {
    const m = new Map<string, DayInquiry[]>()
    for (const i of inquiries) m.set(i.wedding_date, [...(m.get(i.wedding_date) ?? []), i])
    return m
  }, [inquiries])

  const months = [view, addMonths(view, 1), addMonths(view, 2)]
  const statusOf = (d: string): Choice => days.get(d)?.status ?? 'available'

  const click = (d: string, shift: boolean) => {
    if (shift && anchor) {
      const [a, b] = anchor < d ? [anchor, d] : [d, anchor]
      const range: string[] = []
      for (let x = a; x <= b; x = addDays(x, 1)) range.push(x)
      setSelected(range)
      return
    }
    setAnchor(d)
    setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d].sort()))
    if (selected.length === 0) setNote(days.get(d)?.note ?? '')
  }

  const apply = async (status: Choice) => {
    if (!selected.length) return
    setSaving(status)
    const res = await setAvailability(selected, status, note)
    setSaving(null)
    if (!res.ok) return toast.error(res.error)
    setDays((prev) => {
      const next = new Map(prev)
      for (const d of selected) {
        if (status === 'available') next.delete(d)
        else next.set(d, { day: d, status, note })
      }
      return next
    })
    toast.success(`${selected.length} ${selected.length === 1 ? 'date' : 'dates'} marked ${STYLE[status].label.toLowerCase()} — the calendar on the website is updated`)
    setSelected([])
  }

  const selInquiries = selected.flatMap((d) => byDate.get(d) ?? [])

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            <Button onClick={() => setView(addMonths(view, -1))} disabled={view <= monthStart(today)} aria-label="Previous months">←</Button>
            <Button onClick={() => setView(addMonths(view, 1))} aria-label="Next months">→</Button>
            <Button variant="ghost" onClick={() => setView(monthStart(today))}>This month</Button>
          </div>
          <ul className="flex flex-wrap gap-4 text-xs text-ink-soft">
            {(Object.keys(STYLE) as Choice[]).map((k) => (
              <li key={k} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-full ${STYLE[k].dot}`} />{STYLE[k].label}</li>
            ))}
            <li className="flex items-center gap-1.5"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#b98a2e] text-[0.5625rem] font-bold text-white">2</span>Open inquiries</li>
          </ul>
        </div>
        <p className="mb-5 text-xs text-ink-soft">Click dates to select them (hold Shift to select a range), then choose a status on the right.</p>
        <div className="grid gap-8 lg:grid-cols-3">
          {months.map((mo) => (
            <div key={mo}>
              <h2 className="display mb-3 text-2xl text-olive-deep">{formatMonth(mo)}</h2>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w, i) => <span key={i} className="text-[0.6875rem] font-semibold text-ink-soft" aria-hidden>{w}</span>)}
                {Array.from({ length: weekdayMon(mo) }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: daysInMonth(mo) }, (_, i) => addDays(mo, i)).map((d) => {
                  const st = statusOf(d)
                  const past = d < today
                  const count = byDate.get(d)?.length ?? 0
                  const sel = selected.includes(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      data-admin-day={d}
                      disabled={past}
                      onClick={(e) => click(d, e.shiftKey)}
                      aria-pressed={sel}
                      aria-label={`${formatLong(d)}: ${STYLE[st].label}${count ? `, ${count} open ${count === 1 ? 'inquiry' : 'inquiries'}` : ''}`}
                      title={days.get(d)?.note || undefined}
                      className={`relative flex aspect-square items-center justify-center rounded-[2px] border border-transparent text-[0.8125rem] tabular-nums transition-colors disabled:cursor-default disabled:opacity-35 ${STYLE[st].cell} ${sel ? 'ring-2 ring-[#b98a2e] ring-offset-1 ring-offset-ivory' : ''}`}
                    >
                      {Number(d.slice(8))}
                      {count > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b98a2e] px-1 text-[0.5625rem] font-bold text-white">{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="h-max space-y-5 border border-charcoal/10 bg-white/55 p-5 xl:sticky xl:top-6" aria-label="Set status">
        {selected.length === 0 ? (
          <>
            <h2 className="display text-2xl text-olive-deep">Choose dates</h2>
            <p className="text-sm text-ink-soft">
              Dates you don’t mark are shown as available. When you mark an inquiry as <strong>Booked</strong>, its date is closed here automatically.
            </p>
          </>
        ) : (
          <>
            <div>
              <h2 className="display text-2xl text-olive-deep">{selected.length === 1 ? formatLong(selected[0]) : `${selected.length} dates selected`}</h2>
              {selected.length > 1 && <p className="text-xs text-ink-soft">{formatLong(selected[0])} – {formatLong(selected[selected.length - 1])}</p>}
            </div>
            <label className="block space-y-1.5">
              <span className="block text-[0.8125rem] font-semibold">Private note (optional)</span>
              <input className={inputClass} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Aina & Hakim, Kuantan" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" busy={saving === 'booked'} onClick={() => apply('booked')}>Booked</Button>
              <Button busy={saving === 'limited'} onClick={() => apply('limited')}>Few slots left</Button>
              <Button busy={saving === 'unavailable'} onClick={() => apply('unavailable')}>Not available</Button>
              <Button busy={saving === 'available'} onClick={() => apply('available')}>Available</Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setSelected([])}>Clear selection</Button>
            {selInquiries.length > 0 && (
              <div className="border-t border-charcoal/10 pt-4">
                <p className="mb-2 text-[0.8125rem] font-semibold">Inquiries for {selected.length === 1 ? 'this date' : 'these dates'}</p>
                <ul className="space-y-1.5 text-sm">
                  {selInquiries.map((i) => (
                    <li key={i.id}>
                      <Link href={`/admin/inquiries/${i.id}`} className="underline underline-offset-2">
                        {i.full_name}{i.partner_name && ` & ${i.partner_name}`}
                      </Link>{' '}
                      <span className="text-xs text-ink-soft">({i.status}{i.source === 'booking' ? ', WhatsApp' : ''})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  )
}
