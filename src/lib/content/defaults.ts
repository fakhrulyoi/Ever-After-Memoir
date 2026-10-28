// Starter content. Used to seed the database and as a fallback when the
// database is not connected yet. Everything here is editable in /admin.
// Photos in /public/brand are Ever After Memoir's own work. The film and reels
// are slideshows made from those photos — replace them with real footage.

import type {
  MediaRef,
  PageContent,
  PageSlug,
  SettingsContent,
  ServiceContent,
  SocialItemContent,
  StoryContent,
} from './types.ts'

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

interface MediaFile {
  id: string
  file: string
  type: 'image' | 'video'
  width: number
  height: number
  alt: string
  poster?: string
  /** true for placeholder files the owner should replace */
  isSample: boolean
}

export const MEDIA_FILES: MediaFile[] = [
  { id: uuid(1), file: 'bride-salam.jpg', type: 'image', width: 1140, height: 1215, alt: 'Bride smiling as the groom rests his hand on her head after the akad nikah', isSample: false },
  { id: uuid(2), file: 'rings-henna.jpg', type: 'image', width: 1169, height: 1215, alt: 'The couple’s hands with wedding rings and floral henna', isSample: false },
  { id: uuid(3), file: 'holding-hands.jpg', type: 'image', width: 882, height: 1181, alt: 'Bride and groom in white holding hands, bouquet of pink flowers', isSample: false },
  { id: uuid(4), file: 'family-portrait.jpg', type: 'image', width: 853, height: 1223, alt: 'Family in white baju Melayu and wedding dresses laughing together', isSample: false },
  { id: uuid(5), file: 'bride-smile.jpg', type: 'image', width: 462, height: 1089, alt: 'Bride in a tiara and veil smiling', isSample: false },
  { id: uuid(6), file: 'couple-standing.jpg', type: 'image', width: 441, height: 1088, alt: 'Newlyweds standing together and smiling', isSample: false },
  { id: uuid(7), file: 'salam-closeup.jpg', type: 'image', width: 424, height: 532, alt: 'Bride kissing the groom’s hand, eyes closed', isSample: false },
  { id: uuid(8), file: 'pelamin-wide.jpg', type: 'image', width: 423, height: 532, alt: 'Couple seated on the pelamin surrounded by white flowers', isSample: false },
  { id: uuid(9), file: 'pelamin-laugh.jpg', type: 'image', width: 424, height: 533, alt: 'Groom and bride sharing a laugh on the pelamin', isSample: false },
  { id: uuid(10), file: 'rings-detail.jpg', type: 'image', width: 423, height: 533, alt: 'Close-up of the rings and henna', isSample: false },
  { id: uuid(11), file: 'film-poster.jpg', type: 'image', width: 1280, height: 720, alt: 'Cover frame of the highlight film', isSample: false },
  { id: uuid(12), file: 'reel-1-poster.jpg', type: 'image', width: 720, height: 1280, alt: 'Cover frame of a reel', isSample: false },
  { id: uuid(13), file: 'reel-2-poster.jpg', type: 'image', width: 720, height: 1280, alt: 'Cover frame of a reel', isSample: false },
  { id: uuid(14), file: 'reel-3-poster.jpg', type: 'image', width: 720, height: 1280, alt: 'Cover frame of a reel', isSample: false },
  { id: uuid(15), file: 'og.jpg', type: 'image', width: 1200, height: 630, alt: 'Ever After Memoir', isSample: false },
  { id: uuid(28), file: 'film.mp4', type: 'video', width: 1280, height: 720, alt: 'Sample highlight film made from photos', poster: 'film-poster.jpg', isSample: true },
  { id: uuid(30), file: 'reel-1.mp4', type: 'video', width: 720, height: 1280, alt: 'Sample reel made from photos', poster: 'reel-1-poster.jpg', isSample: true },
  { id: uuid(31), file: 'reel-2.mp4', type: 'video', width: 720, height: 1280, alt: 'Sample reel made from photos', poster: 'reel-2-poster.jpg', isSample: true },
  { id: uuid(32), file: 'reel-3.mp4', type: 'video', width: 720, height: 1280, alt: 'Sample reel made from photos', poster: 'reel-3-poster.jpg', isSample: true },
]

export const fileUrl = (file: string) => `/brand/${file}`

function m(file: string): MediaRef {
  const f = MEDIA_FILES.find((s) => s.file === file)
  if (!f) throw new Error(`Unknown media file ${file}`)
  return {
    id: f.id,
    url: fileUrl(f.file),
    type: f.type,
    alt: f.alt,
    width: f.width,
    height: f.height,
    poster: f.poster ? fileUrl(f.poster) : null,
    isSample: f.isSample,
  }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export const DEFAULT_BOOKING_MESSAGE = [
  'Hai Ever After Memoir! Saya nak tempah tarikh {date}.',
  '',
  'Nama: {name}',
  'Pasangan: {partner}',
  'Majlis: {type}',
  'Servis: {service}',
  'Lokasi: {location}',
  'Nota: {notes}',
  '',
  'Rujukan: {ref}',
].join('\n')

export const DEFAULT_SETTINGS: SettingsContent = {
  siteTitle: 'Ever After Memoir',
  tagline: 'Your day, as it felt.',
  metaDescription:
    'Ever After Memoir is a wedding content creator capturing honest moments, fleeting details and the beautiful in-between — in photographs, reels and little films.',
  logo: null,
  favicon: null,
  ogImage: m('og.jpg'),
  contactEmail: '',
  whatsappNumber: '',
  whatsappMessage: "Hi Ever After Memoir, I'd love to ask about my wedding.",
  instagramUrl: 'https://www.instagram.com/everafter.memoir/',
  tiktokUrl: 'https://www.tiktok.com/@everafter.memoir/',
  footerNote: 'Wedding content and little films, made for remembering.',
  filmGrain: true,
  introAnimation: true,
  celebrationTypes: ['Solemnisation (akad nikah)', 'Reception (bersanding)', 'Solemnisation and reception', 'Engagement (tunang)', 'Something else'],
  budgetRanges: [],
  inquiryRetentionMonths: 0,
  bookingEnabled: true,
  bookingLeadDays: 7,
  bookingMonthsAhead: 18,
  bookingMessage: DEFAULT_BOOKING_MESSAGE,
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
export const DEFAULT_PAGES: Record<PageSlug, PageContent> = {
  home: {
    title: 'Home',
    seoTitle: 'Ever After Memoir — Your day, as it felt',
    seoDescription:
      'Wedding content creation and little films by Ever After Memoir. Honest moments, fleeting details and the beautiful in-between.',
    sections: [
      {
        key: 'hero',
        type: 'hero',
        visible: true,
        layout: 'reel',
        slides: [m('bride-salam.jpg'), m('rings-henna.jpg'), m('holding-hands.jpg'), m('family-portrait.jpg')],
        interval: 5,
        eyebrow: 'Wedding content & little films',
        headline: 'Your day,\n*as it felt.*',
        body: 'Honest moments, fleeting details, and the beautiful in-between — thoughtfully captured, so you can relive the feeling long after the day has passed.',
        media: m('bride-salam.jpg'),
        video: null,
        focal: '50% 30%',
        overlay: 0.28,
        primary: { label: 'Check your date', href: '/contact#book' },
        secondary: { label: 'Explore our stories', href: '/stories' },
        showTimecode: true,
      },
      {
        key: 'philosophy',
        type: 'philosophy',
        visible: true,
        eyebrow: 'What we keep',
        headline: 'Not just how it looked.\n*But how it felt.*',
        body: 'The nervous laughter. The trembling hands. The little glances no one else noticed. We capture the moments that happen between the moments — the ones that make your story entirely yours.',
        media: m('holding-hands.jpg'),
        imageSide: 'left',
      },
      {
        key: 'marquee',
        type: 'marquee',
        visible: true,
        words: ['nervous laughter', 'trembling hands', 'quiet glances', 'happy tears', 'the in-between'],
      },
      {
        key: 'featured',
        type: 'featured_stories',
        visible: true,
        eyebrow: 'Stories',
        headline: 'Days, *remembered.*',
        body: 'A few wedding stories, told the way they felt.',
        storyIds: [],
        link: { label: 'See every story', href: '/stories' },
      },
      {
        key: 'break',
        type: 'image_break',
        visible: true,
        media: m('family-portrait.jpg'),
        focal: '50% 35%',
        quote: 'The people who make\n*the day yours.*',
        caption: '',
      },
      {
        key: 'films',
        type: 'films',
        visible: true,
        eyebrow: 'Films & reels',
        headline: 'Little films.\n*Lasting feelings.*',
        body: 'Your day unfolds in a thousand little moments. We bring them together in a way that lets you feel it all over again.',
        film: m('film.mp4'),
        poster: m('film-poster.jpg'),
        filmCaption: 'Sample film made from our photos — replace it with a highlight film in the admin',
        reels: [
          { video: m('reel-1.mp4'), poster: m('reel-1-poster.jpg'), caption: 'After the akad' },
          { video: m('reel-2.mp4'), poster: m('reel-2-poster.jpg'), caption: 'The little details' },
          { video: m('reel-3.mp4'), poster: m('reel-3-poster.jpg'), caption: 'On the pelamin' },
        ],
      },
      {
        key: 'collage',
        type: 'collage',
        visible: true,
        eyebrow: 'In between',
        headline: 'The moments\n*no one planned.*',
        body: 'A kiss on the hand. A laugh on the pelamin. The rings, finally where they belong.',
        items: [
          { media: m('salam-closeup.jpg'), caption: 'Salam' },
          { media: m('pelamin-laugh.jpg'), caption: '' },
          { media: m('bride-smile.jpg'), caption: '' },
          { media: m('rings-detail.jpg'), caption: 'Forever, on one finger' },
          { media: m('pelamin-wide.jpg'), caption: '' },
        ],
        link: { label: 'See the full stories', href: '/stories' },
      },
      {
        key: 'services',
        type: 'services_preview',
        visible: true,
        eyebrow: 'What we offer',
        headline: 'Ways we can *tell your day.*',
        link: { label: 'View services', href: '/services' },
      },
      {
        key: 'testimonials',
        type: 'testimonials',
        visible: true,
        eyebrow: 'Kind words',
        headline: 'From our couples',
        manifesto:
          'We believe in unposed laughter, in the hush before the vows, in hands that hold on a little longer. We believe the best part of your day is the part you were too busy living to notice.',
      },
      {
        key: 'social',
        type: 'social',
        visible: true,
        eyebrow: 'Follow along',
        headline: '@everafter.memoir',
        body: 'Behind the scenes, little reels and the moments in between — on Instagram and TikTok.',
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
        body: 'See which dates are still open, then say hello on WhatsApp.',
        link: { label: 'Check your date', href: '/contact#book' },
      },
    ],
  },
  stories: {
    title: 'Stories',
    seoTitle: 'Stories — Ever After Memoir',
    seoDescription: 'Wedding stories by Ever After Memoir — candid moments, quiet details and little films.',
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'Our stories',
        headline: 'Every wedding\n*feels different.*',
        body: 'Some are loud and golden, some are quiet and close. Here are a few, told the way they felt.',
        media: m('couple-standing.jpg'),
      },
      { key: 'grid', type: 'stories_grid', visible: true, showFilters: true },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: 'Your story\n*could be next.*',
        body: 'See which dates are still open.',
        link: { label: 'Check your date', href: '/contact#book' },
      },
    ],
  },
  services: {
    title: 'Services',
    seoTitle: 'Services — Ever After Memoir',
    seoDescription: 'Wedding day content, highlight films and personalised coverage by Ever After Memoir.',
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'Services',
        headline: 'Made around\n*your day.*',
        body: 'Every couple remembers different things. Choose what matters most to you, and we will shape the coverage around it.',
        media: m('rings-henna.jpg'),
      },
      {
        key: 'list',
        type: 'services_list',
        visible: true,
        addonsHeadline: 'Little extras',
        footnote: 'Every wedding is different, so every quote is too. Pick your date and we will reply with options for your day.',
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Not sure what\n*you need?*",
        body: "Tell us about your day and we'll help you choose.",
        link: { label: 'Check your date', href: '/contact#book' },
      },
    ],
  },
  about: {
    title: 'About',
    seoTitle: 'About — Ever After Memoir',
    seoDescription: 'Ever After Memoir was created for the moments that deserve to be remembered beyond the photographs.',
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'About',
        headline: 'Behind every memoir,\n*a thousand little feelings.*',
        body: 'Ever After Memoir was created for the moments that deserve to be remembered beyond the photographs — the laughter, the happy tears, the quiet glances, and all the beautiful in-between.',
        media: m('bride-smile.jpg'),
      },
      {
        key: 'approach',
        type: 'text_image',
        visible: true,
        eyebrow: 'How we work',
        headline: 'Close enough to feel it.\n*Quiet enough to miss nothing.*',
        body: 'We stay near the moments that matter and out of the way of the ones that should simply happen.\n\nThe result is content that feels like being there again — the getting ready, the vows, the people you love, and everything in between.',
        media: m('salam-closeup.jpg'),
        imageSide: 'right',
      },
      {
        key: 'founder',
        type: 'founder',
        visible: false,
        eyebrow: 'The person behind the camera',
        headline: 'Hello, *I am…*',
        name: '',
        role: '',
        body: '',
        media: null,
      },
      {
        key: 'quote',
        type: 'quote',
        visible: true,
        text: 'Your day, as it felt — not just as it looked.',
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
        body: 'We would love to hear about your day.',
        link: { label: 'Check your date', href: '/contact#book' },
      },
    ],
  },
  contact: {
    title: 'Contact',
    seoTitle: 'Book your date — Ever After Memoir',
    seoDescription: 'Check which wedding dates are still available with Ever After Memoir, then book on WhatsApp.',
    sections: [
      {
        key: 'book',
        type: 'booking',
        visible: true,
        eyebrow: 'Book your date',
        headline: 'Is your date\n*still free?*',
        body: 'Pick your wedding date to see if we’re available. Tell us a little about your day, then we’ll continue the conversation on WhatsApp.',
        note: 'Dates marked “Few slots left” already have another booking. Your date is confirmed once we reply.',
      },
      {
        key: 'inquiry',
        type: 'inquiry',
        visible: true,
        headline: 'Prefer email?\n*Send a detailed inquiry.*',
        body: 'Tell us a little about your day, your plans, and the moments you want to remember most.',
        successHeadline: 'Thank you — *we have your message.*',
        successBody: 'We read every inquiry personally and will reply to the email you gave us.',
        privacyNote:
          'We only use these details to reply to your inquiry and plan your coverage. We never sell or share them.',
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    seoTitle: 'Privacy policy — Ever After Memoir',
    seoDescription: 'How Ever After Memoir handles the personal details you share with us.',
    sections: [
      {
        key: 'policy',
        type: 'rich_text',
        visible: true,
        headline: 'Privacy policy',
        body: [
          '## What we collect',
          'When you book a date or send an inquiry, we receive the details you type in: your name, your partner’s name, email, WhatsApp number, wedding date, location, the type of celebration, the service you are interested in, an optional budget and any notes.',
          '## Why we collect it',
          'We use these details only to reply to you, prepare a quote and plan coverage for your wedding. When you book through WhatsApp, the conversation continues in WhatsApp under its own privacy terms.',
          '## Who can see it',
          'Your inquiry is stored securely and is only visible to the Ever After Memoir team. We do not sell, rent or share your details with anyone for marketing.',
          '## How long we keep it',
          'We keep inquiries for as long as we need them to work with you, and delete closed inquiries we no longer need.',
          '## Your choices',
          'You can ask us at any time to see, correct or delete the details you sent. Reply to any message from us or send a new inquiry with your request.',
          '## Cookies',
          'This website does not use advertising or tracking cookies.',
        ].join('\n\n'),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Example stories — real photos, example text (marked as samples until edited)
// ---------------------------------------------------------------------------
const SAMPLE_NOTE =
  'This story uses real photos with example words. Rewrite it in Admin → Stories with the couple’s own story, or replace it with a new wedding.'

export const DEFAULT_STORIES: (StoryContent & { id: string })[] = [
  {
    id: uuid(101),
    title: 'A Day to Remember',
    slug: 'a-day-to-remember',
    excerpt: 'Bright walls, white baju and a house full of the people who matter.',
    description: SAMPLE_NOTE,
    cover: m('family-portrait.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Akad nikah', 'At home'],
    featured: true,
    gallery: [
      { media: null, caption: 'Before', layout: 'chapter' },
      { media: m('bride-smile.jpg'), caption: 'Ready.', layout: 'half' },
      { media: m('couple-standing.jpg'), caption: '', layout: 'half' },
      { media: null, caption: 'Everyone', layout: 'chapter' },
      { media: m('family-portrait.jpg'), caption: 'The whole family, finally in one photo.', layout: 'offset' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
  },
  {
    id: uuid(102),
    title: 'The Quiet Between Us',
    slug: 'the-quiet-between-us',
    excerpt: 'White flowers, soft light and a kiss on the hand.',
    description: SAMPLE_NOTE,
    cover: m('bride-salam.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Akad nikah', 'Pelamin'],
    featured: true,
    gallery: [
      { media: null, caption: 'The akad', layout: 'chapter' },
      { media: m('salam-closeup.jpg'), caption: 'Salam.', layout: 'half' },
      { media: m('pelamin-wide.jpg'), caption: '', layout: 'half' },
      { media: m('bride-salam.jpg'), caption: '', layout: 'full' },
      { media: null, caption: 'The little things', layout: 'chapter' },
      { media: m('rings-detail.jpg'), caption: '', layout: 'half' },
      { media: m('pelamin-laugh.jpg'), caption: 'And then, laughter.', layout: 'half' },
      { media: m('reel-1.mp4'), caption: 'A little film from the day.', layout: 'offset' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
  },
  {
    id: uuid(103),
    title: 'A Little Forever',
    slug: 'a-little-forever',
    excerpt: 'Henna, rings and two hands that hold on a little longer.',
    description: SAMPLE_NOTE,
    cover: m('holding-hands.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Details', 'Pelamin'],
    featured: true,
    gallery: [
      { media: m('rings-henna.jpg'), caption: 'Henna, still fresh.', layout: 'full' },
      { media: m('rings-detail.jpg'), caption: '', layout: 'half' },
      { media: m('holding-hands.jpg'), caption: '', layout: 'half' },
      { media: m('reel-2.mp4'), caption: '', layout: 'offset' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
  },
]

// ---------------------------------------------------------------------------
// Services — descriptions from the brief; no prices or deliverables invented
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES: (ServiceContent & { id: string })[] = [
  {
    id: uuid(201),
    kind: 'service',
    name: 'Wedding Day Content',
    summary: 'Candid moments, behind-the-scenes details and the atmosphere of the celebration.',
    description:
      'We capture your day as it happens — the getting ready, the in-between, the people around you — as photos and short-form content you can share and keep.',
    deliverables: [],
    price: '',
    showPrice: false,
    priceNote: '',
    featured: false,
    media: m('salam-closeup.jpg'),
  },
  {
    id: uuid(202),
    kind: 'service',
    name: 'Wedding Highlight Films',
    summary: 'Short-form storytelling that brings together the emotions, energy and memorable details of the day.',
    description: 'A little film made from the moments that mattered most, so you can feel your day all over again.',
    deliverables: [],
    price: '',
    showPrice: false,
    priceNote: '',
    featured: false,
    media: m('reel-2-poster.jpg'),
  },
  {
    id: uuid(203),
    kind: 'service',
    name: 'Personalised Coverage',
    summary: "Tailored content coverage based on each couple's priorities and wedding plans.",
    description:
      'Tell us what matters to you and we will shape the coverage around it — from intimate ceremonies to full celebrations.',
    deliverables: [],
    price: '',
    showPrice: false,
    priceNote: '',
    featured: false,
    media: m('pelamin-wide.jpg'),
  },
]

export const DEFAULT_SOCIAL: (SocialItemContent & { id: string })[] = [
  { id: uuid(301), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('reel-1-poster.jpg'), caption: 'On TikTok' },
  { id: uuid(302), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('salam-closeup.jpg'), caption: 'On Instagram' },
  { id: uuid(303), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('reel-2-poster.jpg'), caption: 'On TikTok' },
  { id: uuid(304), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('pelamin-laugh.jpg'), caption: 'On Instagram' },
  { id: uuid(305), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('reel-3-poster.jpg'), caption: 'On TikTok' },
  { id: uuid(306), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('rings-detail.jpg'), caption: 'On Instagram' },
]

export const DEFAULT_SETTINGS_ID = uuid(901)
export const PAGE_IDS: Record<PageSlug, string> = {
  home: uuid(401),
  stories: uuid(402),
  services: uuid(403),
  about: uuid(404),
  contact: uuid(405),
  privacy: uuid(406),
}
