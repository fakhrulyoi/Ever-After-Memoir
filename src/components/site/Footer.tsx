'use client'
import { SiteLink, useSite } from './context'
import { NAV_LINKS } from './Nav'

export function Footer() {
  const { settings } = useSite()
  const year = new Date().getFullYear()
  return (
    <footer className="on-dark relative overflow-hidden bg-olive-deep text-ivory">
      <div className="shell grid gap-14 pb-10 pt-24 md:grid-cols-12 md:pt-32">
        <div className="md:col-span-5">
          <p className="display display-sm max-w-sm text-ivory/90">
            {settings.tagline || 'Your day, as it felt.'}
          </p>
          {settings.footerNote && <p className="mt-5 max-w-xs text-sm text-taupe">{settings.footerNote}</p>}
        </div>
        <nav className="md:col-span-3 md:col-start-7" aria-label="Footer">
          <p className="mb-4 text-xs text-sage">Explore</p>
          <ul className="space-y-2.5 text-[0.9375rem]">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <SiteLink href={l.href} className="transition-colors hover:text-sage">{l.label}</SiteLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="mb-4 text-xs text-sage">Say hello</p>
          <ul className="space-y-2.5 text-[0.9375rem]">
            {settings.contactEmail && (
              <li><a href={`mailto:${settings.contactEmail}`} className="break-all transition-colors hover:text-sage">{settings.contactEmail}</a></li>
            )}
            {settings.instagramUrl && (
              <li><a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-sage">Instagram</a></li>
            )}
            {settings.tiktokUrl && (
              <li><a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-sage">TikTok</a></li>
            )}
            <li><SiteLink href="/contact" className="transition-colors hover:text-sage">Send an inquiry</SiteLink></li>
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
      <div className="shell flex flex-col gap-3 border-t border-ivory/10 py-6 text-xs text-taupe sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {settings.siteTitle}</p>
        <SiteLink href="/privacy" className="hover:text-ivory">Privacy policy</SiteLink>
      </div>
    </footer>
  )
}
