'use client'
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { InquirySection } from '@/lib/content/types'
import type { SiteData } from '@/lib/data/site'
import { fieldErrors, inquirySchema, type InquiryFieldErrors } from '@/lib/inquiry'
import { tErr, type UIKey } from '@/lib/i18n'
import { Rich, waLink } from '@/lib/text'
import { EASE } from '../motion/MotionProvider'
import { SiteLink, useSite, useT } from './context'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const fieldBase =
  'peer block w-full border-0 border-b border-charcoal/25 bg-transparent px-0 pb-3 pt-7 text-[1.0625rem] text-charcoal outline-none transition-colors placeholder:text-transparent focus:border-olive-deep aria-[invalid=true]:border-danger'

function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
  className = '',
  optional,
}: {
  optional: string
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <label htmlFor={id} className="pointer-events-none absolute left-0 top-1 text-[0.875rem] font-medium text-ink-soft">
        {label}
        {required ? <span aria-hidden className="text-olive"> *</span> : <span className="font-normal"> {optional}</span>}
      </label>
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-[0.8125rem] text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-2 text-[0.875rem] text-danger" role="alert">{error}</p>}
    </div>
  )
}

export function InquiryForm({ s, data, first = true }: { s: InquirySection; data: SiteData; first?: boolean }) {
  const Heading = first ? 'h1' : 'h2'
  const { settings, preview, lang } = useSite()
  const t = useT()
  // Under the booking calendar the long form starts folded away
  const [expanded, setExpanded] = useState(first)
  useEffect(() => {
    if (window.location.hash === '#inquiry') setExpanded(true)
    const onHash = () => window.location.hash === '#inquiry' && setExpanded(true)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<InquiryFieldErrors>({})
  const [message, setMessage] = useState('')
  const startedAt = useRef(0)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  useEffect(() => {
    if (status === 'sent') successRef.current?.focus()
  }, [status])

  const services = useMemo(
    () => [...data.services.filter((x) => x.content.kind === 'service').map((x) => x.content.name), t('form.notSure')],
    [data.services, t],
  )
  const today = new Date().toISOString().slice(0, 10)
  const wa = waLink(settings.whatsappNumber, settings.whatsappMessage)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (preview) {
      setStatus('error')
      setMessage(t('inq.preview'))
      return
    }
    const fd = new FormData(e.currentTarget)
    const payload = {
      fullName: String(fd.get('fullName') ?? ''),
      partnerName: String(fd.get('partnerName') ?? ''),
      email: String(fd.get('email') ?? ''),
      whatsapp: String(fd.get('whatsapp') ?? ''),
      weddingDate: String(fd.get('weddingDate') ?? ''),
      location: String(fd.get('location') ?? ''),
      celebrationType: String(fd.get('celebrationType') ?? ''),
      serviceInterest: String(fd.get('serviceInterest') ?? ''),
      budget: String(fd.get('budget') ?? ''),
      notes: String(fd.get('notes') ?? ''),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''),
      startedAt: startedAt.current,
      lang,
    }
    const parsed = inquirySchema.safeParse(payload)
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error)
      setErrors(errs)
      setStatus('idle')
      const first = Object.keys(errs)[0]
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setErrors({})
    setStatus('sending')
    setMessage('')
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.ok) {
        setStatus('sent')
        formRef.current?.reset()
        return
      }
      if (body.fieldErrors) setErrors(body.fieldErrors)
      setStatus('error')
      setMessage(body.error ?? t('inq.failed'))
    } catch {
      setStatus('error')
      setMessage(t('inq.failed'))
    }
  }

  const aria = (name: keyof InquiryFieldErrors, hint = false) => ({
    id: name,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined,
  })

  const err = (k: keyof InquiryFieldErrors) => tErr(lang, errors[k])
  const L = (k: UIKey) => t(k)

  if (!expanded)
    return (
      <section id="inquiry" className="scroll-mt-20 pb-24 md:pb-32">
        <div className="shell">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-controls="inquiry-form"
            className="group flex w-full items-center justify-between gap-6 border-y border-charcoal/15 py-6 text-left md:py-8"
          >
            <span className="display text-[clamp(1.6rem,3vw,2.5rem)] leading-tight text-olive-deep">{t('inq.open')}</span>
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-olive-deep/40 text-2xl text-olive-deep transition-colors group-hover:bg-olive-deep group-hover:text-ivory">+</span>
          </button>
        </div>
      </section>
    )

  return (
    <section id="inquiry" className={first ? 'pb-28 pt-36 md:pb-40 md:pt-48' : 'scroll-mt-20 border-t border-charcoal/10 pb-28 pt-16 md:pb-40 md:pt-32'}>
      <div id="inquiry-form" className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Heading className={`display text-olive-deep ${first ? 'display-lg' : 'display-md'}`}><Rich text={s.headline} /></Heading>
          <p className="lede mt-8">{s.body}</p>
          <div className="mt-12 space-y-4 text-[0.9375rem]">
            {settings.contactEmail && (
              <p><span className="meta block">{L('inq.emailLabel')}</span><a className="underline-offset-4 hover:underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
            )}
            {wa && (
              <p><span className="meta block">{L('inq.waLabel')}</span><a className="underline-offset-4 hover:underline" href={wa} target="_blank" rel="noopener noreferrer">{L('inq.waLink')}</a></p>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <m.div
                key="sent"
                ref={successRef}
                tabIndex={-1}
                role="status"
                className="border-t border-olive-deep pt-10 outline-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <p className="display display-md text-olive-deep"><Rich text={s.successHeadline} /></p>
                <p className="lede mt-6">{s.successBody}</p>
                <button type="button" onClick={() => setStatus('idle')} className="text-link mt-10 text-olive-deep">
                  {L('inq.another')}
                </button>
              </m.div>
            ) : (
              <m.form
                key="form"
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                className="relative grid gap-x-10 gap-y-9 sm:grid-cols-2"
                exit={{ opacity: 0 }}
                aria-describedby="form-note"
              >
                <Field optional={L('form.optional')} id="fullName" label={L('inq.name')} required error={err('fullName')}>
                  <input {...aria('fullName')} autoComplete="name" className={fieldBase} placeholder=" " />
                </Field>
                <Field optional={L('form.optional')} id="partnerName" label={L('inq.partner')} error={err('partnerName')}>
                  <input {...aria('partnerName')} className={fieldBase} placeholder=" " />
                </Field>
                <Field optional={L('form.optional')} id="email" label={L('inq.email')} required error={err('email')}>
                  <input {...aria('email')} type="email" autoComplete="email" inputMode="email" className={fieldBase} placeholder=" " />
                </Field>
                <Field optional={L('form.optional')} id="whatsapp" label={L('inq.whatsapp')} error={err('whatsapp')} hint={L('inq.whatsappHint')}>
                  <input {...aria('whatsapp', true)} type="tel" autoComplete="tel" inputMode="tel" className={fieldBase} placeholder=" " />
                </Field>
                <Field optional={L('form.optional')} id="weddingDate" label={L('inq.date')} required error={err('weddingDate')}>
                  <input {...aria('weddingDate')} type="date" min={today} className={`${fieldBase} [color-scheme:light]`} />
                </Field>
                <Field optional={L('form.optional')} id="location" label={L('inq.location')} required error={err('location')}>
                  <input {...aria('location')} className={fieldBase} placeholder=" " />
                </Field>
                <Field optional={L('form.optional')} id="celebrationType" label={L('inq.type')} required error={err('celebrationType')}>
                  <select {...aria('celebrationType')} className={`${fieldBase} appearance-none`} defaultValue="">
                    <option value="" disabled>{L('form.choose')}</option>
                    {settings.celebrationTypes.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field optional={L('form.optional')} id="serviceInterest" label={L('inq.service')} required error={err('serviceInterest')}>
                  <select {...aria('serviceInterest')} className={`${fieldBase} appearance-none`} defaultValue="">
                    <option value="" disabled>{L('form.choose')}</option>
                    {services.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field optional={L('form.optional')} id="budget" label={L('inq.budget')} error={err('budget')} className="sm:col-span-2">
                  {settings.budgetRanges.length ? (
                    <select {...aria('budget')} className={`${fieldBase} appearance-none`} defaultValue="">
                      <option value="">{L('form.preferNot')}</option>
                      {settings.budgetRanges.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  ) : (
                    <input {...aria('budget')} className={fieldBase} placeholder=" " />
                  )}
                </Field>
                <Field optional={L('form.optional')} id="notes" label={L('inq.notes')} error={err('notes')} className="sm:col-span-2">
                  <textarea {...aria('notes')} rows={4} className={`${fieldBase} resize-y`} placeholder=" " />
                </Field>

                {/* Honeypot: hidden from people, tempting for bots */}
                <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
                  <label htmlFor="website">{L('form.honeypot')}</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-4 text-[0.9375rem] text-ink-soft">
                    <input
                      type="checkbox"
                      name="consent"
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? 'consent-error' : undefined}
                      className="mt-1 h-5 w-5 shrink-0 accent-olive-deep"
                    />
                    <span>
                      {L('inq.consent')}{' '}
                      <SiteLink href="/privacy" className="underline underline-offset-4">{L('form.privacyLink')}</SiteLink>.
                    </span>
                  </label>
                  {errors.consent && <p id="consent-error" className="mt-2 text-[0.875rem] text-danger" role="alert">{err('consent')}</p>}
                  {s.privacyNote && <p id="form-note" className="mt-4 text-[0.8125rem] text-ink-soft">{s.privacyNote}</p>}
                </div>

                <div className="flex flex-col items-start gap-4 sm:col-span-2">
                  <button type="submit" className="btn btn-solid min-w-56" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                    {status === 'sending' ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border border-ivory/40 border-t-ivory" aria-hidden />
                        {L('form.sending')}
                      </>
                    ) : (
                      L('inq.send')
                    )}
                  </button>
                  {status === 'error' && message && <p className="text-[0.9375rem] text-danger" role="alert">{message}</p>}
                </div>
              </m.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
