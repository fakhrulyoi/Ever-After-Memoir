'use client'
import Link from 'next/link'
import { createContext, useCallback, useContext, type ComponentProps, type ReactNode } from 'react'
import type { SettingsContent } from '@/lib/content/types'
import { t as translate, withLang, type Lang, type UIKey } from '@/lib/i18n'
import { isExternal } from '@/lib/url'

interface SiteCtx {
  settings: SettingsContent
  /** '/preview' while an admin previews drafts, '' on the live site */
  prefix: string
  preview: boolean
  lang: Lang
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

/** UI words in the visitor's language. */
export function useT() {
  const { lang } = useSite()
  return useCallback((key: UIKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])
}

/** Internal path in the current language (and inside preview mode). */
export function useHref() {
  const { prefix, lang } = useSite()
  return useCallback(
    (href: string) => {
      if (!href || isExternal(href) || href.startsWith('#')) return href
      const localized = withLang(lang, href)
      return prefix && localized.startsWith('/') ? `${prefix}${localized === '/' ? '' : localized}` || prefix : localized
    },
    [prefix, lang],
  )
}

/** Link that keeps the visitor's language and preview mode, and opens external links safely. */
export function SiteLink({ href, children, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string; children: ReactNode }) {
  const to = useHref()(href)
  if (!href) return <span className={rest.className}>{children}</span>
  if (isExternal(href) || href.startsWith('#')) {
    const blank = /^https?:/i.test(href)
    return (
      <a href={href} className={rest.className} target={blank ? '_blank' : undefined} rel={blank ? 'noopener noreferrer' : undefined} aria-label={rest['aria-label']} onClick={rest.onClick as never}>
        {children}
      </a>
    )
  }
  return (
    <Link href={to} {...rest}>
      {children}
    </Link>
  )
}
