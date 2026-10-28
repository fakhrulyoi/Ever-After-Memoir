import 'server-only'
import { cache } from 'react'
import { isSupabaseConfigured } from '../env'
import { createPublicClient } from '../supabase/public'
import { createSupabaseServer } from '../supabase/server'
import { todayISO } from '../dates'
import {
  DEFAULT_PAGES,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  DEFAULT_SOCIAL,
  DEFAULT_STORIES,
} from '../content/defaults'
import { normalize, type ContentFor } from '../content/schemas'
import type {
  AvailabilityDay,
  ContentTable,
  MediaRef,
  PageContent,
  PageSlug,
  Published,
  ServiceContent,
  SettingsContent,
  SocialItemContent,
  StoryContent,
  TestimonialContent,
} from '../content/types'

/** `published` = the live website. `draft` = admin preview of unpublished changes. */
export type Source = 'published' | 'draft'

export interface SiteData {
  settings: SettingsContent
  /** Dates the owner marked (any other date is available) */
  availability: AvailabilityDay[]
  stories: Published<StoryContent>[]
  services: Published<ServiceContent>[]
  testimonials: Published<TestimonialContent>[]
  social: Published<SocialItemContent>[]
}

async function client(source: Source) {
  return source === 'draft' ? await createSupabaseServer() : createPublicClient()
}

type Row = { id: string; sort_order: number; published_at: string | null; published?: unknown; draft?: unknown }

async function fetchRows(table: ContentTable, source: Source, slug?: string): Promise<Row[]> {
  const sb = await client(source)
  const cols = source === 'draft' ? 'id, draft, sort_order, published_at' : 'id, published, sort_order, published_at'
  let q = sb.from(table).select(cols)
  q = source === 'draft' ? q.neq('status', 'archived') : q.eq('status', 'published')
  if (slug) q = q.eq('slug', slug)
  // Visitors may only read published columns, so sort by those
  const { data, error } = await q
    .order('sort_order', { ascending: true })
    .order(source === 'draft' ? 'created_at' : 'published_at', { ascending: false })
  if (error) throw new Error(`Could not load ${table}: ${error.message}`)
  return (data ?? []) as unknown as Row[]
}

function toPublished<T extends ContentTable>(table: T, rows: Row[], source: Source, fallback: ContentFor<T>) {
  return rows.map((r) => ({
    id: r.id,
    content: normalize(table, source === 'draft' ? r.draft : r.published, fallback),
    sortOrder: r.sort_order,
    publishedAt: r.published_at,
  }))
}

// ---------------------------------------------------------------------------
// Media: replace embedded URLs with the current file (so "Replace file" in the
// media library updates every page that uses it).
// ---------------------------------------------------------------------------
function isMediaRef(v: unknown): v is MediaRef {
  return !!v && typeof v === 'object' && 'url' in v && 'type' in v && typeof (v as MediaRef).url === 'string'
}

function collectIds(value: unknown, ids: Set<string>) {
  if (Array.isArray(value)) value.forEach((v) => collectIds(v, ids))
  else if (value && typeof value === 'object') {
    if (isMediaRef(value) && value.id) ids.add(value.id)
    Object.values(value).forEach((v) => collectIds(v, ids))
  }
}

type MediaRecord = { id: string; url: string; width: number | null; height: number | null; alt_text: string }

function applyMedia<T>(value: T, map: Map<string, MediaRecord>): T {
  if (Array.isArray(value)) return value.map((v) => applyMedia(v, map)) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = applyMedia(v, map)
    if (isMediaRef(value) && value.id && map.has(value.id)) {
      const rec = map.get(value.id)!
      out.url = rec.url
      out.width = rec.width ?? value.width
      out.height = rec.height ?? value.height
      out.alt = value.alt || rec.alt_text || ''
    }
    return out as T
  }
  return value
}

async function resolveMedia<T>(value: T, source: Source): Promise<T> {
  if (!isSupabaseConfigured) return value
  const ids = new Set<string>()
  collectIds(value, ids)
  if (ids.size === 0) return value
  const sb = await client(source)
  const { data } = await sb.from('media_assets').select('id, url, width, height, alt_text').in('id', [...ids])
  const map = new Map<string, MediaRecord>((data ?? []).map((m: MediaRecord) => [m.id, m]))
  return applyMedia(value, map)
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------
const fallbackStories = (): Published<StoryContent>[] =>
  DEFAULT_STORIES.map(({ id, ...content }, i) => ({ id, content, sortOrder: i, publishedAt: null }))

export const getSettings = cache(async (source: Source = 'published'): Promise<SettingsContent> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS
  const rows = await fetchRows('site_settings', source)
  if (!rows[0]) return DEFAULT_SETTINGS
  const content = normalize('site_settings', source === 'draft' ? rows[0].draft : rows[0].published, DEFAULT_SETTINGS)
  return resolveMedia(content, source)
})

export const getPage = cache(async (slug: PageSlug, source: Source = 'published'): Promise<PageContent | null> => {
  if (!isSupabaseConfigured) return DEFAULT_PAGES[slug]
  const rows = await fetchRows('pages', source, slug)
  if (!rows[0]) return null
  const content = normalize('pages', source === 'draft' ? rows[0].draft : rows[0].published, DEFAULT_PAGES[slug])
  return resolveMedia(content, source)
})

export const listStories = cache(async (source: Source = 'published'): Promise<Published<StoryContent>[]> => {
  if (!isSupabaseConfigured) return fallbackStories()
  const rows = await fetchRows('stories', source)
  const items = toPublished('stories', rows, source, DEFAULT_STORIES[0]).filter((s) => s.content.slug)
  return resolveMedia(items, source)
})

export const getStory = cache(async (slug: string, source: Source = 'published') => {
  const stories = await listStories(source)
  const index = stories.findIndex((s) => s.content.slug === slug)
  if (index === -1) return null
  return { story: stories[index], next: stories.length > 1 ? stories[(index + 1) % stories.length] : null }
})

export const listServices = cache(async (source: Source = 'published'): Promise<Published<ServiceContent>[]> => {
  if (!isSupabaseConfigured)
    return DEFAULT_SERVICES.map(({ id, ...content }, i) => ({ id, content, sortOrder: i, publishedAt: null }))
  const rows = await fetchRows('services', source)
  return resolveMedia(toPublished('services', rows, source, DEFAULT_SERVICES[0]), source)
})

export const listTestimonials = cache(async (source: Source = 'published'): Promise<Published<TestimonialContent>[]> => {
  if (!isSupabaseConfigured) return []
  const rows = await fetchRows('testimonials', source)
  const fallback: TestimonialContent = { displayName: '', text: '', weddingDate: '', location: '', photo: null, consentConfirmed: false }
  const items = toPublished('testimonials', rows, source, fallback)
  // Never show a testimonial without the couple's approval, even in preview.
  return resolveMedia(items.filter((t) => t.content.consentConfirmed && t.content.text), source)
})

export const listSocial = cache(async (source: Source = 'published'): Promise<Published<SocialItemContent>[]> => {
  if (!isSupabaseConfigured)
    return DEFAULT_SOCIAL.map(({ id, ...content }, i) => ({ id, content, sortOrder: i, publishedAt: null }))
  const rows = await fetchRows('social_items', source)
  return resolveMedia(toPublished('social_items', rows, source, DEFAULT_SOCIAL[0]), source)
})

/** Upcoming dates marked booked / limited / unavailable. Visitors never see the private note. */
export const getAvailability = cache(async (source: Source = 'published'): Promise<AvailabilityDay[]> => {
  if (!isSupabaseConfigured) return []
  const sb = await client(source)
  const { data, error } = await sb
    .from('availability')
    .select('day, status')
    .gte('day', todayISO())
    .order('day', { ascending: true })
    .limit(2000)
  if (error) throw new Error(`Could not load availability: ${error.message}`)
  return (data ?? []) as AvailabilityDay[]
})

/** Everything a page needs to render its sections. */
export const getSiteData = cache(async (source: Source = 'published'): Promise<SiteData> => {
  const [settings, stories, services, testimonials, social, availability] = await Promise.all([
    getSettings(source),
    listStories(source),
    listServices(source),
    listTestimonials(source),
    listSocial(source),
    getAvailability(source),
  ])
  return { settings, stories, services, testimonials, social, availability }
})
