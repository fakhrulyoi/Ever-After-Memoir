import { z } from 'zod'
import type {
  ContentTable,
  PageContent,
  ServiceContent,
  SettingsContent,
  SocialItemContent,
  StoryContent,
  TestimonialContent,
} from './types'

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
const text = (max: number) => z.string().max(max, `Keep this under ${max} characters`).default('')

import { isSafeHref, isSafeMediaUrl } from '../url'
export { isSafeHref, isSafeMediaUrl }

const href = z
  .string()
  .max(500)
  .default('')
  .refine(isSafeHref, 'Links must start with /, https://, mailto: or tel:')

const link = z.object({ label: text(60), href }).default({ label: '', href: '' })

export const mediaRefSchema = z.object({
  id: z.string().max(64).nullable().optional(),
  url: z.string().max(1000).refine(isSafeMediaUrl, 'Unsupported media address'),
  type: z.enum(['image', 'video']),
  alt: text(300).optional(),
  width: z.number().int().positive().max(20000).nullable().optional(),
  height: z.number().int().positive().max(20000).nullable().optional(),
  poster: z.string().max(1000).refine(isSafeMediaUrl, 'Unsupported poster address').nullable().optional(),
  isSample: z.boolean().optional(),
})
const media = mediaRefSchema.nullable().default(null)

/** Malay text by field path (see localize in lib/i18n) */
export const translations = z
  .record(z.string().max(80).regex(/^[A-Za-z]+(\.[A-Za-z0-9]+)*$/, 'Invalid field'), z.string().max(20000))
  .default({})

const base = { key: z.string().min(1).max(40), visible: z.boolean().default(true), ms: translations }

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export const sectionSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('hero'),
    layout: z.enum(['reel', 'full']).default('reel'),
    slides: z.array(mediaRefSchema).max(10).default([]),
    interval: z.number().min(2).max(15).default(5),
    eyebrow: text(80),
    headline: text(140),
    body: text(500),
    media,
    video: media,
    focal: z.string().regex(/^\d{1,3}% \d{1,3}%$/).default('50% 50%'),
    overlay: z.number().min(0).max(0.8).default(0.25),
    primary: link,
    secondary: link,
    showTimecode: z.boolean().default(false),
  }),
  z.object({
    ...base,
    type: z.literal('philosophy'),
    eyebrow: text(80),
    headline: text(160),
    body: text(1200),
    media,
    imageSide: z.enum(['left', 'right']).default('left'),
  }),
  z.object({
    ...base,
    type: z.literal('featured_stories'),
    eyebrow: text(80),
    headline: text(140),
    body: text(400),
    storyIds: z.array(z.string().max(64)).max(12).default([]),
    link,
  }),
  z.object({
    ...base,
    type: z.literal('films'),
    eyebrow: text(80),
    headline: text(140),
    body: text(600),
    film: media,
    poster: media,
    filmCaption: text(160),
    reels: z
      .array(z.object({ video: media, poster: media, caption: text(80) }))
      .max(12)
      .default([]),
  }),
  z.object({
    ...base,
    type: z.literal('marquee'),
    words: z.array(z.string().max(40)).max(12).default([]),
  }),
  z.object({ ...base, type: z.literal('services_preview'), eyebrow: text(80), headline: text(140), link }),
  z.object({
    ...base,
    type: z.literal('testimonials'),
    eyebrow: text(80),
    headline: text(140),
    manifesto: text(600),
  }),
  z.object({ ...base, type: z.literal('social'), eyebrow: text(80), headline: text(140), body: text(400) }),
  z.object({ ...base, type: z.literal('cta'), headline: text(140), body: text(300), link }),
  z.object({
    ...base,
    type: z.literal('page_intro'),
    layout: z.enum(['side', 'wide']).default('side'),
    eyebrow: text(80),
    headline: text(160),
    body: text(800),
    media,
  }),
  z.object({
    ...base,
    type: z.literal('text_image'),
    eyebrow: text(80),
    headline: text(160),
    body: text(2000),
    media,
    imageSide: z.enum(['left', 'right']).default('right'),
  }),
  z.object({
    ...base,
    type: z.literal('founder'),
    eyebrow: text(80),
    headline: text(140),
    name: text(80),
    role: text(80),
    body: text(2000),
    media,
  }),
  z.object({ ...base, type: z.literal('stories_grid'), showFilters: z.boolean().default(true) }),
  z.object({ ...base, type: z.literal('services_list'), addonsHeadline: text(80), footnote: text(400) }),
  z.object({
    ...base,
    type: z.literal('inquiry'),
    headline: text(140),
    body: text(500),
    successHeadline: text(140),
    successBody: text(400),
    privacyNote: text(400),
  }),
  z.object({ ...base, type: z.literal('rich_text'), headline: text(140), body: text(20000) }),
  z.object({ ...base, type: z.literal('quote'), text: text(300) }),
  z.object({
    ...base,
    type: z.literal('image_break'),
    media,
    focal: z.string().regex(/^\d{1,3}% \d{1,3}%$/).default('50% 50%'),
    quote: text(200),
    caption: text(120),
  }),
  z.object({
    ...base,
    type: z.literal('collage'),
    eyebrow: text(80),
    headline: text(140),
    body: text(500),
    items: z.array(z.object({ media, caption: text(120) })).max(6).default([]),
    link,
  }),
  z.object({
    ...base,
    type: z.literal('team'),
    eyebrow: text(80),
    headline: text(160),
    body: text(1200),
    members: z
      .array(z.object({ name: text(80), role: text(80), bio: text(800), photo: media }))
      .max(6)
      .default([]),
  }),
  z.object({
    ...base,
    type: z.literal('booking'),
    eyebrow: text(80),
    headline: text(140),
    body: text(500),
    note: text(300),
  }),
])

export const pageSchema = z.object({
  ms: translations,
  title: text(60),
  seoTitle: text(70),
  seoDescription: text(170),
  sections: z.array(sectionSchema).max(30).default([]),
})

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
export const storySchema = z.object({
  ms: translations,
  title: text(120),
  slug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes only')
    .or(z.literal(''))
    .default(''),
  excerpt: text(300),
  description: text(4000),
  cover: media,
  weddingDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Use a valid date').default(''),
  venue: text(120),
  location: text(120),
  tags: z.array(z.string().max(30)).max(10).default([]),
  featured: z.boolean().default(false),
  gallery: z
    .array(z.object({ media, caption: text(200), layout: z.enum(['full', 'half', 'offset', 'chapter']).default('full') }))
    .max(80)
    .default([]),
  seoTitle: text(70),
  seoDescription: text(170),
  isSample: z.boolean().default(false),
})

export const serviceSchema = z.object({
  ms: translations,
  kind: z.enum(['service', 'addon']).default('service'),
  name: text(80),
  summary: text(300),
  description: text(2000),
  deliverables: z.array(z.string().max(160)).max(20).default([]),
  price: text(40),
  showPrice: z.boolean().default(false),
  priceNote: text(120),
  featured: z.boolean().default(false),
  media,
})

export const testimonialSchema = z.object({
  ms: translations,
  displayName: text(80),
  text: text(1200),
  weddingDate: text(40),
  location: text(80),
  photo: media,
  consentConfirmed: z.boolean().default(false),
})

export const socialItemSchema = z.object({
  ms: translations,
  platform: z.enum(['instagram', 'tiktok', 'other']).default('instagram'),
  url: href,
  preview: media,
  caption: text(120),
})

export const settingsSchema = z.object({
  ms: translations,
  siteTitle: text(60),
  tagline: text(120),
  metaDescription: text(170),
  logo: media,
  favicon: media,
  ogImage: media,
  contactEmail: z.string().max(254).email('Enter a valid email').or(z.literal('')).default(''),
  whatsappNumber: z
    .string()
    .max(20)
    .regex(/^(\+?\d[\d ]{6,18})?$/, 'Use digits only, with the country code (e.g. 60123456789)')
    .default(''),
  whatsappMessage: text(200),
  instagramUrl: href,
  tiktokUrl: href,
  footerNote: text(200),
  filmGrain: z.boolean().default(true),
  introAnimation: z.boolean().default(true),
  celebrationTypes: z.array(z.string().max(60)).max(12).default([]),
  budgetRanges: z.array(z.string().max(60)).max(12).default([]),
  inquiryRetentionMonths: z.number().int().min(0).max(120).default(0),
  bookingEnabled: z.boolean().default(true),
  bookingLeadDays: z.number().int().min(0).max(365).default(7),
  bookingMonthsAhead: z.number().int().min(1).max(36).default(18),
  bookingMessage: text(1000),
})

export const SCHEMAS = {
  pages: pageSchema,
  stories: storySchema,
  services: serviceSchema,
  testimonials: testimonialSchema,
  social_items: socialItemSchema,
  site_settings: settingsSchema,
} as const

export type ContentFor<T extends ContentTable> = T extends 'pages'
  ? PageContent
  : T extends 'stories'
    ? StoryContent
    : T extends 'services'
      ? ServiceContent
      : T extends 'testimonials'
        ? TestimonialContent
        : T extends 'social_items'
          ? SocialItemContent
          : SettingsContent

/** Validate content before saving. Returns a readable message on failure. */
export function validateContent<T extends ContentTable>(
  table: T,
  value: unknown,
): { ok: true; data: ContentFor<T> } | { ok: false; error: string } {
  const result = SCHEMAS[table].safeParse(value)
  if (result.success) return { ok: true, data: result.data as ContentFor<T> }
  const issue = result.error.issues[0]
  const where = issue?.path?.filter((p) => typeof p === 'string').join(' → ')
  return { ok: false, error: `${where ? `${where}: ` : ''}${issue?.message ?? 'Invalid content'}` }
}

/** Extra rules checked only when publishing. */
export function publishProblems(table: ContentTable, value: unknown): string[] {
  const problems: string[] = []
  if (table === 'stories') {
    const s = value as StoryContent
    if (!s.title.trim()) problems.push('Add a title.')
    if (!s.slug) problems.push('Add a web address (slug).')
    if (!s.cover) problems.push('Choose a cover image.')
  }
  if (table === 'services' && !(value as ServiceContent).name.trim()) problems.push('Add a name.')
  if (table === 'testimonials') {
    const t = value as TestimonialContent
    if (!t.text.trim()) problems.push('Add the testimonial text.')
    if (!t.consentConfirmed) problems.push('Confirm the couple approved this testimonial before publishing it.')
  }
  if (table === 'social_items') {
    const s = value as SocialItemContent
    if (!s.url) problems.push('Add a link.')
    if (!s.preview) problems.push('Choose a preview image.')
  }
  if (table === 'site_settings' && !(value as SettingsContent).siteTitle.trim()) problems.push('Add a website title.')
  return problems
}

/** Fill in any missing fields (for content saved by older versions). */
export function normalize<T extends ContentTable>(table: T, value: unknown, fallback: ContentFor<T>): ContentFor<T> {
  const parsed = SCHEMAS[table].safeParse(value)
  if (parsed.success) return parsed.data as ContentFor<T>
  if (value && typeof value === 'object') return { ...fallback, ...(value as object) } as ContentFor<T>
  return fallback
}
