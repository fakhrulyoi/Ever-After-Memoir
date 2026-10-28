import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader, StatusPill } from '@/components/admin/ui'
import { formatWhen } from '@/lib/format'
import { listRows } from '@/lib/data/admin'
import { PAGE_LABELS } from '@/lib/content/fields'
import type { PageContent, PageSlug } from '@/lib/content/types'

export const metadata: Metadata = { title: 'Pages' }

export default async function PagesList() {
  const rows = await listRows<PageContent>('pages')
  return (
    <>
      <PageHeader title="Pages" description="Edit the text, images and order of sections on each page." />
      <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
        {rows.map((r) => {
          const slug = r.slug as PageSlug
          const meta = PAGE_LABELS[slug]
          if (!meta) return null
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <Link href={slug === 'home' ? '/admin/homepage' : `/admin/pages/${slug}`} className="text-[1rem] font-semibold hover:underline">{meta.label}</Link>
                <p className="text-xs text-ink-soft">{meta.help} · {meta.path}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusPill status={r.status} hasChanges={r.hasChanges} />
                <span className="text-xs text-ink-soft">Edited {formatWhen(r.updated_at)}</span>
              </div>
              <Link href={slug === 'home' ? '/admin/homepage' : `/admin/pages/${slug}`} className="inline-flex min-h-9 items-center rounded-[2px] border border-charcoal/20 px-3 text-[0.8125rem] font-semibold hover:border-olive-deep">Edit</Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
