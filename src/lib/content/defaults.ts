// Starter content. Used to seed the database and as a fallback when the
// database is not connected yet. Everything here is editable in /admin.
// Sample images are original abstract placeholders — not client work.

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

interface SampleFile {
  id: string
  file: string
  type: 'image' | 'video'
  width: number
  height: number
  alt: string
  poster?: string
}

export const SAMPLE_FILES: SampleFile[] = [
  { id: uuid(1), file: 'hero.jpg', type: 'image', width: 2400, height: 1350, alt: 'Soft golden light falling across a quiet room (sample image)' },
  { id: uuid(2), file: 'philosophy.jpg', type: 'image', width: 1200, height: 1500, alt: 'Ivory fabric moving in window light (sample image)' },
  { id: uuid(3), file: 'story-1.jpg', type: 'image', width: 1600, height: 2000, alt: 'Warm evening haze (sample image)' },
  { id: uuid(4), file: 'story-1-b.jpg', type: 'image', width: 1800, height: 1200, alt: 'String lights out of focus (sample image)' },
  { id: uuid(5), file: 'story-1-c.jpg', type: 'image', width: 1200, height: 1500, alt: 'Folds of cream linen (sample image)' },
  { id: uuid(6), file: 'story-2.jpg', type: 'image', width: 1800, height: 1200, alt: 'A green garden blurred in afternoon sun (sample image)' },
  { id: uuid(7), file: 'story-2-b.jpg', type: 'image', width: 1200, height: 1500, alt: 'Light through a sheer veil (sample image)' },
  { id: uuid(8), file: 'story-2-c.jpg', type: 'image', width: 1500, height: 1500, alt: 'Blush petals out of focus (sample image)' },
  { id: uuid(9), file: 'story-3.jpg', type: 'image', width: 1200, height: 1500, alt: 'Candlelight glowing in the dark (sample image)' },
  { id: uuid(10), file: 'story-3-b.jpg', type: 'image', width: 1800, height: 1200, alt: 'Fairy lights at night (sample image)' },
  { id: uuid(11), file: 'story-4.jpg', type: 'image', width: 1600, height: 2000, alt: 'Blush and ivory tones in soft focus (sample image)' },
  { id: uuid(12), file: 'story-4-b.jpg', type: 'image', width: 1200, height: 1500, alt: 'Olive leaves in soft focus (sample image)' },
  { id: uuid(13), file: 'about.jpg', type: 'image', width: 1400, height: 1750, alt: 'Linen in morning light (sample image)' },
  { id: uuid(14), file: 'service-1.jpg', type: 'image', width: 1200, height: 1500, alt: 'Sheer fabric in daylight (sample image)' },
  { id: uuid(15), file: 'service-2.jpg', type: 'image', width: 1200, height: 1500, alt: 'Warm lights at an evening reception (sample image)' },
  { id: uuid(16), file: 'service-3.jpg', type: 'image', width: 1200, height: 1500, alt: 'Greenery in soft focus (sample image)' },
  { id: uuid(17), file: 'social-1.jpg', type: 'image', width: 1080, height: 1350, alt: 'Sample social preview' },
  { id: uuid(18), file: 'social-2.jpg', type: 'image', width: 1080, height: 1350, alt: 'Sample social preview' },
  { id: uuid(19), file: 'social-3.jpg', type: 'image', width: 1080, height: 1350, alt: 'Sample social preview' },
  { id: uuid(20), file: 'social-4.jpg', type: 'image', width: 1080, height: 1350, alt: 'Sample social preview' },
  { id: uuid(21), file: 'social-5.jpg', type: 'image', width: 1080, height: 1350, alt: 'Sample social preview' },
  { id: uuid(22), file: 'social-6.jpg', type: 'image', width: 1080, height: 1350, alt: 'Sample social preview' },
  { id: uuid(23), file: 'film-poster.jpg', type: 'image', width: 1920, height: 1080, alt: 'Poster frame for the sample film' },
  { id: uuid(24), file: 'reel-1.jpg', type: 'image', width: 720, height: 1280, alt: 'Poster frame for a sample reel' },
  { id: uuid(25), file: 'reel-2.jpg', type: 'image', width: 720, height: 1280, alt: 'Poster frame for a sample reel' },
  { id: uuid(26), file: 'reel-3.jpg', type: 'image', width: 720, height: 1280, alt: 'Poster frame for a sample reel' },
  { id: uuid(27), file: 'og.jpg', type: 'image', width: 1200, height: 630, alt: 'Ever After Memoir sharing image (sample)' },
  { id: uuid(28), file: 'hero-loop.mp4', type: 'video', width: 1600, height: 900, alt: 'Slow drifting golden light (sample video)', poster: 'hero.jpg' },
  { id: uuid(29), file: 'film.mp4', type: 'video', width: 1280, height: 720, alt: 'Sample highlight film', poster: 'film-poster.jpg' },
  { id: uuid(30), file: 'reel-1.mp4', type: 'video', width: 540, height: 960, alt: 'Sample vertical reel', poster: 'reel-1.jpg' },
  { id: uuid(31), file: 'reel-2.mp4', type: 'video', width: 540, height: 960, alt: 'Sample vertical reel', poster: 'reel-2.jpg' },
  { id: uuid(32), file: 'reel-3.mp4', type: 'video', width: 540, height: 960, alt: 'Sample vertical reel', poster: 'reel-3.jpg' },
]

export const sampleUrl = (file: string) => `/samples/${file}`

function m(file: string): MediaRef {
  const f = SAMPLE_FILES.find((s) => s.file === file)
  if (!f) throw new Error(`Unknown sample ${file}`)
  return {
    id: f.id,
    url: sampleUrl(f.file),
    type: f.type,
    alt: f.alt,
    width: f.width,
    height: f.height,
    poster: f.poster ? sampleUrl(f.poster) : null,
    isSample: true,
  }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
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
  celebrationTypes: ['Solemnisation (akad nikah)', 'Reception (bersanding)', 'Solemnisation and reception', 'Engagement', 'Something else'],
  budgetRanges: [],
  inquiryRetentionMonths: 0,
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
        eyebrow: 'Wedding content & little films',
        headline: 'Your day,\n*as it felt.*',
        body: 'Honest moments, fleeting details, and the beautiful in-between — thoughtfully captured, so you can relive the feeling long after the day has passed.',
        media: m('hero.jpg'),
        video: m('hero-loop.mp4'),
        focal: '50% 45%',
        overlay: 0.28,
        primary: { label: 'Explore our stories', href: '/stories' },
        secondary: { label: "Let's talk about your day", href: '/contact' },
        showTimecode: true,
      },
      {
        key: 'philosophy',
        type: 'philosophy',
        visible: true,
        eyebrow: 'What we keep',
        headline: 'Not just how it looked.\n*But how it felt.*',
        body: 'The nervous laughter. The trembling hands. The little glances no one else noticed. We capture the moments that happen between the moments — the ones that make your story entirely yours.',
        media: m('philosophy.jpg'),
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
        key: 'films',
        type: 'films',
        visible: true,
        eyebrow: 'Films & reels',
        headline: 'Little films.\n*Lasting feelings.*',
        body: 'Your day unfolds in a thousand little moments. We bring them together in a way that lets you feel it all over again.',
        film: m('film.mp4'),
        poster: m('film-poster.jpg'),
        filmCaption: 'Sample film — replace with your own highlight film',
        reels: [
          { video: m('reel-1.mp4'), poster: m('reel-1.jpg'), caption: 'Getting ready' },
          { video: m('reel-2.mp4'), poster: m('reel-2.jpg'), caption: 'First look' },
          { video: m('reel-3.mp4'), poster: m('reel-3.jpg'), caption: 'After the vows' },
        ],
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
        body: 'Tell us a little about your day.',
        link: { label: "Let's create your memoir", href: '/contact' },
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
        eyebrow: 'Our stories',
        headline: 'Every wedding\n*feels different.*',
        body: 'Some are loud and golden, some are quiet and close. Here are a few, told the way they felt.',
        media: null,
      },
      { key: 'grid', type: 'stories_grid', visible: true, showFilters: true },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: 'Your story\n*could be next.*',
        body: 'Tell us about your plans and the moments you care about most.',
        link: { label: "Let's talk about your day", href: '/contact' },
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
        eyebrow: 'Services',
        headline: 'Made around\n*your day.*',
        body: 'Every couple remembers different things. Choose what matters most to you, and we will shape the coverage around it.',
        media: null,
      },
      {
        key: 'list',
        type: 'services_list',
        visible: true,
        addonsHeadline: 'Little extras',
        footnote: 'Every wedding is different, so every quote is too. Send an inquiry and we will reply with options for your day.',
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Not sure what\n*you need?*",
        body: "Tell us about your day and we'll help you choose.",
        link: { label: 'Send an inquiry', href: '/contact' },
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
        eyebrow: 'About',
        headline: 'Behind every memoir,\n*a thousand little feelings.*',
        body: 'Ever After Memoir was created for the moments that deserve to be remembered beyond the photographs — the laughter, the happy tears, the quiet glances, and all the beautiful in-between.',
        media: m('about.jpg'),
      },
      {
        key: 'approach',
        type: 'text_image',
        visible: true,
        eyebrow: 'How we work',
        headline: 'Close enough to feel it.\n*Quiet enough to miss nothing.*',
        body: 'We stay near the moments that matter and out of the way of the ones that should simply happen.\n\nThe result is content that feels like being there again — the getting ready, the vows, the people you love, and everything in between.',
        media: m('philosophy.jpg'),
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
        link: { label: "Let's create your memoir", href: '/contact' },
      },
    ],
  },
  contact: {
    title: 'Contact',
    seoTitle: 'Contact — Ever After Memoir',
    seoDescription: 'Tell Ever After Memoir about your wedding day, your plans and the moments you want to remember most.',
    sections: [
      {
        key: 'inquiry',
        type: 'inquiry',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
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
          'When you send an inquiry, we receive the details you type into the form: your name, your partner’s name, email, WhatsApp number, wedding date, location, the type of celebration, the service you are interested in, an optional budget and any notes.',
          '## Why we collect it',
          'We use these details only to reply to you, prepare a quote and plan coverage for your wedding.',
          '## Who can see it',
          'Your inquiry is stored securely and is only visible to the Ever After Memoir team. We do not sell, rent or share your details with anyone for marketing.',
          '## How long we keep it',
          'We keep inquiries for as long as we need them to work with you, and delete closed inquiries we no longer need.',
          '## Your choices',
          'You can ask us at any time to see, correct or delete the details you sent. Reply to any email from us or send a new inquiry with your request.',
          '## Cookies',
          'This website does not use advertising or tracking cookies.',
        ].join('\n\n'),
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Sample stories (clearly marked as samples)
// ---------------------------------------------------------------------------
export const DEFAULT_STORIES: (StoryContent & { id: string })[] = [
  {
    id: uuid(101),
    title: 'A Day to Remember',
    slug: 'a-day-to-remember',
    excerpt: 'Golden light, slow mornings and a room full of the people who matter.',
    description:
      'This is a sample story that shows how a wedding story will look. Replace the words, images and films with a real wedding in Admin → Stories.',
    cover: m('story-1.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Solemnisation', 'Golden hour'],
    featured: true,
    gallery: [
      { media: m('story-1-b.jpg'), caption: '', layout: 'full' },
      { media: m('story-1-c.jpg'), caption: 'The quiet before.', layout: 'half' },
      { media: m('story-2-b.jpg'), caption: '', layout: 'half' },
      { media: m('reel-1.mp4'), caption: 'A little film from the morning.', layout: 'offset' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
  },
  {
    id: uuid(102),
    title: 'The Quiet Between Us',
    slug: 'the-quiet-between-us',
    excerpt: 'An intimate garden ceremony, told through small gestures.',
    description:
      'This is a sample story that shows how a wedding story will look. Replace the words, images and films with a real wedding in Admin → Stories.',
    cover: m('story-2.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Garden', 'Intimate'],
    featured: true,
    gallery: [
      { media: m('story-2-b.jpg'), caption: '', layout: 'offset' },
      { media: m('story-2-c.jpg'), caption: 'Petals, everywhere.', layout: 'half' },
      { media: m('story-4-b.jpg'), caption: '', layout: 'half' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
  },
  {
    id: uuid(103),
    title: 'In the Golden Light',
    slug: 'in-the-golden-light',
    excerpt: 'Candlelight, long tables and a night that nobody wanted to end.',
    description:
      'This is a sample story that shows how a wedding story will look. Replace the words, images and films with a real wedding in Admin → Stories.',
    cover: m('story-3.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Reception', 'Evening'],
    featured: true,
    gallery: [
      { media: m('story-3-b.jpg'), caption: '', layout: 'full' },
      { media: m('reel-2.mp4'), caption: '', layout: 'offset' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
  },
  {
    id: uuid(104),
    title: 'A Little Forever',
    slug: 'a-little-forever',
    excerpt: 'Soft colours, open windows and a promise made close to home.',
    description:
      'This is a sample story that shows how a wedding story will look. Replace the words, images and films with a real wedding in Admin → Stories.',
    cover: m('story-4.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Solemnisation', 'Intimate'],
    featured: true,
    gallery: [
      { media: m('story-4-b.jpg'), caption: '', layout: 'half' },
      { media: m('story-1-c.jpg'), caption: '', layout: 'half' },
      { media: m('reel-3.mp4'), caption: 'After the vows.', layout: 'offset' },
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
    media: m('service-1.jpg'),
  },
  {
    id: uuid(202),
    kind: 'service',
    name: 'Wedding Highlight Films',
    summary: 'Short-form storytelling that brings together the emotions, energy and memorable details of the day.',
    description:
      'A little film made from the moments that mattered most, so you can feel your day all over again.',
    deliverables: [],
    price: '',
    showPrice: false,
    priceNote: '',
    featured: false,
    media: m('service-2.jpg'),
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
    media: m('service-3.jpg'),
  },
]

export const DEFAULT_SOCIAL: (SocialItemContent & { id: string })[] = [
  { id: uuid(301), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-1.jpg'), caption: 'On Instagram' },
  { id: uuid(302), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-2.jpg'), caption: 'On TikTok' },
  { id: uuid(303), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-3.jpg'), caption: 'On Instagram' },
  { id: uuid(304), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-4.jpg'), caption: 'On TikTok' },
  { id: uuid(305), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-5.jpg'), caption: 'On Instagram' },
  { id: uuid(306), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-6.jpg'), caption: 'On TikTok' },
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
