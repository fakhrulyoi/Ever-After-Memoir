import type { Metadata } from 'next'
import Link from 'next/link'
import { StatusBadge } from '@/components/admin/Inquiries'
import { PageHeader } from '@/components/admin/ui'
import { formatWhen } from '@/lib/format'
import { listInquiries, overviewCounts, getPageRow, getSettingsRow } from '@/lib/data/admin'
import type { HeroSection, PageContent, SettingsContent } from '@/lib/content/types'
import { SITE_URL } from '@/lib/env'

export const metadata: Metadata = { title: 'Overview' }

export default async function Overview() {
  const [counts, inquiries, home, settings] = await Promise.all([
    overviewCounts(),
    listInquiries(),
    getPageRow<PageContent>('home'),
    getSettingsRow<SettingsContent>(),
  ])
  const s = settings?.published ?? settings?.draft
  const hero = home?.published?.sections.find((x) => x.type === 'hero') as HeroSection | undefined
  const checklist = [
    { done: counts.samplesLive === 0, label: 'Replace the sample stories with real weddings', href: '/admin/stories' },
    { done: !hero?.media?.isSample, label: 'Choose your own homepage image', href: '/admin/homepage' },
    { done: Boolean(s?.contactEmail || s?.whatsappNumber), label: 'Add a public email or WhatsApp number', href: '/admin/settings' },
    { done: Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_NOTIFY_EMAIL), label: 'Turn on email alerts for new inquiries (optional, see README)' },
    { done: !SITE_URL.includes('localhost'), label: 'Set your website address (NEXT_PUBLIC_SITE_URL)' },
  ]
  const cards = [
    { label: 'New inquiries', value: counts.newInquiries, href: '/admin/inquiries' },
    { label: 'Live stories', value: counts.publishedStories, href: '/admin/stories' },
    { label: 'Draft stories', value: counts.draftStories, href: '/admin/stories' },
    { label: 'Files in the library', value: counts.media, href: '/admin/media' },
  ]
  return (
    <>
      <PageHeader title="Overview" description="Edit anything, preview it privately, then publish. Visitors only see what you publish." />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block border border-charcoal/10 bg-white/55 p-5 transition-colors hover:border-olive-deep">
              <span className="display block text-5xl text-olive-deep">{c.value}</span>
              <span className="text-sm text-ink-soft">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 grid gap-10 xl:grid-cols-2">
        <section>
          <h2 className="display mb-4 text-3xl text-olive-deep">Before you launch</h2>
          <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-3 py-3 text-[0.9375rem]">
                <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${c.done ? 'bg-olive text-ivory' : 'border border-charcoal/30'}`}>{c.done ? '✓' : ''}</span>
                <span className={c.done ? 'text-ink-soft line-through' : ''}>{c.label}</span>
                <span className="sr-only">{c.done ? '(done)' : '(to do)'}</span>
                {!c.done && c.href && <Link href={c.href} className="ml-auto text-sm underline underline-offset-4">Open</Link>}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="display text-3xl text-olive-deep">Latest inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm underline underline-offset-4">See all</Link>
          </div>
          {inquiries.length === 0 ? (
            <p className="text-[0.9375rem] text-ink-soft">No inquiries yet. They appear here as soon as a couple sends the form.</p>
          ) : (
            <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
              {inquiries.slice(0, 6).map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/inquiries/${i.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-cream/50">
                    <span>
                      <span className="block text-[0.9375rem] font-semibold">{i.full_name}{i.partner_name && ` & ${i.partner_name}`}</span>
                      <span className="text-xs text-ink-soft">{formatWhen(i.created_at)}</span>
                    </span>
                    <StatusBadge status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="mt-10">
        <h2 className="display mb-4 text-3xl text-olive-deep">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ['/admin/homepage', 'Edit the homepage'],
            ['/admin/stories', 'Add a wedding story'],
            ['/admin/media', 'Upload photos'],
            ['/preview', 'Preview the whole website'],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-10 items-center rounded-[2px] border border-charcoal/20 px-4 text-[0.8125rem] font-semibold hover:border-olive-deep">{label}</Link>
          ))}
        </div>
      </section>
    </>
  )
}
