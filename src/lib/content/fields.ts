// Form definitions for the admin editor. Labels and help are written for a
// non-technical owner.
import type { PageSlug, SectionType } from './types'

export type FieldDef =
  | { kind: 'text'; key: string; label: string; help?: string; placeholder?: string; max?: number }
  | { kind: 'textarea'; key: string; label: string; help?: string; rows?: number; max?: number }
  | { kind: 'headline'; key: string; label: string; help?: string; max?: number }
  | { kind: 'media'; key: string; label: string; help?: string; accept: 'image' | 'video' }
  | { kind: 'link'; key: string; label: string; help?: string }
  | { kind: 'toggle'; key: string; label: string; help?: string }
  | { kind: 'select'; key: string; label: string; help?: string; options: { value: string; label: string }[] }
  | { kind: 'range'; key: string; label: string; help?: string; min: number; max: number; step: number; percent?: boolean }
  | { kind: 'number'; key: string; label: string; help?: string; min: number; max: number }
  | { kind: 'date'; key: string; label: string; help?: string }
  | { kind: 'focal'; key: string; label: string; help?: string; mediaKey: string }
  | { kind: 'list'; key: string; label: string; help?: string; itemLabel: string; max?: number }
  | { kind: 'stories'; key: string; label: string; help?: string }
  | { kind: 'reels'; key: string; label: string; help?: string }
  | { kind: 'gallery'; key: string; label: string; help?: string }
  | { kind: 'slides'; key: string; label: string; help?: string; max: number }
  | { kind: 'collage'; key: string; label: string; help?: string }
  | { kind: 'team'; key: string; label: string; help?: string }
  | { kind: 'heading'; label: string; help?: string }

const HEADLINE_HELP = 'Press Enter for a new line. Wrap words in *stars* to make them italic.'

const eyebrow: FieldDef = { kind: 'text', key: 'eyebrow', label: 'Small label above the heading', max: 80 }
const headline = (label = 'Heading'): FieldDef => ({ kind: 'headline', key: 'headline', label, help: HEADLINE_HELP, max: 160 })
const body = (label = 'Text', rows = 4): FieldDef => ({ kind: 'textarea', key: 'body', label, rows, help: 'Leave an empty line between paragraphs.' })
const image = (key = 'media', label = 'Image'): FieldDef => ({ kind: 'media', key, label, accept: 'image' })
const side: FieldDef = {
  kind: 'select',
  key: 'imageSide',
  label: 'Image position',
  options: [
    { value: 'left', label: 'Image on the left' },
    { value: 'right', label: 'Image on the right' },
  ],
}

export interface SectionDef {
  label: string
  description: string
  fields: FieldDef[]
  /** Pages this section can be added to */
  pages: PageSlug[]
  /** Only one per page */
  single?: boolean
}

export const SECTION_DEFS: Record<SectionType, SectionDef> = {
  hero: {
    label: 'Opening image (hero)',
    description: 'The full-screen opening with your headline.',
    pages: ['home'],
    single: true,
    fields: [
      {
        kind: 'select',
        key: 'layout',
        label: 'Style',
        options: [
          { value: 'reel', label: 'Reel — photos and short videos change one after another, like a story' },
          { value: 'full', label: 'Full screen — one photo or a silent video behind the text' },
        ],
      },
      eyebrow,
      headline('Headline'),
      { kind: 'textarea', key: 'body', label: 'Short introduction', rows: 3, max: 500 },
      { kind: 'slides', key: 'slides', label: 'Reel photos and videos', max: 10, help: 'For the Reel style. Portrait photos at least 1000 px wide, or short vertical videos (5–8 seconds, no sound needed), look best. Drag to change the order.' },
      { kind: 'range', key: 'interval', label: 'Seconds per slide', min: 2, max: 12, step: 1 },
      image('media', 'Full-screen photo'),
      { kind: 'media', key: 'video', label: 'Full-screen background video (optional)', accept: 'video', help: 'For the Full screen style. Plays silently on a loop.' },
      { kind: 'focal', key: 'focal', label: 'Focus point', mediaKey: 'media', help: 'Click the part of the photo that must always stay visible on phones.' },
      { kind: 'range', key: 'overlay', label: 'Darken photo for readability', min: 0, max: 0.8, step: 0.02, percent: true },
      { kind: 'link', key: 'primary', label: 'Main button' },
      { kind: 'link', key: 'secondary', label: 'Second link' },
      { kind: 'toggle', key: 'showTimecode', label: 'Show a running film timecode (large screens only)' },
    ],
  },
  philosophy: {
    label: 'Image with statement',
    description: 'A large statement next to a tall image.',
    pages: ['home', 'about'],
    fields: [eyebrow, headline(), body(), image(), side],
  },
  marquee: {
    label: 'Moving words',
    description: 'A slow line of words that drifts across the page.',
    pages: ['home', 'about', 'stories', 'services'],
    fields: [{ kind: 'list', key: 'words', label: 'Words or short phrases', itemLabel: 'phrase', max: 12 }],
  },
  featured_stories: {
    label: 'Featured stories',
    description: 'Up to four stories in an editorial layout.',
    pages: ['home', 'about'],
    fields: [
      eyebrow,
      headline(),
      { kind: 'textarea', key: 'body', label: 'Short text', rows: 2 },
      { kind: 'stories', key: 'storyIds', label: 'Which stories', help: 'Leave empty to show the stories you marked as “Featured”.' },
      { kind: 'link', key: 'link', label: 'Link' },
    ],
  },
  films: {
    label: 'Films & reels',
    description: 'Your vertical reels in a swipeable row (they open full screen with sound), plus an optional wide highlight film.',
    pages: ['home', 'services', 'about'],
    fields: [
      eyebrow,
      headline(),
      body('Text', 3),
      { kind: 'reels', key: 'reels', label: 'Vertical reels' },
      { kind: 'heading', label: 'Wide highlight film (optional)', help: 'Leave empty if your films are vertical.' },
      { kind: 'media', key: 'film', label: 'Highlight film', accept: 'video', help: 'MP4 works best on every phone. Keep it under 50 MB.' },
      image('poster', 'Film cover image'),
      { kind: 'text', key: 'filmCaption', label: 'Caption under the film' },
    ],
  },
  services_preview: {
    label: 'Services list (short)',
    description: 'Your published services as a simple list.',
    pages: ['home', 'about'],
    fields: [eyebrow, headline(), { kind: 'link', key: 'link', label: 'Link' }],
  },
  testimonials: {
    label: 'Testimonials',
    description: 'Approved testimonials. Shows your manifesto instead until you publish one.',
    pages: ['home', 'about', 'services'],
    single: true,
    fields: [
      eyebrow,
      headline(),
      { kind: 'textarea', key: 'manifesto', label: 'Manifesto (shown while there are no testimonials)', rows: 4 },
    ],
  },
  social: {
    label: 'Social gallery',
    description: 'Links to Instagram and TikTok with your chosen tiles.',
    pages: ['home', 'about', 'stories'],
    fields: [eyebrow, headline(), { kind: 'textarea', key: 'body', label: 'Short text', rows: 2 }],
  },
  cta: {
    label: 'Closing invitation',
    description: 'A large closing line with a button.',
    pages: ['home', 'stories', 'services', 'about'],
    fields: [headline(), { kind: 'textarea', key: 'body', label: 'Short text', rows: 2 }, { kind: 'link', key: 'link', label: 'Button' }],
  },
  page_intro: {
    label: 'Page introduction',
    description: 'The page title, a short introduction and an optional wide image.',
    pages: ['stories', 'services', 'about'],
    fields: [
      {
        kind: 'select',
        key: 'layout',
        label: 'Photo position',
        options: [
          { value: 'side', label: 'Portrait photo beside the title' },
          { value: 'wide', label: 'Wide photo under the title' },
        ],
      },
      eyebrow,
      headline(),
      body('Introduction', 3),
      { kind: 'media', key: 'media', label: 'Photo (optional)', accept: 'image' },
    ],
  },
  text_image: {
    label: 'Text with image',
    description: 'A heading and paragraphs beside an image.',
    pages: ['about', 'services', 'stories', 'home'],
    fields: [eyebrow, headline(), body('Text', 6), image(), side],
  },
  founder: {
    label: 'About the founder',
    description: 'Introduce yourself. Only your own words — nothing is filled in for you.',
    pages: ['about'],
    fields: [
      eyebrow,
      headline(),
      { kind: 'text', key: 'name', label: 'Name' },
      { kind: 'text', key: 'role', label: 'Role' },
      body('Your story', 6),
      image('media', 'Portrait'),
    ],
  },
  stories_grid: {
    label: 'All stories',
    description: 'Every published story, with optional filters.',
    pages: ['stories'],
    single: true,
    fields: [{ kind: 'toggle', key: 'showFilters', label: 'Show filters by tag' }],
  },
  services_list: {
    label: 'Services in detail',
    description: 'Every published service with images, deliverables and prices you choose to show.',
    pages: ['services'],
    single: true,
    fields: [
      { kind: 'text', key: 'addonsHeadline', label: 'Heading above extras' },
      { kind: 'textarea', key: 'footnote', label: 'Note under the list', rows: 2 },
    ],
  },
  inquiry: {
    label: 'Inquiry form',
    description: 'The wedding inquiry form and the thank-you message.',
    pages: ['contact'],
    single: true,
    fields: [
      headline(),
      { kind: 'textarea', key: 'body', label: 'Introduction', rows: 3 },
      { kind: 'headline', key: 'successHeadline', label: 'Thank-you heading', help: HEADLINE_HELP },
      { kind: 'textarea', key: 'successBody', label: 'Thank-you message', rows: 2 },
      { kind: 'textarea', key: 'privacyNote', label: 'Privacy note under the form', rows: 2 },
    ],
  },
  team: {
    label: 'Our team',
    description: 'Introduce the people behind the camera. Members without a name are hidden.',
    pages: ['about', 'home'],
    single: true,
    fields: [
      eyebrow,
      headline(),
      body('Introduction', 3),
      { kind: 'team', key: 'members', label: 'Team members', help: 'Only your own words — nothing is filled in for you. A member appears on the website once you add their name.' },
    ],
  },
  rich_text: {
    label: 'Long text',
    description: 'For policies and longer writing.',
    pages: ['privacy', 'about', 'services'],
    fields: [
      headline(),
      {
        kind: 'textarea',
        key: 'body',
        label: 'Text',
        rows: 18,
        help: 'Start a line with “## ” for a sub-heading. Links: [label](https://address). Leave an empty line between paragraphs.',
      },
    ],
  },
  image_break: {
    label: 'Full-width photo',
    description: 'A large photo across the whole screen, with an optional line of text.',
    pages: ['home', 'about', 'services', 'stories'],
    fields: [
      image('media', 'Photo'),
      { kind: 'focal', key: 'focal', label: 'Focus point', mediaKey: 'media' },
      { kind: 'headline', key: 'quote', label: 'Text on the photo (optional)', help: HEADLINE_HELP, max: 200 },
      { kind: 'text', key: 'caption', label: 'Small caption (optional)' },
    ],
  },
  collage: {
    label: 'Photo collage',
    description: 'Three to five photos arranged like an editorial spread. They move at different speeds as you scroll.',
    pages: ['home', 'about', 'stories', 'services'],
    fields: [
      eyebrow,
      headline(),
      { kind: 'textarea', key: 'body', label: 'Short text', rows: 2 },
      { kind: 'collage', key: 'items', label: 'Photos' },
      { kind: 'link', key: 'link', label: 'Link' },
    ],
  },
  booking: {
    label: 'Booking calendar',
    description: 'Couples pick a date, see if it is free, then continue on WhatsApp.',
    pages: ['contact', 'home'],
    single: true,
    fields: [
      eyebrow,
      headline(),
      { kind: 'textarea', key: 'body', label: 'Introduction', rows: 3 },
      { kind: 'textarea', key: 'note', label: 'Small print under the calendar', rows: 2 },
    ],
  },
  quote: {
    label: 'Quote',
    description: 'One line, large, on deep olive.',
    pages: ['about', 'home', 'services', 'stories'],
    fields: [{ kind: 'textarea', key: 'text', label: 'Quote', rows: 2 }],
  },
}

export const PAGE_LABELS: Record<PageSlug, { label: string; path: string; help: string }> = {
  home: { label: 'Homepage', path: '/', help: 'The first page visitors see.' },
  stories: { label: 'Stories page', path: '/stories', help: 'The introduction above your list of stories.' },
  services: { label: 'Services page', path: '/services', help: 'Text around your services. Edit the services themselves in Services & packages.' },
  about: { label: 'About page', path: '/about', help: 'Your brand story.' },
  contact: { label: 'Contact page', path: '/contact', help: 'The booking calendar and inquiry form text.' },
  privacy: { label: 'Privacy policy', path: '/privacy', help: 'Review this text before launch.' },
}

export const PAGE_SEO_FIELDS: FieldDef[] = [
  { kind: 'text', key: 'title', label: 'Page name (admin only)' },
  { kind: 'text', key: 'seoTitle', label: 'Search engine title', help: 'Shown in Google and browser tabs. Around 50–60 characters.', max: 70 },
  { kind: 'textarea', key: 'seoDescription', label: 'Search engine description', rows: 2, help: 'Around 150 characters.', max: 170 },
]

export const STORY_FIELDS: FieldDef[] = [
  { kind: 'heading', label: 'The story' },
  { kind: 'text', key: 'title', label: 'Title', max: 120 },
  { kind: 'text', key: 'slug', label: 'Web address', help: 'Used in the link: /stories/your-address. Lowercase letters, numbers and dashes.' },
  { kind: 'textarea', key: 'excerpt', label: 'One-line summary', rows: 2, max: 300 },
  { kind: 'textarea', key: 'description', label: 'Story text', rows: 6, help: 'Leave an empty line between paragraphs.' },
  { kind: 'media', key: 'cover', label: 'Cover image', accept: 'image' },
  { kind: 'heading', label: 'Details', help: 'Only fill in what the couple is happy to share.' },
  { kind: 'date', key: 'weddingDate', label: 'Wedding date' },
  { kind: 'text', key: 'venue', label: 'Venue' },
  { kind: 'text', key: 'location', label: 'Location' },
  { kind: 'list', key: 'tags', label: 'Tags', itemLabel: 'tag', max: 10, help: 'Used for the filters on the Stories page, e.g. “Solemnisation”, “Garden”.' },
  { kind: 'toggle', key: 'featured', label: 'Feature on the homepage' },
  { kind: 'toggle', key: 'isSample', label: 'This is a sample (shows a “Sample” label)' },
  { kind: 'heading', label: 'Photos & films' },
  { kind: 'gallery', key: 'gallery', label: 'Gallery' },
  { kind: 'heading', label: 'Search engines' },
  { kind: 'text', key: 'seoTitle', label: 'Search engine title', help: 'Leave empty to use the story title.', max: 70 },
  { kind: 'textarea', key: 'seoDescription', label: 'Search engine description', rows: 2, help: 'Leave empty to use the summary.', max: 170 },
]

export const SERVICE_FIELDS: FieldDef[] = [
  {
    kind: 'select',
    key: 'kind',
    label: 'Type',
    options: [
      { value: 'service', label: 'Service or package' },
      { value: 'addon', label: 'Optional extra' },
    ],
  },
  { kind: 'text', key: 'name', label: 'Name', max: 80 },
  { kind: 'textarea', key: 'summary', label: 'Short summary', rows: 2, max: 300 },
  { kind: 'textarea', key: 'description', label: 'Description', rows: 4 },
  { kind: 'list', key: 'deliverables', label: 'What the couple receives', itemLabel: 'item', max: 20, help: 'Leave empty to hide this list.' },
  { kind: 'media', key: 'media', label: 'Image', accept: 'image' },
  { kind: 'heading', label: 'Price' },
  { kind: 'text', key: 'price', label: 'Price', placeholder: 'e.g. From RM 0,000', help: 'Write it exactly as it should appear.' },
  { kind: 'text', key: 'priceNote', label: 'Note under the price', placeholder: 'e.g. Final quote depends on your day' },
  { kind: 'toggle', key: 'showPrice', label: 'Show the price on the website', help: 'When off, visitors see “Contact for pricing”.' },
  { kind: 'toggle', key: 'featured', label: 'Mark as most requested' },
]

export const TESTIMONIAL_FIELDS: FieldDef[] = [
  { kind: 'textarea', key: 'text', label: 'Testimonial', rows: 5, help: 'The couple’s words, unchanged.' },
  { kind: 'text', key: 'displayName', label: 'Name to show', help: 'Only what the couple agreed to, e.g. “Aina & Hakim”.' },
  { kind: 'text', key: 'weddingDate', label: 'Date to show (optional)', placeholder: 'e.g. June 2026' },
  { kind: 'text', key: 'location', label: 'Location to show (optional)' },
  { kind: 'media', key: 'photo', label: 'Photo (optional)', accept: 'image' },
  { kind: 'toggle', key: 'consentConfirmed', label: 'The couple approved this testimonial for the website', help: 'Required before it can be published.' },
]

export const SOCIAL_FIELDS: FieldDef[] = [
  {
    kind: 'select',
    key: 'platform',
    label: 'Platform',
    options: [
      { value: 'instagram', label: 'Instagram' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'other', label: 'Other link' },
    ],
  },
  { kind: 'text', key: 'url', label: 'Link to the post', placeholder: 'https://www.instagram.com/p/…' },
  { kind: 'media', key: 'preview', label: 'Preview image', accept: 'image', help: 'A still from the post. Portrait (4:5) looks best.' },
  { kind: 'text', key: 'caption', label: 'Caption (shown on hover)' },
]

export const SETTINGS_FIELDS: FieldDef[] = [
  { kind: 'heading', label: 'Brand' },
  { kind: 'text', key: 'siteTitle', label: 'Website name' },
  { kind: 'text', key: 'tagline', label: 'Tagline', help: 'Shown in the footer.' },
  { kind: 'media', key: 'logo', label: 'Logo (optional)', accept: 'image', help: 'Leave empty to use the typeset wordmark. A transparent PNG or SVG-like PNG works best.' },
  { kind: 'media', key: 'favicon', label: 'Browser tab icon (optional)', accept: 'image', help: 'A square image, at least 64 × 64 pixels.' },
  { kind: 'text', key: 'footerNote', label: 'Footer note' },
  { kind: 'heading', label: 'Search & sharing' },
  { kind: 'textarea', key: 'metaDescription', label: 'Default search description', rows: 2, max: 170 },
  { kind: 'media', key: 'ogImage', label: 'Sharing image', accept: 'image', help: 'Shown when your link is shared on WhatsApp or social media. 1200 × 630 pixels is ideal.' },
  { kind: 'heading', label: 'Contact', help: 'Only details you add here are shown on the website.' },
  { kind: 'text', key: 'contactEmail', label: 'Public email address' },
  { kind: 'text', key: 'whatsappNumber', label: 'WhatsApp number', placeholder: '60123456789', help: 'Digits with country code, no spaces. Leave empty to hide the WhatsApp button.' },
  { kind: 'text', key: 'whatsappMessage', label: 'WhatsApp starter message' },
  { kind: 'text', key: 'instagramUrl', label: 'Instagram link' },
  { kind: 'text', key: 'tiktokUrl', label: 'TikTok link' },
  { kind: 'heading', label: 'Booking calendar', help: 'Mark booked dates in Availability. The WhatsApp number above is where bookings are sent.' },
  { kind: 'toggle', key: 'bookingEnabled', label: 'Let couples check dates and book on WhatsApp' },
  { kind: 'number', key: 'bookingLeadDays', label: 'Earliest date couples can pick (days from today)', min: 0, max: 365 },
  { kind: 'number', key: 'bookingMonthsAhead', label: 'How many months ahead the calendar shows', min: 1, max: 36 },
  {
    kind: 'textarea',
    key: 'bookingMessage',
    label: 'WhatsApp message',
    rows: 9,
    help: 'Filled in for the couple. Use {date} {name} {partner} {type} {service} {location} {notes} {ref}. Lines with an empty value are left out. Switch to Bahasa Melayu above to edit the Malay message, used for visitors reading in Malay.',
  },
  { kind: 'heading', label: 'Inquiry form' },
  { kind: 'list', key: 'celebrationTypes', label: 'Types of celebration', itemLabel: 'type', max: 12 },
  { kind: 'list', key: 'budgetRanges', label: 'Budget ranges', itemLabel: 'range', max: 12, help: 'Leave empty to let couples type a budget instead.' },
  { kind: 'number', key: 'inquiryRetentionMonths', label: 'Keep closed inquiries for (months)', min: 0, max: 120, help: '0 means keep them until you delete them. Use “Clean up” on the Inquiries page to remove older ones.' },
  { kind: 'heading', label: 'Look & feel' },
  { kind: 'toggle', key: 'filmGrain', label: 'Subtle film grain over the website' },
  { kind: 'toggle', key: 'introAnimation', label: 'Short opening animation on the first visit' },
]
