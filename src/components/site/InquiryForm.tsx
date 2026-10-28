'use client'
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { InquirySection } from '@/lib/content/types'
import type { SiteData } from '@/lib/data/site'
import { fieldErrors, inquirySchema, type InquiryFieldErrors } from '@/lib/inquiry'
import { Rich, waLink } from '@/lib/text'
import { EASE } from '../motion/MotionProvider'
import { SiteLink, useSite } from './context'

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
}: {
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
      <label htmlFor={id} className="pointer-events-none absolute left-0 top-1 text-[0.8125rem] font-medium text-ink-soft">
        {label}
        {required ? <span aria-hidden className="text-olive"> *</span> : <span className="font-normal"> (optional)</span>}
      </label>
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-xs text-ink-soft">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-danger" role="alert">{error}</p>}
    </div>
  )
}

export function InquiryForm({ s, data, first = true }: { s: InquirySection; data: SiteData; first?: boolean }) {
  const Heading = first ? 'h1' : 'h2'
  const { settings, preview } = useSite()
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
    () => [...data.services.filter((x) => x.content.kind === 'service').map((x) => x.content.name), 'Not sure yet'],
    [data.services],
  )
  const today = new Date().toISOString().slice(0, 10)
  const wa = waLink(settings.whatsappNumber, settings.whatsappMessage)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (preview) {
      setStatus('error')
      setMessage('The form is switched off in preview so no test inquiries are created.')
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
      setMessage(body.error ?? 'Your inquiry was not sent. Please check your connection and try again.')
    } catch {
      setStatus('error')
      setMessage('Your inquiry was not sent. Please check your connection and try again.')
    }
  }

  const aria = (name: keyof InquiryFieldErrors, hint = false) => ({
    id: name,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : hint ? `${name}-hint` : undefined,
  })

  return (
    <section id="inquiry" className={first ? 'pb-28 pt-36 md:pb-40 md:pt-48' : 'scroll-mt-20 border-t border-charcoal/10 pb-28 pt-24 md:pb-40 md:pt-32'}>
      <div className="shell grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Heading className={`display text-olive-deep ${first ? 'display-lg' : 'display-md'}`}><Rich text={s.headline} /></Heading>
          <p className="lede mt-8">{s.body}</p>
          <div className="mt-12 space-y-4 text-[0.9375rem]">
            {settings.contactEmail && (
              <p><span className="meta block">Email</span><a className="underline-offset-4 hover:underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
            )}
            {wa && (
              <p><span className="meta block">WhatsApp</span><a className="underline-offset-4 hover:underline" href={wa} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></p>
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
                  Send another inquiry
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
                <Field id="fullName" label="Your name" required error={errors.fullName}>
                  <input {...aria('fullName')} autoComplete="name" className={fieldBase} placeholder=" " />
                </Field>
                <Field id="partnerName" label="Partner’s name" error={errors.partnerName}>
                  <input {...aria('partnerName')} className={fieldBase} placeholder=" " />
                </Field>
                <Field id="email" label="Email" required error={errors.email}>
                  <input {...aria('email')} type="email" autoComplete="email" inputMode="email" className={fieldBase} placeholder=" " />
                </Field>
                <Field id="whatsapp" label="WhatsApp number" error={errors.whatsapp} hint="With country code, e.g. +60 12 345 6789">
                  <input {...aria('whatsapp', true)} type="tel" autoComplete="tel" inputMode="tel" className={fieldBase} placeholder=" " />
                </Field>
                <Field id="weddingDate" label="Wedding date" required error={errors.weddingDate}>
                  <input {...aria('weddingDate')} type="date" min={today} className={`${fieldBase} [color-scheme:light]`} />
                </Field>
                <Field id="location" label="Location or venue" required error={errors.location}>
                  <input {...aria('location')} className={fieldBase} placeholder=" " />
                </Field>
                <Field id="celebrationType" label="Type of celebration" required error={errors.celebrationType}>
                  <select {...aria('celebrationType')} className={`${fieldBase} appearance-none`} defaultValue="">
                    <option value="" disabled>Choose one</option>
                    {settings.celebrationTypes.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field id="serviceInterest" label="Service you’re interested in" required error={errors.serviceInterest}>
                  <select {...aria('serviceInterest')} className={`${fieldBase} appearance-none`} defaultValue="">
                    <option value="" disabled>Choose one</option>
                    {services.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field id="budget" label="Estimated budget" error={errors.budget} className="sm:col-span-2">
                  {settings.budgetRanges.length ? (
                    <select {...aria('budget')} className={`${fieldBase} appearance-none`} defaultValue="">
                      <option value="">Prefer not to say</option>
                      {settings.budgetRanges.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  ) : (
                    <input {...aria('budget')} className={fieldBase} placeholder=" " />
                  )}
                </Field>
                <Field id="notes" label="Tell us about your day" error={errors.notes} className="sm:col-span-2">
                  <textarea {...aria('notes')} rows={4} className={`${fieldBase} resize-y`} placeholder=" " />
                </Field>

                {/* Honeypot: hidden from people, tempting for bots */}
                <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
                  <label htmlFor="website">Leave this empty</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-4 text-[0.9375rem] text-ink-soft">
                    <input
                      type="checkbox"
                      name="consent"
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? 'consent-error' : undefined}
                      className="mt-1 h-4 w-4 shrink-0 accent-olive-deep"
                    />
                    <span>
                      I agree to Ever After Memoir keeping these details to reply to my inquiry.{' '}
                      <SiteLink href="/privacy" className="underline underline-offset-4">Read the privacy policy</SiteLink>.
                    </span>
                  </label>
                  {errors.consent && <p id="consent-error" className="mt-2 text-[0.8125rem] text-danger" role="alert">{errors.consent}</p>}
                  {s.privacyNote && <p id="form-note" className="mt-4 text-xs text-ink-soft">{s.privacyNote}</p>}
                </div>

                <div className="flex flex-col items-start gap-4 sm:col-span-2">
                  <button type="submit" className="btn btn-solid min-w-56" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                    {status === 'sending' ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border border-ivory/40 border-t-ivory" aria-hidden />
                        Sending…
                      </>
                    ) : (
                      'Send inquiry'
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
