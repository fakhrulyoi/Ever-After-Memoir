'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { withLang, type UIKey } from '@/lib/i18n'
import { SiteLink, useSite, useT } from './context'
import { Wordmark } from './Wordmark'
import { IconClose, IconInstagram, IconMenu, IconTikTok } from './icons'
import { EASE } from '../motion/MotionProvider'
import { Magnetic } from '../motion/Magnetic'

export const NAV_LINKS: { href: string; label: UIKey }[] = [
  { href: '/', label: 'nav.home' },
  { href: '/stories', label: 'nav.stories' },
  { href: '/services', label: 'nav.services' },
  { href: '/about', label: 'nav.about' },
  { href: '/contact', label: 'nav.contact' },
]

/** Link to the same page in the other language. */
export function LangSwitch({ path, className = '' }: { path: string; className?: string }) {
  const { lang, prefix } = useSite()
  const t = useT()
  const other = lang === 'en' ? withLang('ms', path) : path
  const href = prefix ? `${prefix}${other === '/' ? '' : other}` || prefix : other
  return (
    <Link
      href={href}
      hrefLang={lang === 'en' ? 'ms' : 'en'}
      lang={lang === 'en' ? 'ms' : 'en'}
      aria-label={t('lang.label')}
      className={`inline-flex h-11 min-w-11 items-center justify-center gap-1.5 text-[0.8125rem] font-semibold tracking-[0.12em] ${className}`}
    >
      <span aria-hidden className="opacity-75">{lang === 'en' ? 'EN' : 'BM'}</span>
      <span aria-hidden className="h-3 w-px bg-current opacity-40" />
      <span aria-hidden className="underline decoration-1 underline-offset-[5px]">{t('lang.short')}</span>
    </Link>
  )
}

export function Nav({ overHero, path }: { overHero: boolean; path: string }) {
  const { settings } = useSite()
  const t = useT()
  const pathname = usePathname()
  const current = path
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(!overHero)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const last = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setSolid(!overHero || y > 80)
    setHidden(y > 240 && y > last.current && !open)
    last.current = y
  })
  useEffect(() => setSolid(!overHero || window.scrollY > 80), [overHero])
  useEffect(() => setOpen(false), [pathname])

  // Lock scroll, trap focus and close on Escape while the menu is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const el = menuRef.current
    el?.querySelector<HTMLElement>('a,button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll<HTMLElement>('a,button')]
        const first = items[0]
        const lastItem = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus() }
        else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      toggleRef.current?.focus()
    }
  }, [open])

  const light = !solid && !open
  return (
    <>
      <m.header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-700 ${
          solid && !open ? 'border-b border-charcoal/10 bg-ivory/92 text-olive-deep backdrop-blur-[2px]' : 'border-b border-transparent'
        } ${light ? 'on-dark text-ivory' : ''} ${open ? 'text-ivory' : ''}`}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <nav className="shell flex h-18 items-center justify-between gap-4 md:h-22" aria-label={t('nav.main')}>
          <SiteLink href="/" className="relative z-10 text-[1.45rem] md:text-[1.8rem]" aria-label={t('nav.homeLabel', { site: settings.siteTitle })}>
            {settings.logo ? (
              <Image src={settings.logo.url} alt={settings.siteTitle} width={180} height={48} className="h-9 w-auto" priority />
            ) : (
              <Wordmark />
            )}
          </SiteLink>
          <ul className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.slice(1).map((l) => (
              <li key={l.href}>
                <SiteLink
                  href={l.href}
                  className="group relative py-2 text-[0.9375rem] font-medium tracking-[0.02em]"
                  aria-current={current === l.href || current.startsWith(`${l.href}/`) ? 'page' : undefined}
                >
                  {t(l.label)}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ease-[var(--ease-film)] ${
                      current === l.href || current.startsWith(`${l.href}/`) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </SiteLink>
              </li>
            ))}
          </ul>
          <div className="relative z-10 flex items-center gap-2 md:gap-4">
            <LangSwitch path={path} />
            <div className="hidden md:block">
              <Magnetic>
                <SiteLink href="/contact#book" className={`btn min-h-11 px-5 ${light ? 'btn-light' : 'btn-dark'}`}>
                  {t('nav.cta')}
                </SiteLink>
              </Magnetic>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            >
              {open ? <IconClose size={26} /> : <IconMenu size={26} />}
            </button>
          </div>
        </nav>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            className="on-dark fixed inset-0 z-40 flex flex-col bg-olive-deep pt-24 text-ivory lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ul className="shell flex flex-1 flex-col justify-center gap-1">
              {NAV_LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <m.span
                    className="block"
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.06 }}
                  >
                    <SiteLink href={l.href} className="display block py-1 text-[clamp(2.75rem,12vw,4.5rem)]">
                      {current === l.href ? <em>{t(l.label)}</em> : t(l.label)}
                    </SiteLink>
                  </m.span>
                </li>
              ))}
            </ul>
            <div className="shell flex items-center justify-between gap-4 pb-10">
              <SiteLink href="/contact#book" className="btn btn-light min-h-12 px-5">
                {t('nav.cta')}
              </SiteLink>
              <div className="flex gap-4">
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2">
                    <IconInstagram size={22} />
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-2">
                    <IconTikTok size={22} />
                  </a>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
