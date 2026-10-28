'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { IconClose, IconMenu } from '../site/icons'

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/homepage', label: 'Homepage' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/stories', label: 'Stories' },
  { href: '/admin/services', label: 'Services & packages' },
  { href: '/admin/media', label: 'Media library' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/availability', label: 'Availability' },
  { href: '/admin/social', label: 'Social' },
  { href: '/admin/settings', label: 'Settings & SEO' },
  { href: '/admin/account', label: 'Account' },
]

export function AdminNav({ email, newInquiries }: { email: string; newInquiries: number }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [path])
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href))
  const nav = (
    <nav aria-label="Admin">
      <ul className="space-y-0.5">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active(l.href) ? 'page' : undefined}
              className={`flex items-center justify-between rounded-[2px] px-3 py-2 text-[0.875rem] transition-colors ${active(l.href) ? 'bg-ivory/12 text-ivory' : 'text-taupe hover:bg-ivory/6 hover:text-ivory'}`}
            >
              {l.label}
              {l.href === '/admin/inquiries' && newInquiries > 0 && (
                <span className="rounded-full bg-sage px-2 text-xs font-semibold text-olive-deep">{newInquiries}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
  const footer = (
    <div className="space-y-3 border-t border-ivory/10 pt-4 text-xs text-taupe">
      <a href="/" target="_blank" rel="noreferrer" className="block hover:text-ivory">View website ↗</a>
      <p className="truncate" title={email}>{email}</p>
      <form action={signOut}>
        <button type="submit" className="hover:text-ivory">Sign out</button>
      </form>
    </div>
  )
  return (
    <>
      <aside className="on-dark sticky top-0 hidden h-svh w-64 shrink-0 flex-col justify-between bg-olive-deep p-5 text-ivory lg:flex">
        <div>
          <Link href="/admin" className="mb-8 block px-3 font-[family-name:var(--font-display)] text-2xl">Ever After <em>Memoir</em></Link>
          {nav}
        </div>
        {footer}
      </aside>
      <div className="on-dark sticky top-0 z-40 flex items-center justify-between bg-olive-deep px-4 py-3 text-ivory lg:hidden">
        <Link href="/admin" className="font-[family-name:var(--font-display)] text-xl">Ever After <em>Memoir</em></Link>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="admin-menu" aria-label={open ? 'Close menu' : 'Open menu'} className="p-1">
          {open ? <IconClose size={24} /> : <IconMenu size={24} />}
        </button>
      </div>
      {open && (
        <div id="admin-menu" className="on-dark fixed inset-x-0 bottom-0 top-[52px] z-40 flex flex-col justify-between overflow-y-auto bg-olive-deep p-5 text-ivory lg:hidden">
          {nav}
          {footer}
        </div>
      )}
    </>
  )
}
