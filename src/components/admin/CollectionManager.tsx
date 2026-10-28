'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createItem, duplicateStory, reorderItems } from '@/lib/actions/content'
import type { ContentStatus, MediaRef, ServiceContent, SocialItemContent, StoryContent, TestimonialContent } from '@/lib/content/types'
import { Button, EmptyState, StatusPill, formatWhen, inputClass } from './ui'

export type CollectionTable = 'stories' | 'services' | 'testimonials' | 'social_items'

export interface CollectionItem {
  id: string
  status: ContentStatus
  hasChanges: boolean
  draft: unknown
  updated_at: string
}

const CONFIG: Record<
  CollectionTable,
  { base: string; noun: string; title: (d: any) => string; sub: (d: any) => string; thumb: (d: any) => MediaRef | null; tags?: (d: any) => string[] }
> = {
  stories: {
    base: '/admin/stories',
    noun: 'story',
    title: (d: StoryContent) => d.title || 'Untitled story',
    sub: (d: StoryContent) => [d.isSample ? 'Sample' : '', d.featured ? 'Featured' : '', `/stories/${d.slug}`].filter(Boolean).join(' · '),
    thumb: (d: StoryContent) => d.cover,
    tags: (d: StoryContent) => d.tags,
  },
  services: {
    base: '/admin/services',
    noun: 'service',
    title: (d: ServiceContent) => d.name || 'Untitled',
    sub: (d: ServiceContent) => `${d.kind === 'addon' ? 'Optional extra' : 'Service'} · ${d.showPrice && d.price ? d.price : 'Price hidden'}`,
    thumb: (d: ServiceContent) => d.media,
  },
  testimonials: {
    base: '/admin/testimonials',
    noun: 'testimonial',
    title: (d: TestimonialContent) => d.displayName || 'Unnamed couple',
    sub: (d: TestimonialContent) => (d.consentConfirmed ? 'Approved by the couple' : 'Waiting for approval') + (d.text ? ` · “${d.text.slice(0, 60)}…”` : ''),
    thumb: (d: TestimonialContent) => d.photo,
  },
  social_items: {
    base: '/admin/social',
    noun: 'tile',
    title: (d: SocialItemContent) => d.caption || (d.platform === 'tiktok' ? 'TikTok post' : 'Instagram post'),
    sub: (d: SocialItemContent) => d.url || 'No link yet',
    thumb: (d: SocialItemContent) => d.preview,
  },
}

const PER_PAGE = 20

export function CollectionManager({ table, items: initial, newLabel }: { table: CollectionTable; items: CollectionItem[]; newLabel: string }) {
  const cfg = CONFIG[table]
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ContentStatus>('all')
  const [tag, setTag] = useState('all')
  const [page, setPage] = useState(0)
  const [creating, setCreating] = useState(false)

  const tags = useMemo(() => (cfg.tags ? [...new Set(items.flatMap((i) => cfg.tags!(i.draft)))].sort() : []), [items, cfg])
  const filtered = items.filter((i) => {
    if (status !== 'all' && i.status !== status) return false
    if (tag !== 'all' && !cfg.tags?.(i.draft).includes(tag)) return false
    if (query && !`${cfg.title(i.draft)} ${cfg.sub(i.draft)}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  const filteredActive = query !== '' || status !== 'all' || tag !== 'all'
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const shown = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const create = async () => {
    setCreating(true)
    const res = await createItem(table)
    setCreating(false)
    if (!res.ok) return toast.error(res.error)
    router.push(`${cfg.base}/${res.id}`)
  }

  const move = async (id: string, d: number) => {
    const idx = items.findIndex((i) => i.id === id)
    const next = [...items]
    const [it] = next.splice(idx, 1)
    next.splice(idx + d, 0, it)
    setItems(next)
    const res = await reorderItems(table, next.map((i) => i.id))
    if (!res.ok) {
      toast.error(res.error)
      setItems(items)
    } else toast.success('Order saved — the website now uses this order')
  }

  const duplicate = async (id: string) => {
    const res = await duplicateStory(id)
    if (!res.ok) return toast.error(res.error)
    toast.success('Copy created as a draft')
    router.push(`${cfg.base}/${res.id}`)
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input className={`${inputClass} max-w-xs`} placeholder={`Search ${cfg.noun === 'story' ? 'stories' : `${cfg.noun}s`}`} value={query} onChange={(e) => { setQuery(e.target.value); setPage(0) }} aria-label="Search" />
        <select className={`${inputClass} !w-auto`} value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(0) }} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="published">Live</option>
          <option value="draft">Drafts</option>
          <option value="archived">Archived</option>
        </select>
        {tags.length > 0 && (
          <select className={`${inputClass} !w-auto`} value={tag} onChange={(e) => { setTag(e.target.value); setPage(0) }} aria-label="Tag">
            <option value="all">All tags</option>
            {tags.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
        <span className="flex-1" />
        <Button variant="primary" busy={creating} onClick={create}>{newLabel}</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState title={`No ${cfg.noun}s yet`} body={`Create your first ${cfg.noun}. It stays a private draft until you publish it.`} action={<Button variant="primary" onClick={create}>{newLabel}</Button>} />
      ) : filtered.length === 0 ? (
        <p className="py-10 text-[0.9375rem] text-ink-soft">Nothing matches these filters.</p>
      ) : (
        <>
          {!filteredActive && items.length > 1 && <p className="mb-3 text-xs text-ink-soft">Use the arrows to change the order on the website.</p>}
          <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            {shown.map((i) => {
              const thumb = cfg.thumb(i.draft)
              return (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <Link href={`${cfg.base}/${i.id}`} className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream" tabIndex={-1} aria-hidden>
                    {thumb && (thumb.type === 'image' ? <Image src={thumb.url} alt="" fill sizes="56px" className="object-cover" /> : <video src={thumb.url} muted className="h-full w-full object-cover" />)}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`${cfg.base}/${i.id}`} className="block truncate text-[0.9375rem] font-semibold hover:underline">{cfg.title(i.draft)}</Link>
                    <p className="truncate text-xs text-ink-soft">{cfg.sub(i.draft)}</p>
                  </div>
                  <div className="hidden flex-col items-end gap-1 sm:flex">
                    <StatusPill status={i.status} hasChanges={i.hasChanges} />
                    <span className="text-xs text-ink-soft">Edited {formatWhen(i.updated_at)}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!filteredActive && (
                      <>
                        <Button variant="ghost" className="min-h-9 px-2" disabled={items[0].id === i.id} onClick={() => move(i.id, -1)} aria-label={`Move ${cfg.title(i.draft)} up`}>↑</Button>
                        <Button variant="ghost" className="min-h-9 px-2" disabled={items[items.length - 1].id === i.id} onClick={() => move(i.id, 1)} aria-label={`Move ${cfg.title(i.draft)} down`}>↓</Button>
                      </>
                    )}
                    {table === 'stories' && <Button variant="ghost" className="hidden min-h-9 px-2 md:inline-flex" onClick={() => duplicate(i.id)}>Duplicate</Button>}
                    <Link href={`${cfg.base}/${i.id}`} className="inline-flex min-h-9 items-center rounded-[2px] border border-charcoal/20 px-3 text-[0.8125rem] font-semibold hover:border-olive-deep">Edit</Link>
                  </div>
                </li>
              )
            })}
          </ul>
          {pages > 1 && (
            <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pages">
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-ink-soft">Page {page + 1} of {pages}</span>
              <Button disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
