// Content shapes stored in the `draft` / `published` jsonb columns.
// Keep this file free of runtime imports so scripts can load it directly.

export type MediaKind = 'image' | 'video'

/** A reference to a media library asset, embedded in content. */
export interface MediaRef {
  id?: string | null
  url: string
  type: MediaKind
  alt?: string
  width?: number | null
  height?: number | null
  /** For videos: poster image URL */
  poster?: string | null
  isSample?: boolean
}

export interface LinkValue {
  label: string
  href: string
}

interface SectionBase {
  /** Stable key for the section inside a page */
  key: string
  visible: boolean
}

export interface HeroSection extends SectionBase {
  type: 'hero'
  /** reel = story-style slideshow beside the headline; full = one full-screen image or video */
  layout: 'reel' | 'full'
  /** Photos for the reel layout, shown one after another */
  slides: MediaRef[]
  /** Seconds each photo stays on screen */
  interval: number
  eyebrow: string
  headline: string
  body: string
  media: MediaRef | null
  video: MediaRef | null
  focal: string
  overlay: number
  primary: LinkValue
  secondary: LinkValue
  showTimecode: boolean
}

export interface PhilosophySection extends SectionBase {
  type: 'philosophy'
  eyebrow: string
  headline: string
  body: string
  media: MediaRef | null
  imageSide: 'left' | 'right'
}

export interface FeaturedStoriesSection extends SectionBase {
  type: 'featured_stories'
  eyebrow: string
  headline: string
  body: string
  /** Specific stories to show. Empty = stories marked "featured". */
  storyIds: string[]
  link: LinkValue
}

export interface Reel {
  video: MediaRef | null
  poster: MediaRef | null
  caption: string
}

export interface FilmsSection extends SectionBase {
  type: 'films'
  eyebrow: string
  headline: string
  body: string
  film: MediaRef | null
  poster: MediaRef | null
  filmCaption: string
  reels: Reel[]
}

export interface MarqueeSection extends SectionBase {
  type: 'marquee'
  words: string[]
}

export interface ServicesPreviewSection extends SectionBase {
  type: 'services_preview'
  eyebrow: string
  headline: string
  link: LinkValue
}

export interface TestimonialsSection extends SectionBase {
  type: 'testimonials'
  eyebrow: string
  headline: string
  /** Shown instead when no testimonials are published */
  manifesto: string
}

export interface SocialSection extends SectionBase {
  type: 'social'
  eyebrow: string
  headline: string
  body: string
}

export interface CtaSection extends SectionBase {
  type: 'cta'
  headline: string
  body: string
  link: LinkValue
}

export interface PageIntroSection extends SectionBase {
  type: 'page_intro'
  /** side = portrait photo beside the title; wide = wide photo under it */
  layout: 'side' | 'wide'
  eyebrow: string
  headline: string
  body: string
  media: MediaRef | null
}

export interface ImageBreakSection extends SectionBase {
  type: 'image_break'
  media: MediaRef | null
  focal: string
  quote: string
  caption: string
}

export interface CollageItem {
  media: MediaRef | null
  caption: string
}

export interface CollageSection extends SectionBase {
  type: 'collage'
  eyebrow: string
  headline: string
  body: string
  items: CollageItem[]
  link: LinkValue
}

export interface BookingSection extends SectionBase {
  type: 'booking'
  eyebrow: string
  headline: string
  body: string
  /** Small print under the calendar */
  note: string
}

export interface TextImageSection extends SectionBase {
  type: 'text_image'
  eyebrow: string
  headline: string
  body: string
  media: MediaRef | null
  imageSide: 'left' | 'right'
}

export interface FounderSection extends SectionBase {
  type: 'founder'
  eyebrow: string
  headline: string
  name: string
  role: string
  body: string
  media: MediaRef | null
}

export interface StoriesGridSection extends SectionBase {
  type: 'stories_grid'
  showFilters: boolean
}

export interface ServicesListSection extends SectionBase {
  type: 'services_list'
  addonsHeadline: string
  footnote: string
}

export interface InquirySection extends SectionBase {
  type: 'inquiry'
  headline: string
  body: string
  successHeadline: string
  successBody: string
  privacyNote: string
}

export interface RichTextSection extends SectionBase {
  type: 'rich_text'
  headline: string
  body: string
}

export interface QuoteSection extends SectionBase {
  type: 'quote'
  text: string
}

export type Section =
  | HeroSection
  | PhilosophySection
  | FeaturedStoriesSection
  | FilmsSection
  | MarqueeSection
  | ServicesPreviewSection
  | TestimonialsSection
  | SocialSection
  | CtaSection
  | PageIntroSection
  | TextImageSection
  | FounderSection
  | StoriesGridSection
  | ServicesListSection
  | InquirySection
  | RichTextSection
  | QuoteSection
  | ImageBreakSection
  | CollageSection
  | BookingSection

export type SectionType = Section['type']

export interface PageContent {
  title: string
  seoTitle: string
  seoDescription: string
  sections: Section[]
}

export type PageSlug = 'home' | 'stories' | 'services' | 'about' | 'contact' | 'privacy'

export interface GalleryItem {
  media: MediaRef | null
  /** For a chapter, this is the chapter title */
  caption: string
  /** chapter = a heading that starts a new part of the story (no photo) */
  layout: 'full' | 'half' | 'offset' | 'chapter'
}

export interface StoryContent {
  title: string
  slug: string
  excerpt: string
  description: string
  cover: MediaRef | null
  weddingDate: string
  venue: string
  location: string
  tags: string[]
  featured: boolean
  gallery: GalleryItem[]
  seoTitle: string
  seoDescription: string
  isSample: boolean
}

export interface ServiceContent {
  kind: 'service' | 'addon'
  name: string
  summary: string
  description: string
  deliverables: string[]
  price: string
  showPrice: boolean
  priceNote: string
  featured: boolean
  media: MediaRef | null
}

export interface TestimonialContent {
  displayName: string
  text: string
  weddingDate: string
  location: string
  photo: MediaRef | null
  consentConfirmed: boolean
}

export interface SocialItemContent {
  platform: 'instagram' | 'tiktok' | 'other'
  url: string
  preview: MediaRef | null
  caption: string
}

export interface SettingsContent {
  siteTitle: string
  tagline: string
  metaDescription: string
  logo: MediaRef | null
  favicon: MediaRef | null
  ogImage: MediaRef | null
  contactEmail: string
  whatsappNumber: string
  whatsappMessage: string
  instagramUrl: string
  tiktokUrl: string
  footerNote: string
  filmGrain: boolean
  introAnimation: boolean
  celebrationTypes: string[]
  budgetRanges: string[]
  inquiryRetentionMonths: number
  bookingEnabled: boolean
  /** Earliest date couples can choose, in days from today */
  bookingLeadDays: number
  /** How far ahead the calendar goes */
  bookingMonthsAhead: number
  /** WhatsApp message. Placeholders: {date} {date_en} {name} {partner} {type} {service} {location} {notes} {ref} */
  bookingMessage: string
}

export type AvailabilityStatus = 'booked' | 'limited' | 'unavailable'

export interface AvailabilityDay {
  day: string
  status: AvailabilityStatus
}

export type ContentTable = 'pages' | 'stories' | 'services' | 'testimonials' | 'social_items' | 'site_settings'

export type ContentStatus = 'draft' | 'published' | 'archived'

export interface ContentRow<T> {
  id: string
  status: ContentStatus
  draft: T
  published: T | null
  published_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
  slug?: string
}

/** What the public site receives for a list item */
export interface Published<T> {
  id: string
  content: T
  sortOrder: number
  publishedAt: string | null
}
