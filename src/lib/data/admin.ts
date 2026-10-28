import 'server-only'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import type { ContentRow, ContentTable, PageSlug } from '../content/types'

export interface AdminRow<T> extends ContentRow<T> {
  hasChanges: boolean
}

function withChanges<T>(r: ContentRow<T>): AdminRow<T> {
  return { ...r, hasChanges: r.status !== 'published' || JSON.stringify(r.draft) !== JSON.stringify(r.published) }
}

const COLS = 'id, status, draft, published, published_at, sort_order, created_at, updated_at'

export async function listRows<T>(table: ContentTable): Promise<AdminRow<T>[]> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data, error } = await sb
    .from(table)
    .select(table === 'pages' ? `${COLS}, slug` : COLS)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as ContentRow<T>[]).map(withChanges)
}

export async function getRow<T>(table: ContentTable, id: string): Promise<AdminRow<T> | null> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb.from(table).select(COLS).eq('id', id).maybeSingle()
  return data ? withChanges(data as unknown as ContentRow<T>) : null
}

export async function getPageRow<T>(slug: PageSlug): Promise<AdminRow<T> | null> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb.from('pages').select(`${COLS}, slug`).eq('slug', slug).maybeSingle()
  return data ? withChanges(data as unknown as ContentRow<T>) : null
}

export async function getSettingsRow<T>(): Promise<AdminRow<T> | null> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data } = await sb.from('site_settings').select(COLS).limit(1).maybeSingle()
  return data ? withChanges(data as unknown as ContentRow<T>) : null
}

export interface InquiryRow {
  id: string
  full_name: string
  partner_name: string
  email: string
  whatsapp: string
  wedding_date: string | null
  location: string
  celebration_type: string
  service_interest: string
  budget: string
  notes: string
  status: 'new' | 'contacted' | 'booked' | 'closed'
  created_at: string
  updated_at: string
}

export async function listInquiries(): Promise<InquiryRow[]> {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const { data, error } = await sb
    .from('inquiries')
    .select('id, full_name, partner_name, email, whatsapp, wedding_date, location, celebration_type, service_interest, budget, notes, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(2000)
  if (error) throw new Error(error.message)
  return (data ?? []) as InquiryRow[]
}

export async function getInquiry(id: string) {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const [{ data: inquiry }, { data: notes }] = await Promise.all([
    sb.from('inquiries').select('*').eq('id', id).maybeSingle(),
    sb.from('inquiry_notes').select('id, note, created_at').eq('inquiry_id', id).order('created_at', { ascending: true }),
  ])
  return inquiry ? { inquiry: inquiry as InquiryRow, notes: notes ?? [] } : null
}

export async function overviewCounts() {
  await requireAdmin()
  const sb = await createSupabaseServer()
  const count = async (table: string, filter?: (q: any) => any) => {
    let q = sb.from(table).select('id', { count: 'exact', head: true })
    if (filter) q = filter(q)
    const { count: c } = await q
    return c ?? 0
  }
  const [newInquiries, publishedStories, draftStories, media, samplesLive] = await Promise.all([
    count('inquiries', (q) => q.eq('status', 'new')),
    count('stories', (q) => q.eq('status', 'published')),
    count('stories', (q) => q.eq('status', 'draft')),
    count('media_assets'),
    count('stories', (q) => q.eq('status', 'published').eq('published->>isSample', 'true')),
  ])
  return { newInquiries, publishedStories, draftStories, media, samplesLive }
}
