'use client'
import { AnimatePresence, m, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SiteLink, useSite } from './context'
import { Wordmark } from './Wordmark'
import { IconWhatsApp } from './icons'
import { EASE } from '../motion/MotionProvider'
import { useIsDesktop } from '../motion/useIsDesktop'
import { waLink } from '@/lib/text'

export function Grain() {
  const { settings } = useSite()
  if (!settings.filmGrain) return null
  return <div className="grain" aria-hidden />
}

/** First-visit opening: the wordmark draws in, then lifts away. Once per session, max ~1.3s. */
export function Intro() {
  const { settings, preview } = useSite()
  const reduce = useReducedMotion()
  const [show, setShow] = useState(false)
  // Decide once whether to play; hiding is handled separately so a re-run of
  // this effect can never leave the overlay on screen.
  useEffect(() => {
    if (!settings.introAnimation || reduce || preview) return
    try {
      if (sessionStorage.getItem('eam-intro') === '1') return
      sessionStorage.setItem('eam-intro', '1')
    } catch {
      return
    }
    setShow(true)
  }, [settings.introAnimation, reduce, preview])
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 1150)
    return () => clearTimeout(t)
  }, [show])
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-olive-deep text-ivory"
          initial={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: EASE }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-5">
            <m.span
              className="block overflow-hidden text-[clamp(2rem,6vw,3.5rem)]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Wordmark />
            </m.span>
            <m.span
              className="block h-px w-40 origin-left bg-sage"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

/** A small "View" disc that follows the pointer over story images (desktop only). */
export function ViewCursor() {
  const desktop = useIsDesktop()
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 380, damping: 32 })
  const y = useSpring(0, { stiffness: 380, damping: 32 })
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    if (!desktop) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      setLabel(target?.dataset.cursor ?? null)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [desktop, x, y])
  if (!desktop) return null
  return (
    <m.div className="pointer-events-none fixed left-0 top-0 z-[55]" style={{ x, y }} aria-hidden>
      <m.div
        className="-ml-11 -mt-11 flex h-22 w-22 items-center justify-center rounded-full bg-ivory/90 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-olive-deep"
        animate={{ scale: label ? 1 : 0, opacity: label ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
      >
        {label}
      </m.div>
    </m.div>
  )
}

/** Phones: a slim bar to check dates, shown after the opening and hidden on the booking page. */
export function MobileBookBar() {
  const { settings } = useSite()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 520
      setShow(window.scrollY > window.innerHeight * 0.7 && !nearEnd)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])
  if (!settings.bookingEnabled || /\/contact$/.test(pathname)) return null
  const wa = waLink(settings.whatsappNumber, settings.whatsappMessage)
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="on-dark fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ivory/10 bg-olive-deep/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-ivory backdrop-blur md:hidden"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <SiteLink href="/contact#book" className="btn btn-light min-h-11 flex-1 px-4">Check your date</SiteLink>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/40" aria-label="Chat with us on WhatsApp">
              <IconWhatsApp size={22} />
            </a>
          )}
        </m.div>
      )}
    </AnimatePresence>
  )
}

export function WhatsAppFloat() {
  const { settings } = useSite()
  const href = waLink(settings.whatsappNumber, settings.whatsappMessage)
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 hidden h-13 w-13 items-center justify-center rounded-full border border-olive-deep/15 bg-ivory text-olive-deep shadow-[0_8px_30px_-12px_rgba(40,41,35,0.35)] transition-colors hover:bg-olive-deep hover:text-ivory md:bottom-8 md:right-8 md:flex"
      aria-label="Chat with us on WhatsApp"
    >
      <IconWhatsApp size={24} />
    </a>
  )
}
