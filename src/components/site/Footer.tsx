'use client'
import { SiteLink, useSite, useT } from './context'
import { NAV_LINKS } from './Nav'

export function Footer() {
  const { settings } = useSite()
  const t = useT()
  const year = new Date().getFullYear()
  return (
    <footer className="on-dark relative overflow-hidden bg-olive-deep text-ivory">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-10 pb-10 pt-20 md:grid-cols-12 md:gap-14 md:pt-32">
        <div className="col-span-2 md:col-span-5">
          <p className="display display-sm max-w-sm text-ivory/90">
            {settings.tagline || 'Your day, as it felt.'}
          </p>
          {settings.footerNote && <p className="mt-5 max-w-xs text-sm text-taupe">{settings.footerNote}</p>}
        </div>
        <nav className="md:col-span-3 md:col-start-7" aria-label={t('footer.label')}>
          <p className="mb-2 text-[0.8125rem] text-sage">{t('footer.explore')}</p>
          <ul className="text-[1rem]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <SiteLink href={l.href} className="inline-flex min-h-11 items-center transition-colors hover:text-sage">{t(l.label)}</SiteLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="mb-2 text-[0.8125rem] text-sage">{t('footer.hello')}</p>
          <ul className="text-[1rem]">
            {settings.contactEmail && (
              <li><a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-11 items-center break-all transition-colors hover:text-sage">{settings.contactEmail}</a></li>
            )}
            {settings.instagramUrl && (
              <li><a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-sage">Instagram</a></li>
            )}
            {settings.tiktokUrl && (
              <li><a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-sage">TikTok</a></li>
            )}
            <li><SiteLink href="/contact#inquiry" className="inline-flex min-h-11 items-center transition-colors hover:text-sage">{t('footer.inquiry')}</SiteLink></li>
          </ul>
        </div>
      </div>
      {/* Decorative wordmark, drawn as SVG so it scales to the full width */}
      <svg viewBox="0 0 1000 150" className="pointer-events-none block w-full select-none px-[2vw]" aria-hidden focusable="false">
        <text
          x="500"
          y="118"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          textAnchor="middle"
          fill="currentColor"
          className="text-ivory/[0.07]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 150, letterSpacing: '-2px' }}
        >
          Ever After <tspan fontStyle="italic">Memoir</tspan>
        </text>
      </svg>
      <div className="shell flex flex-col gap-1 border-t border-ivory/10 py-5 text-[0.8125rem] text-taupe sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {settings.siteTitle}</p>
        <SiteLink href="/privacy" className="inline-flex min-h-11 items-center hover:text-ivory">{t('footer.privacy')}</SiteLink>
      </div>
    </footer>
  )
}
