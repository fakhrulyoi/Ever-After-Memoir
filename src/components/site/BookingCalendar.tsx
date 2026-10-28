'use client'
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { bookingRange, bookingSchema, dayState, isBookable, type DayState } from '@/lib/booking'
import type { AvailabilityStatus, BookingSection } from '@/lib/content/types'
import type { SiteData } from '@/lib/data/site'
import { addDays, addMonths, daysInMonth, formatLong, formatMonth, monthStart, todayISO, weekdayMon } from '@/lib/dates'
import { fieldErrors } from '@/lib/inquiry'
import { Paragraphs, Rich } from '@/lib/text'
import { EASE } from '../motion/MotionProvider'
import { Reveal } from '../motion/Reveal'
import { SiteLink, useSite } from './context'
import { IconArrow, IconWhatsApp } from './icons'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATE_LABEL: Record<DayState, string> = {
  available: 'available',
  limited: 'few slots left',
  booked: 'booked',
  unavailable: 'not available',
  outside: 'not open for booking',
}

type Errors = Partial<Record<string, string>>

const inputCls =
  'block w-full border-0 border-b border-charcoal/25 bg-transparent px-0 pb-2.5 pt-6 text-[1.0625rem] outline-none transition-colors focus:border-olive-deep aria-[invalid=true]:border-danger'

function Month({
  month,
  states,
  selected,
  focusDay,
  onPick,
  onKey,
  level = 'h3',
}: {
  level?: 'h2' | 'h3'
  month: string
  states: (day: string) => DayState
  selected: string | null
  focusDay: string | null
  onPick: (day: string) => void
  onKey: (e: KeyboardEvent<HTMLButtonElement>, day: string) => void
}) {
  const total = daysInMonth(month)
  const lead = weekdayMon(month)
  const days = Array.from({ length: total }, (_, i) => addDays(month, i))
  const open = days.filter((d) => isBookable(states(d))).length
  return (
    <div className="min-w-0">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <MonthHeading level={level}>{formatMonth(month)}</MonthHeading>
        <p className="meta">{open > 0 ? `${open} ${open === 1 ? 'date' : 'dates'} open` : 'Fully booked'}</p>
      </div>
      <div role="group" aria-label={formatMonth(month)} className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <span key={w} aria-hidden className="pb-2 text-center text-xs font-medium text-ink-soft">
            {w.slice(0, 2)}
          </span>
        ))}
        {Array.from({ length: lead }).map((_, i) => <span key={`e${i}`} aria-hidden />)}
          {days.map((d) => {
            const st = states(d)
            const ok = isBookable(st)
            const isSel = d === selected
            return (
              <span key={d} className="relative">
                <button
                  type="button"
                  data-day={d}
                  disabled={!ok}
                  tabIndex={d === focusDay ? 0 : -1}
                  aria-pressed={isSel}
                  aria-label={`${formatLong(d)}, ${STATE_LABEL[st]}`}
                  onClick={() => onPick(d)}
                  onKeyDown={(e) => onKey(e, d)}
                  className={`relative flex aspect-square w-full items-center justify-center rounded-full text-[0.9375rem] tabular-nums transition-[background-color,color,box-shadow] duration-300 ${
                    isSel
                      ? 'bg-olive-deep font-semibold text-ivory'
                      : st === 'available'
                        ? 'text-charcoal hover:shadow-[inset_0_0_0_1px_var(--color-olive-deep)]'
                        : st === 'limited'
                          ? 'text-charcoal hover:shadow-[inset_0_0_0_1px_var(--color-olive-deep)]'
                          : st === 'booked'
                            ? 'cursor-not-allowed text-taupe line-through decoration-taupe'
                            : 'cursor-not-allowed text-charcoal/25'
                  }`}
                >
                  {Number(d.slice(8))}
                  {st === 'limited' && (
                    <span aria-hidden className={`absolute bottom-[18%] h-1 w-1 rounded-full ${isSel ? 'bg-sage' : 'bg-olive'}`} />
                  )}
                </button>
              </span>
            )
          })}
      </div>
    </div>
  )
}

function MonthHeading({ level, children }: { level: 'h2' | 'h3'; children: ReactNode }) {
  const H = level
  return <H className="display text-[1.9rem] leading-none text-olive-deep">{children}</H>
}

export function BookingCalendar({ s, data, first = true }: { s: BookingSection; data: SiteData; first?: boolean }) {
  const Heading = first ? 'h1' : 'h2'
  const { settings, preview } = useSite()
  const today = todayISO()
  const range = useMemo(
    () => bookingRange({ leadDays: settings.bookingLeadDays, monthsAhead: settings.bookingMonthsAhead }, today),
    [settings.bookingLeadDays, settings.bookingMonthsAhead, today],
  )
  const map = useMemo(() => new Map<string, AvailabilityStatus>(data.availability.map((a) => [a.day, a.status])), [data.availability])
  const states = (d: string) => dayState(d, map, range)

  const firstMonth = monthStart(range.first)
  const lastMonth = monthStart(range.last)
  const [view, setView] = useState(firstMonth)
  const [dir, setDir] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [focusDay, setFocusDay] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [waUrl, setWaUrl] = useState<string | null>(null)
  const startedAt = useRef(0)
  const gridRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const focusAfterRender = useRef<string | null>(null)

  useEffect(() => {
    startedAt.current = Date.now()
    // Allow /contact?date=2027-03-14#book
    const q = new URLSearchParams(window.location.search).get('date')
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q) && isBookable(dayState(q, map, range))) {
      setSelected(q)
      setView(monthStart(q))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Roving focus: the selected day, else the first open day in view
  useEffect(() => {
    if (selected && selected.slice(0, 7) >= view.slice(0, 7) && selected.slice(0, 7) <= addMonths(view, 1).slice(0, 7)) {
      setFocusDay(selected)
      return
    }
    const total = daysInMonth(view)
    for (let i = 0; i < total; i++) {
      const d = addDays(view, i)
      if (isBookable(dayState(d, map, range))) return setFocusDay(d)
    }
    setFocusDay(null)
  }, [view, selected, map, range])

  useEffect(() => {
    if (!focusAfterRender.current) return
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusAfterRender.current}"]`)?.focus()
    focusAfterRender.current = null
  })

  const go = (delta: number) => {
    const next = addMonths(view, delta)
    if (next < firstMonth || next > lastMonth) return
    setDir(delta)
    setView(next)
  }

  const pick = (d: string) => {
    setSelected(d)
    setStatus('idle')
    setMessage('')
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
  }

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (!(e.key in step)) return
    e.preventDefault()
    let target = addDays(day, step[e.key])
    // skip over days that cannot be chosen
    for (let i = 0; i < 62 && !isBookable(states(target)); i++) target = addDays(target, step[e.key] > 0 ? 1 : -1)
    if (!isBookable(states(target))) return
    const tm = monthStart(target)
    if (tm < view) { setDir(-1); setView(tm) }
    else if (tm > addMonths(view, 1)) { setDir(1); setView(addMonths(tm, -1) < firstMonth ? tm : addMonths(tm, -1)) }
    setFocusDay(target)
    focusAfterRender.current = target
  }

  const services = [...data.services.filter((x) => x.content.kind === 'service').map((x) => x.content.name), 'Not sure yet']
  const needsEmail = !settings.whatsappNumber

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    if (preview) {
      setStatus('error')
      setMessage('Booking is switched off in preview so no test bookings are created.')
      return
    }
    const fd = new FormData(e.currentTarget)
    const payload = {
      date: selected,
      fullName: String(fd.get('fullName') ?? ''),
      partnerName: String(fd.get('partnerName') ?? ''),
      celebrationType: String(fd.get('celebrationType') ?? ''),
      serviceInterest: String(fd.get('serviceInterest') ?? ''),
      location: String(fd.get('location') ?? ''),
      notes: String(fd.get('notes') ?? ''),
      email: String(fd.get('email') ?? ''),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''),
      startedAt: startedAt.current,
    }
    const parsed = bookingSchema.safeParse(payload)
    const errs: Errors = parsed.success ? {} : fieldErrors(parsed.error as never)
    if (needsEmail && !payload.email) errs.email = 'Please add your email so we can reply'
    if (Object.keys(errs).length) {
      setErrors(errs)
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus()
      return
    }
    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.ok) {
        setStatus('done')
        setWaUrl(body.whatsappUrl)
        if (body.whatsappUrl) window.location.href = body.whatsappUrl
        return
      }
      if (body.fieldErrors) setErrors(body.fieldErrors)
      setStatus('error')
      setMessage(body.error ?? 'Your booking was not sent. Please try again.')
    } catch {
      setStatus('error')
      setMessage('Your booking was not sent. Check your connection and try again.')
    }
  }

  const aria = (name: string) => ({
    id: `bk-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `bk-${name}-error` : undefined,
  })
  const Err = ({ name }: { name: string }) =>
    errors[name] ? <p id={`bk-${name}-error`} className="mt-1.5 text-[0.8125rem] text-danger" role="alert">{errors[name]}</p> : null

  const selState = selected ? states(selected) : null

  return (
    <section id="book" className={`scroll-mt-20 ${first ? 'pb-24 pt-36 md:pb-32 md:pt-48' : 'section-y'}`}>
      <div className="shell grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {s.eyebrow && <Reveal><p className="kicker mb-8">{s.eyebrow}</p></Reveal>}
          <Heading className="display text-[clamp(2.6rem,4.6vw,4.75rem)] leading-[1.02] text-olive-deep"><Rich text={s.headline} /></Heading>
          <Reveal delay={0.2} className="mt-8 space-y-4">
            <Paragraphs text={s.body} className="lede" />
          </Reveal>
          <ul className="mt-10 space-y-3 text-[0.9375rem]" aria-label="Calendar key">
            <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center text-sm">14</span> Available</li>
            <li className="flex items-center gap-3"><span className="relative flex h-8 w-8 items-center justify-center text-sm">14<span className="absolute bottom-1 h-1 w-1 rounded-full bg-olive" /></span> Few slots left</li>
            <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center text-sm text-ink-soft line-through decoration-ink-soft/60">14</span> Booked</li>
            <li className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-deep text-sm font-semibold text-ivory">14</span> Your date</li>
          </ul>
          {s.note && <p className="mt-8 max-w-sm text-sm text-ink-soft">{s.note}</p>}
        </div>

        <div className="lg:col-span-8">
          {!settings.bookingEnabled ? (
            <div className="bg-cream p-8 md:p-12">
              <p className="display display-sm text-olive-deep">Online booking is paused right now.</p>
              <p className="lede mt-4">Please send us an inquiry below and we’ll reply with available dates.</p>
            </div>
          ) : (
            <div className="bg-cream p-5 sm:p-8 md:p-10">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-ink-soft">Choose your wedding date</p>
                <div className="flex gap-1">
                  <button type="button" onClick={() => go(-1)} disabled={view <= firstMonth} className="flex h-11 w-11 items-center justify-center rounded-full text-olive-deep transition-colors hover:bg-ivory disabled:opacity-30" aria-label="Previous month">
                    <IconArrow dir="left" size={20} />
                  </button>
                  <button type="button" onClick={() => go(1)} disabled={addMonths(view, 1) > lastMonth} className="flex h-11 w-11 items-center justify-center rounded-full text-olive-deep transition-colors hover:bg-ivory disabled:opacity-30" aria-label="Next month">
                    <IconArrow size={20} />
                  </button>
                </div>
              </div>
              <div ref={gridRef} className="overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <m.div
                    key={view}
                    custom={dir}
                    className="grid gap-10 md:grid-cols-2"
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <Month month={view} states={states} selected={selected} focusDay={focusDay} onPick={pick} onKey={onKey} level={first ? 'h2' : 'h3'} />
                    <div className="hidden md:block">
                      {addMonths(view, 1) <= lastMonth && (
                        <Month month={addMonths(view, 1)} states={states} selected={selected} focusDay={focusDay} onPick={pick} onKey={onKey} level={first ? 'h2' : 'h3'} />
                      )}
                    </div>
                  </m.div>
                </AnimatePresence>
              </div>

              <div ref={detailsRef} aria-live="polite">
                <AnimatePresence initial={false}>
                  {selected && (
                    <m.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="mt-10 border-t border-charcoal/15 pt-8">
                        <p className="meta">{selState === 'limited' ? 'Few slots left' : 'Available'}</p>
                        <m.p key={selected} className="display mt-1 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-tight text-olive-deep" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                          {formatLong(selected)}
                        </m.p>

                        {status === 'done' ? (
                          <div className="mt-6 space-y-4" role="status">
                            {waUrl ? (
                              <>
                                <p className="lede">Opening WhatsApp so you can send us your booking…</p>
                                <a href={waUrl} className="btn btn-solid"><IconWhatsApp size={18} /> Open WhatsApp</a>
                              </>
                            ) : (
                              <p className="lede">Thank you — we have your booking request and will reply to your email soon.</p>
                            )}
                          </div>
                        ) : (
                          <form onSubmit={submit} noValidate className="relative mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div>
                              <label htmlFor="bk-fullName" className="block text-[0.8125rem] font-medium text-ink-soft">Your name <span className="text-olive" aria-hidden>*</span></label>
                              <input {...aria('fullName')} autoComplete="name" className={inputCls} />
                              <Err name="fullName" />
                            </div>
                            <div>
                              <label htmlFor="bk-partnerName" className="block text-[0.8125rem] font-medium text-ink-soft">Partner’s name <span className="font-normal">(optional)</span></label>
                              <input {...aria('partnerName')} className={inputCls} />
                            </div>
                            <div>
                              <label htmlFor="bk-celebrationType" className="block text-[0.8125rem] font-medium text-ink-soft">Type of celebration <span className="text-olive" aria-hidden>*</span></label>
                              <select {...aria('celebrationType')} defaultValue="" className={`${inputCls} appearance-none`}>
                                <option value="" disabled>Choose one</option>
                                {settings.celebrationTypes.map((c) => <option key={c}>{c}</option>)}
                              </select>
                              <Err name="celebrationType" />
                            </div>
                            <div>
                              <label htmlFor="bk-serviceInterest" className="block text-[0.8125rem] font-medium text-ink-soft">Service <span className="text-olive" aria-hidden>*</span></label>
                              <select {...aria('serviceInterest')} defaultValue="" className={`${inputCls} appearance-none`}>
                                <option value="" disabled>Choose one</option>
                                {services.map((c) => <option key={c}>{c}</option>)}
                              </select>
                              <Err name="serviceInterest" />
                            </div>
                            <div className="sm:col-span-2">
                              <label htmlFor="bk-location" className="block text-[0.8125rem] font-medium text-ink-soft">Location or venue <span className="text-olive" aria-hidden>*</span></label>
                              <input {...aria('location')} className={inputCls} placeholder="e.g. Kuantan, or the name of the hall" />
                              <Err name="location" />
                            </div>
                            {needsEmail && (
                              <div className="sm:col-span-2">
                                <label htmlFor="bk-email" className="block text-[0.8125rem] font-medium text-ink-soft">Email <span className="text-olive" aria-hidden>*</span></label>
                                <input {...aria('email')} type="email" autoComplete="email" className={inputCls} />
                                <Err name="email" />
                              </div>
                            )}
                            <div className="sm:col-span-2">
                              <label htmlFor="bk-notes" className="block text-[0.8125rem] font-medium text-ink-soft">Anything we should know? <span className="font-normal">(optional)</span></label>
                              <textarea {...aria('notes')} rows={2} className={`${inputCls} resize-y`} />
                              <Err name="notes" />
                            </div>
                            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
                              <label htmlFor="bk-website">Leave this empty</label>
                              <input id="bk-website" name="website" tabIndex={-1} autoComplete="off" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
                                <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-olive-deep" aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? 'bk-consent-error' : undefined} />
                                <span>I agree to Ever After Memoir keeping these details to reply. <SiteLink href="/privacy" className="underline underline-offset-4">Privacy policy</SiteLink>.</span>
                              </label>
                              <Err name="consent" />
                            </div>
                            <div className="flex flex-col items-start gap-3 sm:col-span-2">
                              <button type="submit" className="btn btn-solid" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                                {status === 'sending' ? (
                                  <><span className="h-4 w-4 animate-spin rounded-full border border-ivory/40 border-t-ivory" aria-hidden /> Sending…</>
                                ) : needsEmail ? (
                                  'Send booking request'
                                ) : (
                                  <><IconWhatsApp size={18} /> Continue on WhatsApp</>
                                )}
                              </button>
                              {!needsEmail && <p className="text-xs text-ink-soft">WhatsApp opens with your details filled in. Just press send.</p>}
                              {status === 'error' && message && <p className="text-[0.9375rem] text-danger" role="alert">{message}</p>}
                            </div>
                          </form>
                        )}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
