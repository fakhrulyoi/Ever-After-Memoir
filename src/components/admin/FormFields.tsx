'use client'
import Image from 'next/image'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { FieldDef } from '@/lib/content/fields'
import type { GalleryItem, LinkValue, MediaRef, Reel } from '@/lib/content/types'
import { MediaLibrary } from './MediaLibrary'
import { Button, FieldShell, Toggle, inputClass } from './ui'

/** Extra data some fields need (e.g. the list of stories to pick from). */
export interface FormContextValue {
  stories: { id: string; title: string; status: string }[]
}
const FormCtx = createContext<FormContextValue>({ stories: [] })
export const FormContextProvider = FormCtx.Provider

type Obj = Record<string, unknown>

export function SchemaForm({
  fields,
  value,
  onChange,
  idPrefix,
}: {
  fields: FieldDef[]
  value: Obj
  onChange: (next: Obj) => void
  idPrefix: string
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v })
  return (
    <div className="space-y-6">
      {fields.map((f, i) => {
        if (f.kind === 'heading')
          return (
            <div key={`h${i}`} className={i > 0 ? 'border-t border-charcoal/10 pt-6' : ''}>
              <h3 className="display text-2xl text-olive-deep">{f.label}</h3>
              {f.help && <p className="mt-1 text-xs text-ink-soft">{f.help}</p>}
            </div>
          )
        const id = `${idPrefix}-${f.key}`
        return <Field key={f.key} def={f} id={id} value={value[f.key]} onChange={(v) => set(f.key, v)} all={value} />
      })}
    </div>
  )
}

function Field({ def, id, value, onChange, all }: { def: Exclude<FieldDef, { kind: 'heading' }>; id: string; value: unknown; onChange: (v: unknown) => void; all: Obj }) {
  switch (def.kind) {
    case 'text': {
      const v = (value as string) ?? ''
      return (
        <FieldShell id={id} label={def.label} help={def.help} counter={def.max ? `${v.length}/${def.max}` : undefined}>
          <input id={id} className={inputClass} value={v} maxLength={def.max ?? 500} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} aria-describedby={def.help ? `${id}-help` : undefined} />
        </FieldShell>
      )
    }
    case 'textarea':
    case 'headline': {
      const v = (value as string) ?? ''
      return (
        <FieldShell id={id} label={def.label} help={def.help} counter={def.max ? `${v.length}/${def.max}` : undefined}>
          <textarea
            id={id}
            className={`${inputClass} ${def.kind === 'headline' ? 'font-[family-name:var(--font-display)] text-xl leading-snug' : ''}`}
            rows={def.kind === 'headline' ? 2 : def.rows ?? 4}
            value={v}
            maxLength={def.max ?? 20000}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={def.help ? `${id}-help` : undefined}
          />
        </FieldShell>
      )
    }
    case 'toggle':
      return <Toggle id={id} checked={Boolean(value)} onChange={onChange} label={def.label} help={def.help} />
    case 'select':
      return (
        <FieldShell id={id} label={def.label} help={def.help}>
          <select id={id} className={inputClass} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
            {def.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </FieldShell>
      )
    case 'number':
      return (
        <FieldShell id={id} label={def.label} help={def.help}>
          <input id={id} type="number" min={def.min} max={def.max} className={`${inputClass} max-w-40`} value={Number(value ?? 0)} onChange={(e) => onChange(Math.max(def.min, Math.min(def.max, Number(e.target.value) || 0)))} />
        </FieldShell>
      )
    case 'date':
      return (
        <FieldShell id={id} label={def.label} help={def.help}>
          <input id={id} type="date" className={`${inputClass} max-w-56`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
        </FieldShell>
      )
    case 'range': {
      const n = Number(value ?? def.min)
      return (
        <FieldShell id={id} label={def.label} help={def.help} counter={def.percent ? `${Math.round(n * 100)}%` : String(n)}>
          <input id={id} type="range" min={def.min} max={def.max} step={def.step} value={n} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-olive-deep" />
        </FieldShell>
      )
    }
    case 'link':
      return <LinkField id={id} label={def.label} help={def.help} value={(value as LinkValue) ?? { label: '', href: '' }} onChange={onChange} />
    case 'media':
      return <MediaField id={id} label={def.label} help={def.help} accept={def.accept} value={(value as MediaRef | null) ?? null} onChange={onChange} />
    case 'focal':
      return <FocalField id={id} label={def.label} help={def.help} value={(value as string) ?? '50% 50%'} media={all[def.mediaKey] as MediaRef | null} onChange={onChange} />
    case 'list':
      return <ListField id={id} label={def.label} help={def.help} itemLabel={def.itemLabel} max={def.max ?? 20} value={(value as string[]) ?? []} onChange={onChange} />
    case 'stories':
      return <StoriesField id={id} label={def.label} help={def.help} value={(value as string[]) ?? []} onChange={onChange} />
    case 'reels':
      return <ReelsField id={id} label={def.label} value={(value as Reel[]) ?? []} onChange={onChange} />
    case 'gallery':
      return <GalleryField id={id} label={def.label} value={(value as GalleryItem[]) ?? []} onChange={onChange} />
  }
}

// ---------------------------------------------------------------------------
const PAGES = [
  { href: '/', label: 'Homepage' },
  { href: '/stories', label: 'Stories' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function LinkField({ id, label, help, value, onChange }: { id: string; label: string; help?: string; value: LinkValue; onChange: (v: LinkValue) => void }) {
  const preset = PAGES.some((p) => p.href === value.href) ? value.href : 'custom'
  return (
    <fieldset className="space-y-2">
      <legend className="text-[0.8125rem] font-semibold">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <input id={`${id}-label`} aria-label={`${label} text`} placeholder="Button text" className={inputClass} value={value.label} maxLength={60} onChange={(e) => onChange({ ...value, label: e.target.value })} />
        <select aria-label={`${label} goes to`} className={inputClass} value={preset} onChange={(e) => onChange({ ...value, href: e.target.value === 'custom' ? '' : e.target.value })}>
          {PAGES.map((p) => <option key={p.href} value={p.href}>Goes to: {p.label}</option>)}
          <option value="custom">Goes to: another address…</option>
        </select>
      </div>
      {preset === 'custom' && (
        <input aria-label={`${label} address`} placeholder="https://… or /stories/a-story" className={inputClass} value={value.href} onChange={(e) => onChange({ ...value, href: e.target.value })} />
      )}
      <p className="text-xs text-ink-soft">{help ?? 'Leave the text empty to hide this button.'}</p>
    </fieldset>
  )
}

function AdminDialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      className="m-auto h-[min(92vh,60rem)] w-[min(96vw,80rem)] max-w-none rounded-[2px] border border-charcoal/15 bg-ivory p-0 text-charcoal backdrop:bg-charcoal/60"
      aria-label={title}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 className="display text-3xl text-olive-deep">{title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{open && children}</div>
      </div>
    </dialog>
  )
}

function MediaPreview({ media, className = '' }: { media: MediaRef; className?: string }) {
  if (media.type === 'video')
    return <video src={media.url} poster={media.poster ?? undefined} className={`absolute inset-0 h-full w-full object-cover ${className}`} muted preload="metadata" playsInline />
  return <Image src={media.url} alt={media.alt ?? ''} fill sizes="240px" className={`object-cover ${className}`} />
}

export function MediaField({ id, label, help, accept, value, onChange }: { id: string; label: string; help?: string; accept: 'image' | 'video'; value: MediaRef | null; onChange: (v: MediaRef | null) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-2">
      <p id={id} className="text-[0.8125rem] font-semibold">{label}</p>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative h-24 w-24 shrink-0 overflow-hidden border border-charcoal/15 bg-cream"
          aria-label={value ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
        >
          {value ? <MediaPreview media={value} /> : <span className="text-xs text-ink-soft">None</span>}
        </button>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpen(true)}>{value ? 'Change' : `Choose ${accept === 'video' ? 'video' : 'photo'}`}</Button>
            {value && <Button variant="ghost" onClick={() => onChange(null)}>Remove</Button>}
          </div>
          {value?.isSample && <p className="text-xs text-[#6b4f1d]">Sample file — replace with your own before launch.</p>}
          {help && <p className="text-xs text-ink-soft">{help}</p>}
        </div>
      </div>
      <AdminDialog open={open} onClose={() => setOpen(false)} title={accept === 'video' ? 'Choose a video' : 'Choose a photo'}>
        <MediaLibrary mode="pick" accept={accept} onPick={(ref) => { onChange(ref); setOpen(false) }} />
      </AdminDialog>
    </div>
  )
}

function FocalField({ id, label, help, value, media, onChange }: { id: string; label: string; help?: string; value: string; media: MediaRef | null; onChange: (v: string) => void }) {
  const [x, y] = value.split(' ').map((p) => parseInt(p, 10) || 50)
  if (!media || media.type !== 'image') return null
  const set = (nx: number, ny: number) => onChange(`${Math.round(Math.max(0, Math.min(100, nx)))}% ${Math.round(Math.max(0, Math.min(100, ny)))}%`)
  return (
    <FieldShell id={id} label={label} help={help} counter={value}>
      <div
        id={id}
        role="slider"
        tabIndex={0}
        aria-label="Focus point"
        aria-valuetext={`${x}% from left, ${y}% from top`}
        aria-valuenow={x}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2
          if (e.key === 'ArrowLeft') set(x - step, y)
          if (e.key === 'ArrowRight') set(x + step, y)
          if (e.key === 'ArrowUp') { e.preventDefault(); set(x, y - step) }
          if (e.key === 'ArrowDown') { e.preventDefault(); set(x, y + step) }
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          set(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)
        }}
        className="relative w-full max-w-md cursor-crosshair overflow-hidden bg-cream"
        style={{ aspectRatio: media.width && media.height ? `${media.width} / ${media.height}` : '16 / 9' }}
      >
        <Image src={media.url} alt="" fill sizes="448px" className="object-cover" />
        <span className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ivory shadow-[0_0_0_1px_rgba(0,0,0,.4)]" style={{ left: `${x}%`, top: `${y}%` }} />
      </div>
    </FieldShell>
  )
}

function ListField({ id, label, help, itemLabel, max, value, onChange }: { id: string; label: string; help?: string; itemLabel: string; max: number; value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const t = draft.trim()
    if (!t || value.length >= max) return
    onChange([...value, t])
    setDraft('')
  }
  const move = (i: number, d: number) => {
    const next = [...value]
    const [item] = next.splice(i, 1)
    next.splice(i + d, 0, item)
    onChange(next)
  }
  return (
    <FieldShell id={id} label={label} help={help} counter={`${value.length}/${max}`}>
      <ul className="space-y-1.5">
        {value.map((v, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <input aria-label={`${itemLabel} ${i + 1}`} className={inputClass} value={v} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
            <Button variant="ghost" className="min-h-9 px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${itemLabel} up`}>↑</Button>
            <Button variant="ghost" className="min-h-9 px-2" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${itemLabel} down`}>↓</Button>
            <Button variant="ghost" className="min-h-9 px-2" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remove ${itemLabel}`}>Remove</Button>
          </li>
        ))}
      </ul>
      {value.length < max && (
        <div className="flex gap-2 pt-1">
          <input
            id={id}
            className={inputClass}
            placeholder={`Add a ${itemLabel}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          />
          <Button onClick={add} disabled={!draft.trim()}>Add</Button>
        </div>
      )}
    </FieldShell>
  )
}

function StoriesField({ id, label, help, value, onChange }: { id: string; label: string; help?: string; value: string[]; onChange: (v: string[]) => void }) {
  const { stories } = useContext(FormCtx)
  const toggle = (sid: string) => onChange(value.includes(sid) ? value.filter((x) => x !== sid) : [...value, sid].slice(0, 4))
  return (
    <fieldset className="space-y-2" aria-describedby={`${id}-help`}>
      <legend className="text-[0.8125rem] font-semibold">{label}</legend>
      <p id={`${id}-help`} className="text-xs text-ink-soft">{help} Up to four.</p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {stories.map((s) => (
          <li key={s.id}>
            <label className="flex cursor-pointer items-center gap-2 border border-charcoal/10 bg-white/50 px-3 py-2 text-sm">
              <input type="checkbox" checked={value.includes(s.id)} onChange={() => toggle(s.id)} className="accent-olive-deep" />
              <span className="flex-1 truncate">{s.title}</span>
              {value.includes(s.id) && <span className="text-xs text-olive">#{value.indexOf(s.id) + 1}</span>}
              {s.status !== 'published' && <span className="text-xs text-ink-soft">draft</span>}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

function ReelsField({ id, label, value, onChange }: { id: string; label: string; value: Reel[]; onChange: (v: Reel[]) => void }) {
  const update = (i: number, patch: Partial<Reel>) => onChange(value.map((r, k) => (k === i ? { ...r, ...patch } : r)))
  return (
    <fieldset className="space-y-3">
      <legend className="text-[0.8125rem] font-semibold">{label}</legend>
      {value.map((r, i) => (
        <div key={i} className="space-y-3 border border-charcoal/10 bg-white/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Reel {i + 1}</p>
            <div className="flex gap-1">
              <Button variant="ghost" className="min-h-8 px-2" disabled={i === 0} onClick={() => { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n) }} aria-label="Move reel up">↑</Button>
              <Button variant="ghost" className="min-h-8 px-2" disabled={i === value.length - 1} onClick={() => { const n = [...value]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n) }} aria-label="Move reel down">↓</Button>
              <Button variant="ghost" className="min-h-8 px-2" onClick={() => onChange(value.filter((_, k) => k !== i))}>Remove</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaField id={`${id}-${i}-v`} label="Video (vertical)" accept="video" value={r.video} onChange={(v) => update(i, { video: v })} />
            <MediaField id={`${id}-${i}-p`} label="Cover image" accept="image" value={r.poster} onChange={(v) => update(i, { poster: v })} />
          </div>
          <input aria-label={`Reel ${i + 1} caption`} placeholder="Caption, e.g. Getting ready" className={inputClass} value={r.caption} maxLength={80} onChange={(e) => update(i, { caption: e.target.value })} />
        </div>
      ))}
      {value.length < 8 && <Button onClick={() => onChange([...value, { video: null, poster: null, caption: '' }])}>Add a reel</Button>}
    </fieldset>
  )
}

function GalleryField({ id, label, value, onChange }: { id: string; label: string; value: GalleryItem[]; onChange: (v: GalleryItem[]) => void }) {
  const [open, setOpen] = useState(false)
  const update = (i: number, patch: Partial<GalleryItem>) => onChange(value.map((g, k) => (k === i ? { ...g, ...patch } : g)))
  const move = (i: number, d: number) => {
    const n = [...value]
    const [item] = n.splice(i, 1)
    n.splice(i + d, 0, item)
    onChange(n)
  }
  return (
    <fieldset className="space-y-3" id={id}>
      <legend className="sr-only">{label}</legend>
      <p className="text-xs text-ink-soft">
        Add photos and films in the order they should appear. “Half width” items sit side by side in pairs. Videos play only when visitors press play.
      </p>
      {value.length === 0 && <p className="border border-dashed border-charcoal/20 p-6 text-sm text-ink-soft">No photos yet.</p>}
      <ol className="space-y-2">
        {value.map((g, i) => (
          <li key={i} className="flex flex-col gap-3 border border-charcoal/10 bg-white/50 p-3 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-cream">{g.media && <MediaPreview media={g.media} />}</div>
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_10rem]">
              <input aria-label={`Caption for item ${i + 1}`} placeholder="Caption (optional)" className={inputClass} value={g.caption} maxLength={200} onChange={(e) => update(i, { caption: e.target.value })} />
              <select aria-label={`Layout for item ${i + 1}`} className={inputClass} value={g.layout} onChange={(e) => update(i, { layout: e.target.value as GalleryItem['layout'] })}>
                <option value="full">Full width</option>
                <option value="half">Half width</option>
                <option value="offset">Smaller, offset</option>
              </select>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" className="min-h-9 px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move item ${i + 1} up`}>↑</Button>
              <Button variant="ghost" className="min-h-9 px-2" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Move item ${i + 1} down`}>↓</Button>
              <Button variant="ghost" className="min-h-9 px-2" onClick={() => onChange(value.filter((_, k) => k !== i))}>Remove</Button>
            </div>
          </li>
        ))}
      </ol>
      <Button variant="primary" onClick={() => setOpen(true)}>Add photos or films</Button>
      <AdminDialog open={open} onClose={() => setOpen(false)} title="Add to the gallery">
        <p className="mb-4 text-sm text-ink-soft">Select a file and press “Use this”. Upload several at once, then add each one.</p>
        <MediaLibrary
          mode="pick"
          accept="any"
          onPick={(ref) => onChange([...value, { media: ref, caption: '', layout: ref.width && ref.height && ref.width > ref.height ? 'full' : 'half' }])}
        />
      </AdminDialog>
    </fieldset>
  )
}
