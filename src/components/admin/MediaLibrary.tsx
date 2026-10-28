'use client'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  deleteMedia,
  getMediaUsage,
  listMedia,
  registerMedia,
  replaceMedia,
  updateMedia,
  type MediaAsset,
  type MediaUsage,
} from '@/lib/actions/media'
import type { MediaRef } from '@/lib/content/types'
import { Button, Confirm, EmptyState, FieldShell, formatBytes, formatWhen, inputClass } from './ui'
import { uploadFile, validateFile } from './upload'

export function assetToRef(a: MediaAsset): MediaRef {
  return { id: a.id, url: a.url, type: a.type, alt: a.alt_text, width: a.width, height: a.height, poster: null, isSample: a.is_sample }
}

interface QueueItem {
  key: string
  file: File
  progress: number
  error?: string
}

const USAGE_LABEL: Record<string, string> = {
  pages: 'Page',
  stories: 'Story',
  services: 'Service',
  testimonials: 'Testimonial',
  social_items: 'Social tile',
  site_settings: 'Settings',
}

function Thumb({ a }: { a: MediaAsset }) {
  return a.type === 'video' ? (
    <video src={`${a.url}#t=0.5`} className="absolute inset-0 h-full w-full object-cover" muted preload="metadata" playsInline aria-hidden />
  ) : (
    <Image src={a.url} alt={a.alt_text} fill sizes="200px" className="object-cover" />
  )
}

export function MediaLibrary({
  initial,
  mode = 'manage',
  accept = 'any',
  onPick,
  onPickMany,
}: {
  initial?: MediaAsset[]
  mode?: 'manage' | 'pick'
  accept?: 'image' | 'video' | 'any'
  onPick?: (ref: MediaRef) => void
  /** Pick several at once (gallery, reel, collage) */
  onPickMany?: (refs: MediaRef[]) => void
}) {
  const multiple = mode === 'pick' && Boolean(onPickMany)
  const [chosen, setChosen] = useState<string[]>([])
  const toggleChosen = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  const [assets, setAssets] = useState<MediaAsset[]>(initial ?? [])
  const [loading, setLoading] = useState(!initial)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'image' | 'video'>(accept === 'any' ? 'all' : accept)
  const [folder, setFolder] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initial) return
    listMedia()
      .then(setAssets)
      .catch(() => toast.error('Could not load the media library.'))
      .finally(() => setLoading(false))
  }, [initial])

  const folders = useMemo(() => [...new Set(assets.map((a) => a.folder))].sort(), [assets])
  const filtered = assets.filter((a) => {
    if (type !== 'all' && a.type !== type) return false
    if (folder !== 'all' && a.folder !== folder) return false
    if (!query) return true
    const q = query.toLowerCase()
    return [a.alt_text, a.caption, a.folder, a.url.split('/').pop() ?? ''].some((s) => s.toLowerCase().includes(q))
  })
  const current = assets.find((a) => a.id === selected) ?? null

  const startUpload = useCallback(
    async (item: QueueItem) => {
      setQueue((q) => q.map((x) => (x.key === item.key ? { ...x, error: undefined, progress: 0 } : x)))
      try {
        const up = await uploadFile(item.file, (p) => setQueue((q) => q.map((x) => (x.key === item.key ? { ...x, progress: p } : x))))
        const res = await registerMedia({ ...up, alt: '', folder: folder === 'all' ? 'General' : folder })
        if (!res.ok) throw new Error(res.error)
        setAssets((a) => [res.asset, ...a])
        setQueue((q) => q.filter((x) => x.key !== item.key))
        if (onPickMany) setChosen((c) => [...c, res.asset.id])
        else setSelected(res.asset.id)
      } catch (e) {
        setQueue((q) => q.map((x) => (x.key === item.key ? { ...x, error: (e as Error).message } : x)))
      }
    },
    [folder, onPickMany],
  )

  const addFiles = (files: FileList | File[]) => {
    const items = [...files].map((file) => ({ key: crypto.randomUUID(), file, progress: 0, error: validateFile(file) ?? undefined }))
    setQueue((q) => [...items, ...q])
    items.filter((i) => !i.error).forEach(startUpload)
  }

  return (
    <div className={`grid gap-6 ${current ? 'lg:grid-cols-[1fr_22rem]' : ''}`}>
      <div className="min-w-0">
        {/* Upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
          className={`mb-5 flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-8 text-center transition-colors ${dragging ? 'border-olive-deep bg-cream' : 'border-charcoal/25 bg-white/40'}`}
        >
          <p className="text-[0.9375rem]">Drag photos or videos here, or</p>
          <Button variant="primary" onClick={() => fileInput.current?.click()}>Choose files to upload</Button>
          <p className="text-xs text-ink-soft">JPG, PNG, WebP, AVIF up to 15 MB · MP4, WebM, MOV up to 50 MB</p>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*'}
            className="sr-only"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
            aria-label="Upload files"
          />
        </div>

        {queue.length > 0 && (
          <ul className="mb-5 space-y-2" aria-live="polite">
            {queue.map((q) => (
              <li key={q.key} className="border border-charcoal/10 bg-white/60 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{q.file.name}</span>
                  {q.error ? (
                    <span className="flex shrink-0 gap-2">
                      {!validateFile(q.file) && <Button className="min-h-8" onClick={() => startUpload(q)}>Retry</Button>}
                      <Button variant="ghost" className="min-h-8" onClick={() => setQueue((x) => x.filter((i) => i.key !== q.key))}>Dismiss</Button>
                    </span>
                  ) : (
                    <span className="tabular-nums text-ink-soft">{Math.round(q.progress * 100)}%</span>
                  )}
                </div>
                {q.error ? (
                  <p className="mt-1 text-xs text-danger" role="alert">{q.error}</p>
                ) : (
                  <div className="mt-2 h-1 bg-cream" role="progressbar" aria-valuenow={Math.round(q.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${q.file.name}`}>
                    <div className="h-full bg-olive transition-[width]" style={{ width: `${q.progress * 100}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input className={`${inputClass} max-w-xs`} placeholder="Search by alt text, caption or folder" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search media" />
          {accept === 'any' && (
            <select className={`${inputClass} !w-auto`} value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Type">
              <option value="all">Photos & videos</option>
              <option value="image">Photos</option>
              <option value="video">Videos</option>
            </select>
          )}
          <select className={`${inputClass} !w-auto`} value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Folder">
            <option value="all">All folders</option>
            {folders.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square animate-pulse bg-cream" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing here yet" body={assets.length ? 'No files match these filters.' : 'Upload your first photos and films. They can be reused on any page.'} />
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
            {filtered.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => (multiple ? toggleChosen(a.id) : setSelected(a.id))}
                  onDoubleClick={() => mode === 'pick' && !multiple && onPick?.(assetToRef(a))}
                  className={`group relative block aspect-square w-full overflow-hidden bg-cream outline-offset-2 ${selected === a.id || chosen.includes(a.id) ? 'ring-2 ring-olive-deep ring-offset-2 ring-offset-ivory' : ''}`}
                  aria-pressed={multiple ? chosen.includes(a.id) : selected === a.id}
                  aria-label={`${a.type === 'video' ? 'Video' : 'Photo'}: ${a.alt_text || a.url.split('/').pop()}`}
                >
                  <Thumb a={a} />
                  <span className="absolute left-1.5 top-1.5 flex gap-1">
                    {a.type === 'video' && <span className="bg-charcoal/75 px-1.5 py-0.5 text-[0.625rem] text-ivory">Video</span>}
                    {a.is_sample && <span className="bg-ivory/90 px-1.5 py-0.5 text-[0.625rem] text-olive-deep">Sample</span>}
                  </span>
                  {!a.alt_text && a.type === 'image' && <span className="absolute bottom-1.5 left-1.5 bg-[#efe3c8] px-1.5 py-0.5 text-[0.625rem] text-[#6b4f1d]">No alt text</span>}
                  {multiple && (
                    <span className={`absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 px-1 text-xs font-bold ${chosen.includes(a.id) ? 'border-olive-deep bg-olive-deep text-ivory' : 'border-ivory bg-charcoal/30'}`} aria-hidden>
                      {chosen.includes(a.id) ? chosen.indexOf(a.id) + 1 : ''}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {multiple && (
        <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-charcoal/10 bg-ivory/95 px-6 py-4 backdrop-blur lg:col-span-2">
          <p className="text-sm">{chosen.length ? `${chosen.length} selected — added in the order you picked them` : 'Click photos to select them. Upload new ones and they are selected for you.'}</p>
          <div className="flex gap-2">
            {chosen.length > 0 && <Button variant="ghost" onClick={() => setChosen([])}>Clear</Button>}
            <Button
              variant="primary"
              disabled={!chosen.length}
              onClick={() => {
                onPickMany?.(chosen.map((id) => assets.find((a) => a.id === id)).filter((a): a is MediaAsset => !!a).map(assetToRef))
                setChosen([])
              }}
            >
              Add {chosen.length || ''} {chosen.length === 1 ? 'file' : 'files'}
            </Button>
          </div>
        </div>
      )}

      {current && !multiple && (
        <MediaDetails
          key={current.id}
          asset={current}
          mode={mode}
          folders={folders}
          onPick={onPick}
          onClose={() => setSelected(null)}
          onChange={(a) => setAssets((list) => list.map((x) => (x.id === a.id ? a : x)))}
          onDeleted={(id) => { setAssets((list) => list.filter((x) => x.id !== id)); setSelected(null) }}
        />
      )}
    </div>
  )
}

function MediaDetails({
  asset,
  mode,
  folders,
  onPick,
  onClose,
  onChange,
  onDeleted,
}: {
  asset: MediaAsset
  mode: 'manage' | 'pick'
  folders: string[]
  onPick?: (ref: MediaRef) => void
  onClose: () => void
  onChange: (a: MediaAsset) => void
  onDeleted: (id: string) => void
}) {
  const [alt, setAlt] = useState(asset.alt_text)
  const [caption, setCaption] = useState(asset.caption)
  const [folder, setFolder] = useState(asset.folder)
  const [saving, setSaving] = useState(false)
  const [usage, setUsage] = useState<MediaUsage[] | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [replacing, setReplacing] = useState<number | null>(null)
  const replaceInput = useRef<HTMLInputElement>(null)
  const dirty = alt !== asset.alt_text || caption !== asset.caption || folder !== asset.folder
  const live = usage?.some((u) => u.in_published)

  useEffect(() => {
    getMediaUsage(asset.id).then(setUsage).catch(() => setUsage([]))
  }, [asset.id])

  const save = async () => {
    setSaving(true)
    const res = await updateMedia(asset.id, { alt_text: alt, caption, folder: folder || 'General' })
    setSaving(false)
    if (!res.ok) return toast.error(res.error)
    onChange({ ...asset, alt_text: alt, caption, folder: folder || 'General' })
    toast.success('Details saved')
  }

  const replace = async (file: File) => {
    setReplacing(0)
    try {
      const up = await uploadFile(file, (p) => setReplacing(p))
      const res = await replaceMedia(asset.id, { ...up, alt, folder })
      if (!res.ok) throw new Error(res.error)
      onChange(res.asset)
      toast.success('File replaced everywhere it is used')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setReplacing(null)
    }
  }

  const remove = async () => {
    setDeleting(true)
    const res = await deleteMedia(asset.id, Boolean(live))
    setDeleting(false)
    setConfirm(false)
    if (!res.ok) return toast.error(res.error)
    toast.success('File deleted')
    onDeleted(asset.id)
  }

  return (
    <aside className="h-max space-y-5 border border-charcoal/10 bg-white/60 p-5 lg:sticky lg:top-6" aria-label="File details">
      <div className="flex items-start justify-between gap-3">
        <h2 className="display text-2xl text-olive-deep">File details</h2>
        <Button variant="ghost" className="min-h-8 px-2" onClick={onClose} aria-label="Close details">Close</Button>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {asset.type === 'video' ? (
          <video src={asset.url} controls className="absolute inset-0 h-full w-full object-contain" preload="metadata" />
        ) : (
          <Image src={asset.url} alt={asset.alt_text} fill sizes="352px" className="object-contain" />
        )}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs text-ink-soft">
        <div><dt className="font-semibold text-charcoal">Size</dt><dd>{formatBytes(asset.size_bytes)}</dd></div>
        <div><dt className="font-semibold text-charcoal">Dimensions</dt><dd>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : '—'}</dd></div>
        <div><dt className="font-semibold text-charcoal">Added</dt><dd>{formatWhen(asset.created_at)}</dd></div>
        <div><dt className="font-semibold text-charcoal">Type</dt><dd>{asset.is_sample ? 'Sample file' : asset.mime}</dd></div>
      </dl>

      {mode === 'pick' && onPick && (
        <Button variant="primary" className="w-full" onClick={() => onPick({ ...assetToRef(asset), alt })}>
          Use this {asset.type === 'video' ? 'video' : 'photo'}
        </Button>
      )}

      <FieldShell id="m-alt" label="Alt text" help="Describe the photo for people using screen readers and for Google, e.g. “Bride laughing with her sisters before the akad”.">
        <textarea id="m-alt" rows={2} className={inputClass} value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
      </FieldShell>
      <FieldShell id="m-caption" label="Caption (optional)">
        <input id="m-caption" className={inputClass} value={caption} maxLength={500} onChange={(e) => setCaption(e.target.value)} />
      </FieldShell>
      <FieldShell id="m-folder" label="Folder" help="Group files, e.g. by wedding.">
        <input id="m-folder" list="m-folders" className={inputClass} value={folder} maxLength={60} onChange={(e) => setFolder(e.target.value)} />
        <datalist id="m-folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
      </FieldShell>
      <Button variant="primary" busy={saving} disabled={!dirty} onClick={save} className="w-full">Save details</Button>

      <div className="border-t border-charcoal/10 pt-4">
        <p className="mb-2 text-[0.8125rem] font-semibold">Where it’s used</p>
        {usage === null ? (
          <p className="text-xs text-ink-soft">Checking…</p>
        ) : usage.length === 0 ? (
          <p className="text-xs text-ink-soft">Not used anywhere yet.</p>
        ) : (
          <ul className="space-y-1 text-xs">
            {usage.map((u) => (
              <li key={`${u.content_type}-${u.item_id}`} className="flex justify-between gap-2">
                <span>{USAGE_LABEL[u.content_type] ?? u.content_type}: {u.label}</span>
                <span className={u.in_published ? 'text-success' : 'text-ink-soft'}>{u.in_published ? 'Live' : 'Draft'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-charcoal/10 pt-4">
        <Button busy={replacing !== null} onClick={() => replaceInput.current?.click()}>
          {replacing !== null ? `Replacing ${Math.round(replacing * 100)}%` : 'Replace file'}
        </Button>
        <input
          ref={replaceInput}
          type="file"
          accept={asset.type === 'video' ? 'video/*' : 'image/*'}
          className="sr-only"
          aria-label="Choose a replacement file"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) replace(f); e.target.value = '' }}
        />
        <Button variant="danger" onClick={() => setConfirm(true)}>Delete</Button>
      </div>

      <Confirm
        open={confirm}
        danger
        busy={deleting}
        title={live ? 'This file is live' : 'Delete this file?'}
        body={
          live
            ? 'It appears on the live website. Deleting it will leave an empty space there until you choose another file.'
            : 'This permanently removes the file from your library.'
        }
        confirmLabel={live ? 'Delete anyway' : 'Delete file'}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </aside>
  )
}
