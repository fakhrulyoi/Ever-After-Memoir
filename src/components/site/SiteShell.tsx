'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import type { SettingsContent } from '@/lib/content/types'
import { MotionProvider } from '../motion/MotionProvider'
import { SiteProvider } from './context'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { Grain, Intro, ViewCursor, WhatsAppFloat } from './Chrome'
import { PreviewBanner } from './PreviewBanner'

/** Pages whose first section is a full-bleed image (nav starts transparent). */
function startsWithImage(path: string, heroPaths: string[]) {
  return heroPaths.includes(path) || /^\/stories\/[^/]+$/.test(path)
}

export function SiteShell({
  settings,
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
  const path = usePathname().replace(/^\/preview/, '') || '/'
  return (
    <SiteProvider value={{ settings, prefix, preview }}>
      <MotionProvider>
        <a href="#main" className="sr-only z-[100] bg-olive-deep px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Nav overHero={startsWithImage(path, heroPaths)} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <Grain />
        <ViewCursor />
        <Intro />
        {!preview && <WhatsAppFloat />}
        {preview && <PreviewBanner />}
      </MotionProvider>
    </SiteProvider>
  )
}
