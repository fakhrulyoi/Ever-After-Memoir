'use client'
import Link from 'next/link'
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react'
import type { SettingsContent } from '@/lib/content/types'
import { isExternal } from '@/lib/url'

interface SiteCtx {
  settings: SettingsContent
  /** '/preview' while an admin previews drafts, '' on the live site */
  prefix: string
  preview: boolean
}

const Ctx = createContext<SiteCtx | null>(null)

export function SiteProvider({ value, children }: { value: SiteCtx; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSite() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSite must be used inside SiteProvider')
  return v
}

/** Link that keeps the visitor inside preview mode and opens external links safely. */
export function SiteLink({ href, children, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string; children: ReactNode }) {
  const { prefix } = useSite()
  if (!href) return <span className={rest.className}>{children}</span>
  if (isExternal(href) || href.startsWith('#')) {
    const blank = /^https?:/i.test(href)
    return (
      <a href={href} className={rest.className} target={blank ? '_blank' : undefined} rel={blank ? 'noopener noreferrer' : undefined} aria-label={rest['aria-label']}>
        {children}
      </a>
    )
  }
  const to = prefix && href.startsWith('/') ? `${prefix}${href === '/' ? '' : href}` || prefix : href
  return (
    <Link href={to} {...rest}>
      {children}
    </Link>
  )
}
