'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  deleteItem,
  listVersions,
  publishItem,
  restoreVersion,
  saveDraft,
  unpublishItem,
  type VersionInfo,
} from '@/lib/actions/content'
import type { ContentStatus, ContentTable } from '@/lib/content/types'
import { Button, Confirm, StatusPill, formatWhen } from './ui'
import { useUnsavedGuard } from './useUnsavedGuard'
import { EditLangProvider, LangToggle } from './Translate'
import type { Lang } from '@/lib/i18n'

interface Props<T> {
  table: ContentTable
  id: string
  title: string
  subtitle?: ReactNode
  initialDraft: T
  status: ContentStatus
  hasChanges: boolean
  publishedAt: string | null
  updatedAt: string
  previewHref?: (draft: T) => string | null
  backHref?: string
  backLabel?: string
  canArchive?: boolean
  canDelete?: boolean
  canUnpublish?: boolean
  deleteLabel?: string
  children: (draft: T, setDraft: (next: T) => void) => ReactNode
}

const AUTOSAVE_MS = 20000

export function EditorShell<T>(p: Props<T>) {
  const router = useRouter()
  const [draft, setDraftState] = useState<T>(p.initialDraft)
  const [saved, setSaved] = useState(() => JSON.stringify(p.initialDraft))
  const [status, setStatus] = useState<ContentStatus>(p.status)
  const [hasChanges, setHasChanges] = useState(p.hasChanges)
  const [lastSaved, setLastSaved] = useState(p.updatedAt)
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'unpublish' | 'archive' | 'delete'>(null)
  const [confirm, setConfirm] = useState<null | 'unpublish' | 'archive' | 'delete'>(null)
  const [history, setHistory] = useState<VersionInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('en')
  const dirty = JSON.stringify(draft) !== saved
  useUnsavedGuard(dirty)
  const draftRef = useRef(draft)
  draftRef.current = draft

  const setDraft = useCallback((next: T) => setDraftState(next), [])

  const save = useCallback(
    async (silent = false) => {
      const snapshot = draftRef.current
      setBusy('save')
      const res = await saveDraft(p.table, p.id, snapshot)
      setBusy(null)
      if (!res.ok) {
        setError(res.error)
        if (!silent) toast.error(res.error)
        return false
      }
      setError(null)
      setSaved(JSON.stringify(snapshot))
      setHasChanges(res.hasChanges)
      setLastSaved(res.updatedAt)
      if (!silent) toast.success('Draft saved — not on the website yet')
      return true
    },
    [p.table, p.id],
  )

  // Autosave the draft while editing (drafts are never public)
  useEffect(() => {
    if (!dirty || busy) return
    const t = setTimeout(() => save(true), AUTOSAVE_MS)
    return () => clearTimeout(t)
  }, [draft, dirty, busy, save])

  // Cmd/Ctrl + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  const preview = async () => {
    const base = p.previewHref?.(draftRef.current)
    const href = base && lang === 'ms' ? base.replace(/^\/preview/, '/preview/ms') : base
    if (!href) return toast.error('Add a web address first so the preview knows where to open.')
    const win = window.open('about:blank', '_blank')
    if (dirty && !(await save(true))) {
      win?.close()
      return toast.error('Fix the problem shown above, then preview again.')
    }
    if (win) win.location.href = href
    else window.location.href = href
  }

  const publish = async () => {
    setBusy('publish')
    const snapshot = draftRef.current
    const res = await publishItem(p.table, p.id, snapshot)
    setBusy(null)
    if (!res.ok) {
      setError(res.error)
      toast.error(res.error)
      return
    }
    setError(null)
    setSaved(JSON.stringify(snapshot))
    setStatus('published')
    setHasChanges(false)
    setLastSaved(res.publishedAt)
    toast.success(status === 'published' ? 'Update published — the website now shows your changes' : 'Published — it is now on the website')
    router.refresh()
  }

  const unpublish = async (archive: boolean) => {
    setBusy(archive ? 'archive' : 'unpublish')
    const res = await unpublishItem(p.table, p.id, archive)
    setBusy(null)
    setConfirm(null)
    if (!res.ok) return toast.error(res.error)
    setStatus(archive ? 'archived' : 'draft')
    setHasChanges(true)
    toast.success(archive ? 'Archived — removed from the website' : 'Unpublished — removed from the website')
    router.refresh()
  }

  const remove = async () => {
    setBusy('delete')
    const res = await deleteItem(p.table, p.id)
    setBusy(null)
    setConfirm(null)
    if (!res.ok) return toast.error(res.error)
    toast.success('Deleted')
    setSaved(JSON.stringify(draftRef.current))
    router.push(p.backHref ?? '/admin')
    router.refresh()
  }

  const openHistory = async () => setHistory(await listVersions(p.table, p.id))
  const restore = async (v: VersionInfo) => {
    const res = await restoreVersion(v.id)
    if (!res.ok) return toast.error(res.error)
    setDraftState(res.draft as T)
    setSaved(JSON.stringify(res.draft))
    setHasChanges(true)
    setHistory(null)
    toast.success('Earlier version restored into your draft. Publish to make it live.')
  }

  return (
    <EditLangProvider value={{ lang, setLang }}>
    <div>
      <div className="sticky top-0 z-30 -mx-4 mb-8 border-b border-charcoal/10 bg-ivory/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
        {p.backHref && (
          <Link href={p.backHref} className="mb-2 inline-block text-xs text-ink-soft hover:text-olive-deep">← {p.backLabel ?? 'Back'}</Link>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="display truncate text-3xl leading-tight text-olive-deep md:text-4xl">{p.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
              <StatusPill status={status} hasChanges={hasChanges || dirty} />
              <span aria-live="polite">
                {busy === 'save' ? 'Saving…' : dirty ? 'Unsaved changes' : `Saved ${formatWhen(lastSaved)}`}
              </span>
              {p.subtitle}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LangToggle />
            <Button onClick={() => save()} busy={busy === 'save'} disabled={!dirty || busy !== null}>Save draft</Button>
            {p.previewHref && <Button onClick={preview} disabled={busy !== null}>Preview</Button>}
            <Button variant="primary" onClick={publish} busy={busy === 'publish'} disabled={busy !== null || (status === 'published' && !hasChanges && !dirty)}>
              {status === 'published' ? 'Publish changes' : 'Publish'}
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-3 border-l-2 border-danger bg-[#f6e7e3] px-3 py-2 text-sm text-danger" role="alert">{error}</p>
        )}
      </div>

      {p.children(draft, setDraft)}

      <div className="mt-14 flex flex-wrap gap-2 border-t border-charcoal/10 pt-6">
        <Button variant="ghost" onClick={openHistory}>Version history</Button>
        {(p.canUnpublish ?? true) && status === 'published' && (
          <Button variant="secondary" onClick={() => setConfirm('unpublish')}>Unpublish</Button>
        )}
        {p.canArchive && status !== 'archived' && <Button variant="secondary" onClick={() => setConfirm('archive')}>Archive</Button>}
        {p.canDelete && <Button variant="danger" onClick={() => setConfirm('delete')}>{p.deleteLabel ?? 'Delete'}</Button>}
      </div>

      <Confirm
        open={confirm === 'unpublish'}
        title="Take this off the website?"
        body="Visitors will no longer see it. Your content is kept as a draft and you can publish it again later."
        confirmLabel="Unpublish"
        busy={busy === 'unpublish'}
        onConfirm={() => unpublish(false)}
        onCancel={() => setConfirm(null)}
      />
      <Confirm
        open={confirm === 'archive'}
        title="Archive this?"
        body="It disappears from the website and moves to Archived. Nothing is deleted."
        confirmLabel="Archive"
        busy={busy === 'archive'}
        onConfirm={() => unpublish(true)}
        onCancel={() => setConfirm(null)}
      />
      <Confirm
        open={confirm === 'delete'}
        danger
        title="Delete permanently?"
        body={`“${p.title}” will be removed for good. Photos in the media library are kept.`}
        confirmLabel="Delete permanently"
        busy={busy === 'delete'}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      />
      <Confirm open={history !== null} title="Version history" confirmLabel="Close" onConfirm={() => setHistory(null)} onCancel={() => setHistory(null)}>
        {history && history.length === 0 && <p className="mt-3 text-sm text-ink-soft">No published versions yet.</p>}
        <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {history?.map((v, i) => (
            <li key={v.id} className="flex items-center justify-between gap-3 border border-charcoal/10 bg-white/50 px-3 py-2 text-sm">
              <span>{formatWhen(v.createdAt)}{i === 0 && status === 'published' ? ' — live now' : ''}</span>
              <Button className="min-h-8" onClick={() => restore(v)}>Restore to draft</Button>
            </li>
          ))}
        </ul>
      </Confirm>
    </div>
    </EditLangProvider>
  )
}
