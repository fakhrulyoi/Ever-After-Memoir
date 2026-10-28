'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PAGE_LABELS, PAGE_SEO_FIELDS, SECTION_DEFS } from '@/lib/content/fields'
import { sectionSchema } from '@/lib/content/schemas'
import type { ContentStatus, PageContent, PageSlug, Section, SectionType } from '@/lib/content/types'
import { EditorShell } from './EditorShell'
import { FormContextProvider, SchemaForm, type FormContextValue } from './FormFields'
import { Button, Confirm, inputClass } from './ui'

type Device = 'phone' | 'tablet' | 'desktop'
const WIDTH: Record<Device, number> = { phone: 390, tablet: 820, desktop: 1440 }

function LivePreview({ path, slug, content }: { path: string; slug: string; content: PageContent }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const [boxW, setBoxW] = useState(600)
  const latest = useRef(content)
  latest.current = content

  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'eam:live-page', id: slug, content: latest.current }, window.location.origin)
  }, [slug])

  useEffect(() => {
    const t = setTimeout(send, 250)
    return () => clearTimeout(t)
  }, [content, send])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === 'eam:preview-ready' && e.data.id === slug) send()
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [slug, send])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = WIDTH[device]
  const scale = Math.min(1, boxW / w)
  const height = 760
  return (
    <div className="sticky top-32">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.8125rem] font-semibold">Live preview</p>
        <div className="flex gap-1" role="group" aria-label="Preview size">
          {(Object.keys(WIDTH) as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              className={`rounded-[2px] px-2.5 py-1 text-xs capitalize ${device === d ? 'bg-olive-deep text-ivory' : 'text-ink-soft hover:bg-cream'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div ref={box} className="overflow-hidden border border-charcoal/15 bg-white" style={{ height }}>
        <div style={{ width: w * scale, height, margin: '0 auto' }}>
          <iframe
            ref={frame}
            src={`/preview${path === '/' ? '' : path}?live=1`}
            title="Live preview of your unpublished changes"
            onLoad={send}
            style={{ width: w, height: height / scale, transform: `scale(${scale})`, transformOrigin: '0 0', border: 0 }}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-soft">Updates as you type. Only you can see this.</p>
    </div>
  )
}

function SectionCard({
  section,
  index,
  count,
  open,
  onToggleOpen,
  onChange,
  onMove,
  onRemove,
  slug,
}: {
  section: Section
  index: number
  count: number
  open: boolean
  onToggleOpen: () => void
  onChange: (s: Section) => void
  onMove: (d: number) => void
  onRemove: () => void
  slug: string
}) {
  const def = SECTION_DEFS[section.type]
  const summary = 'headline' in section && section.headline ? section.headline.replace(/\*/g, '').split('\n')[0] : def.description
  return (
    <li className={`border bg-white/55 transition-colors ${open ? 'border-olive-deep/40' : 'border-charcoal/10'} ${section.visible ? '' : 'opacity-70'}`}>
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={onToggleOpen} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <span className="block text-[0.875rem] font-semibold">{def.label}{!section.visible && <span className="ml-2 font-normal text-ink-soft">(hidden)</span>}</span>
          <span className="block truncate text-xs text-ink-soft">{summary}</span>
        </button>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-soft">
          <input type="checkbox" checked={section.visible} onChange={(e) => onChange({ ...section, visible: e.target.checked })} className="accent-olive-deep" />
          Show
        </label>
        <Button variant="ghost" className="min-h-8 px-2" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${def.label} up`}>↑</Button>
        <Button variant="ghost" className="min-h-8 px-2" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${def.label} down`}>↓</Button>
      </div>
      {open && (
        <div className="space-y-6 border-t border-charcoal/10 px-4 py-5">
          <SchemaForm
            fields={def.fields}
            value={section as unknown as Record<string, unknown>}
            onChange={(v) => onChange(v as unknown as Section)}
            idPrefix={`${slug}-${section.key}`}
          />
          <div className="flex justify-end border-t border-charcoal/10 pt-4">
            <Button variant="ghost" className="text-danger" onClick={onRemove}>Remove this section</Button>
          </div>
        </div>
      )}
    </li>
  )
}

export function PageEditor({
  slug,
  row,
  form,
}: {
  slug: PageSlug
  row: { id: string; draft: PageContent; status: ContentStatus; hasChanges: boolean; published_at: string | null; updated_at: string }
  form: FormContextValue
}) {
  const meta = PAGE_LABELS[slug]
  const [open, setOpen] = useState<string | null>(row.draft.sections[0]?.key ?? null)
  const [removing, setRemoving] = useState<number | null>(null)
  const [adding, setAdding] = useState<SectionType | ''>('')

  return (
    <FormContextProvider value={form}>
      <EditorShell<PageContent>
        table="pages"
        id={row.id}
        title={meta.label}
        subtitle={<a href={meta.path} target="_blank" rel="noreferrer" className="underline underline-offset-2">View live page</a>}
        initialDraft={row.draft}
        status={row.status}
        hasChanges={row.hasChanges}
        publishedAt={row.published_at}
        updatedAt={row.updated_at}
        previewHref={() => `/preview${meta.path === '/' ? '' : meta.path}`}
        canUnpublish={false}
        backHref={slug === 'home' ? undefined : '/admin/pages'}
        backLabel="All pages"
      >
        {(draft, setDraft) => {
          const sections = draft.sections
          const setSections = (next: Section[]) => setDraft({ ...draft, sections: next })
          const available = (Object.keys(SECTION_DEFS) as SectionType[]).filter((t) => {
            const d = SECTION_DEFS[t]
            return d.pages.includes(slug) && !(d.single && sections.some((s) => s.type === t))
          })
          const add = () => {
            if (!adding) return
            const key = `${adding}-${Math.random().toString(36).slice(2, 7)}`
            const section = sectionSchema.parse({ type: adding, key, visible: true }) as Section
            setSections([...sections, section])
            setOpen(key)
            setAdding('')
          }
          return (
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div className="space-y-8">
                <p className="text-[0.9375rem] text-ink-soft">{meta.help} Open a section to edit it. Changes stay private until you press Publish.</p>
                <ol className="space-y-2">
                  {sections.map((s, i) => (
                    <SectionCard
                      key={s.key}
                      slug={slug}
                      section={s}
                      index={i}
                      count={sections.length}
                      open={open === s.key}
                      onToggleOpen={() => setOpen(open === s.key ? null : s.key)}
                      onChange={(next) => setSections(sections.map((x, k) => (k === i ? next : x)))}
                      onMove={(d) => {
                        const n = [...sections]
                        const [it] = n.splice(i, 1)
                        n.splice(i + d, 0, it)
                        setSections(n)
                      }}
                      onRemove={() => setRemoving(i)}
                    />
                  ))}
                </ol>
                {available.length > 0 && (
                  <div className="flex flex-wrap items-end gap-2 border border-dashed border-charcoal/20 p-4">
                    <label className="min-w-56 flex-1 space-y-1.5">
                      <span className="block text-[0.8125rem] font-semibold">Add a section</span>
                      <select className={inputClass} value={adding} onChange={(e) => setAdding(e.target.value as SectionType)}>
                        <option value="">Choose a section type…</option>
                        {available.map((t) => <option key={t} value={t}>{SECTION_DEFS[t].label} — {SECTION_DEFS[t].description}</option>)}
                      </select>
                    </label>
                    <Button variant="primary" disabled={!adding} onClick={add}>Add section</Button>
                  </div>
                )}
                <details className="border border-charcoal/10 bg-white/55">
                  <summary className="cursor-pointer px-4 py-3 text-[0.875rem] font-semibold">Search engine settings for this page</summary>
                  <div className="border-t border-charcoal/10 px-4 py-5">
                    <SchemaForm
                      fields={PAGE_SEO_FIELDS}
                      value={draft as unknown as Record<string, unknown>}
                      onChange={(v) => setDraft({ ...draft, ...(v as Partial<PageContent>) })}
                      idPrefix={`${slug}-seo`}
                    />
                  </div>
                </details>
                <Confirm
                  open={removing !== null}
                  danger
                  title="Remove this section?"
                  body="It will disappear from the page when you publish. To hide it for now instead, untick “Show”."
                  confirmLabel="Remove section"
                  onConfirm={() => { if (removing !== null) setSections(sections.filter((_, k) => k !== removing)); setRemoving(null) }}
                  onCancel={() => setRemoving(null)}
                />
              </div>
              <div className="hidden xl:block">
                <LivePreview path={meta.path} slug={slug} content={draft} />
              </div>
            </div>
          )
        }}
      </EditorShell>
    </FormContextProvider>
  )
}
