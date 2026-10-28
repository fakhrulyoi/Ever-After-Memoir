'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import { publishProblems, validateContent } from '../content/schemas'
import { DEFAULT_STORIES } from '../content/defaults'
import type { ContentTable, StoryContent } from '../content/types'
import { slugify } from '../text'
import { friendlyDbError, type ActionResult } from './result'

const TABLES: ContentTable[] = ['pages', 'stories', 'services', 'testimonials', 'social_items', 'site_settings']
const COLLECTIONS: ContentTable[] = ['stories', 'services', 'testimonials', 'social_items']

function assertTable(table: string): asserts table is ContentTable {
  if (!TABLES.includes(table as ContentTable)) throw new Error('Unknown content type')
}

/** Refresh every public page (small site, so this stays cheap). */
function refreshSite() {
  revalidatePath('/', 'layout')
}

async function slugTaken(sb: Awaited<ReturnType<typeof createSupabaseServer>>, slug: string, exceptId: string) {
  const { data } = await sb
    .from('stories')
    .select('id')
    .neq('id', exceptId)
    .or(`draft->>slug.eq.${slug},published->>slug.eq.${slug}`)
    .limit(1)
  return (data?.length ?? 0) > 0
}

export interface SaveResult {
  updatedAt: string
  hasChanges: boolean
}

/** Save the draft only. The live website does not change. */
export async function saveDraft(table: ContentTable, id: string, draft: unknown): Promise<ActionResult<SaveResult>> {
  await requireAdmin()
  assertTable(table)
  const v = validateContent(table, draft)
  if (!v.ok) return { ok: false, error: v.error }
  const sb = await createSupabaseServer()
  if (table === 'stories') {
    const slug = (v.data as StoryContent).slug
    if (slug && (await slugTaken(sb, slug, id))) {
      return { ok: false, error: `Another story already uses the web address “${slug}”. Choose a different slug.` }
    }
  }
  const { data, error } = await sb.from(table).update({ draft: v.data }).eq('id', id).select('updated_at, status, published').single()
  if (error || !data) return { ok: false, error: friendlyDbError(error?.message ?? 'This item no longer exists.') }
  return {
    ok: true,
    updatedAt: data.updated_at,
    hasChanges: data.status !== 'published' || JSON.stringify(data.published) !== JSON.stringify(v.data),
  }
}

/** Save (optional) then publish: copies the draft to the live website in one step. */
export async function publishItem(table: ContentTable, id: string, draft?: unknown): Promise<ActionResult<{ publishedAt: string }>> {
  await requireAdmin()
  assertTable(table)
  const sb = await createSupabaseServer()
  let content = draft
  if (draft !== undefined) {
    const saved = await saveDraft(table, id, draft)
    if (!saved.ok) return saved
  } else {
    const { data } = await sb.from(table).select('draft').eq('id', id).single()
    content = data?.draft
  }
  const v = validateContent(table, content)
  if (!v.ok) return { ok: false, error: v.error }
  const problems = publishProblems(table, v.data)
  if (problems.length) return { ok: false, error: `Before publishing: ${problems.join(' ')}` }

  const { data, error } = await sb.rpc('publish_content', { p_table: table, p_id: id })
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  refreshSite()
  return { ok: true, publishedAt: data as string }
}

/** Take an item off the live website (kept as a draft, or archived). */
export async function unpublishItem(table: ContentTable, id: string, archive = false): Promise<ActionResult> {
  await requireAdmin()
  assertTable(table)
  const sb = await createSupabaseServer()
  const { error } = await sb.rpc('unpublish_content', { p_table: table, p_id: id, p_archive: archive })
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  refreshSite()
  return { ok: true }
}

const BLANK: Record<string, () => object> = {
  stories: () => ({
    ...DEFAULT_STORIES[0],
    id: undefined,
    title: 'Untitled story',
    slug: `untitled-story-${Math.random().toString(36).slice(2, 7)}`,
    excerpt: '',
    description: '',
    cover: null,
    tags: [],
    featured: false,
    gallery: [],
    isSample: false,
  }),
  services: () => ({ kind: 'service', name: 'New service', summary: '', description: '', deliverables: [], price: '', showPrice: false, priceNote: '', featured: false, media: null }),
  testimonials: () => ({ displayName: '', text: '', weddingDate: '', location: '', photo: null, consentConfirmed: false }),
  social_items: () => ({ platform: 'instagram', url: '', preview: null, caption: '' }),
}

/** Create a new draft item and return its id. */
export async function createItem(table: ContentTable, overrides: object = {}): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  if (!COLLECTIONS.includes(table)) return { ok: false, error: 'This content type cannot be created here.' }
  const base = BLANK[table]()
  delete (base as { id?: string }).id
  const v = validateContent(table, { ...base, ...overrides })
  if (!v.ok) return { ok: false, error: v.error }
  const sb = await createSupabaseServer()
  const { data: last } = await sb.from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const { data, error } = await sb
    .from(table)
    .insert({ draft: v.data, sort_order: (last?.[0]?.sort_order ?? -1) + 1 })
    .select('id')
    .single()
  if (error || !data) return { ok: false, error: friendlyDbError(error?.message) }
  return { ok: true, id: data.id }
}

export async function duplicateStory(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb.from('stories').select('draft').eq('id', id).single()
  if (!data) return { ok: false, error: 'Story not found.' }
  const d = data.draft as StoryContent
  return createItem('stories', {
    ...d,
    title: `${d.title} (copy)`,
    slug: `${slugify(d.slug || d.title)}-copy-${Math.random().toString(36).slice(2, 6)}`.slice(0, 80),
    isSample: false,
  })
}

/** Permanently delete a story, service, testimonial or social tile. */
export async function deleteItem(table: ContentTable, id: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  if (!COLLECTIONS.includes(table)) return { ok: false, error: 'Pages and settings cannot be deleted.' }
  const sb = await createSupabaseServer()
  const { data, error } = await sb.from(table).delete().eq('id', id).select('id')
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  if (!data?.length) return { ok: false, error: 'This item was already deleted.' }
  await sb.from('audit_log').insert({ actor: admin.userId, action: 'delete', entity: table, entity_id: id })
  refreshSite()
  return { ok: true }
}

export async function reorderItems(table: ContentTable, ids: string[]): Promise<ActionResult> {
  await requireAdmin()
  assertTable(table)
  const sb = await createSupabaseServer()
  const { error } = await sb.rpc('reorder_content', { p_table: table, p_ids: ids })
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  refreshSite()
  return { ok: true }
}

export interface VersionInfo {
  id: number
  createdAt: string
}

export async function listVersions(table: ContentTable, id: string): Promise<VersionInfo[]> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb
    .from('content_versions')
    .select('id, created_at')
    .eq('content_type', table)
    .eq('item_id', id)
    .order('id', { ascending: false })
    .limit(10)
  return (data ?? []).map((v) => ({ id: v.id, createdAt: v.created_at }))
}

/** Copy an earlier published version back into the draft (not live until published). */
export async function restoreVersion(versionId: number): Promise<ActionResult<{ draft: unknown }>> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data: v } = await sb.from('content_versions').select('content_type, item_id, snapshot').eq('id', versionId).single()
  if (!v) return { ok: false, error: 'That version no longer exists.' }
  const { error } = await sb.rpc('restore_version', { p_version_id: versionId })
  if (error) return { ok: false, error: friendlyDbError(error.message) }
  return { ok: true, draft: v.snapshot }
}
