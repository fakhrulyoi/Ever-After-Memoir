'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, type ReactNode } from 'react'
import type { SettingsContent } from '@/lib/content/types'
import { langFromPath, localize, stripLang, t } from '@/lib/i18n'
import { MotionProvider } from '../motion/MotionProvider'
import { SiteProvider } from './context'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { Grain, Intro, MobileBookBar, ViewCursor, WhatsAppFloat } from './Chrome'
import { PreviewBanner } from './PreviewBanner'

/** Pages whose first section is a full-bleed image (nav starts transparent). */
function startsWithImage(path: string, heroPaths: string[]) {
  return heroPaths.includes(path) || /^\/stories\/[^/]+$/.test(path)
}

export function SiteShell({
  settings: raw,
  preview = false,
  heroPaths,
  children,
}: {
  settings: SettingsContent
  preview?: boolean
  heroPaths: string[]
  children: ReactNode
}) {
  const prefix = preview ? '/preview' : ''
  const full = usePathname()
  const lang = langFromPath(full)
  const path = stripLang(full.replace(/^\/preview/, '') || '/')
  const settings = useMemo(() => localize(raw, lang), [raw, lang])
  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('eam-lang', lang)
    } catch {}
  }, [lang])
  return (
    <SiteProvider value={{ settings, prefix, preview, lang }}>
      <MotionProvider>
        <a href="#main" className="sr-only z-[100] bg-olive-deep px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          {t(lang, 'skip')}
        </a>
        <Nav overHero={startsWithImage(path, heroPaths)} path={path} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <Grain />
        <ViewCursor />
        <Intro />
        {!preview && <WhatsAppFloat />}
        <MobileBookBar path={path} />
        {preview && <PreviewBanner />}
      </MotionProvider>
    </SiteProvider>
  )
}
