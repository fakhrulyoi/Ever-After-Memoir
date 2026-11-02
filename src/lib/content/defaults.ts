// Starter content in English with a Malay version (`ms`). Used to seed the
// database and as a fallback when the database is not connected yet.
// Everything here is editable in /admin. Photos and videos in /public/brand
// are everafter.memoir's own work. The three stories use real photos with
// example words, and are marked as samples until the owner rewrites them.

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

const photo = (n: number, file: string, width: number, height: number, alt: string): MediaFile => ({ id: uuid(n), file, type: 'image', width, height, alt, isSample: false })
const film = (n: number, file: string, alt: string): MediaFile => ({ id: uuid(n), file: `${file}.mp4`, type: 'video', width: 720, height: 1280, alt, poster: `${file}-poster.jpg`, isSample: false })
const still = (n: number, file: string, alt: string): MediaFile => photo(n, `${file}-poster.jpg`, 720, 1280, alt)

export const MEDIA_FILES: MediaFile[] = [
  photo(1, 'bride-salam.jpg', 1140, 1215, 'Bride smiling as the groom rests his hand on her head after the akad nikah'),
  photo(2, 'rings-henna.jpg', 1169, 1215, 'The couple’s hands with wedding rings and floral henna'),
  photo(3, 'holding-hands.jpg', 882, 1181, 'Bride and groom in white holding hands, bouquet of pink flowers'),
  photo(4, 'family-portrait.jpg', 853, 1223, 'Family in white baju Melayu and wedding dresses laughing together'),
  photo(5, 'bride-smile.jpg', 462, 1089, 'Bride in a tiara and veil smiling'),
  photo(6, 'couple-standing.jpg', 441, 1088, 'Newlyweds standing together and smiling'),
  photo(7, 'salam-closeup.jpg', 424, 532, 'Bride kissing the groom’s hand, eyes closed'),
  photo(8, 'pelamin-wide.jpg', 423, 532, 'Couple seated on the pelamin surrounded by white flowers'),
  photo(9, 'pelamin-laugh.jpg', 424, 533, 'Groom and bride sharing a laugh on the pelamin'),
  photo(10, 'rings-detail.jpg', 423, 533, 'Close-up of the rings and henna'),
  photo(15, 'og.jpg', 1200, 630, 'everafter.memoir'),
  photo(16, 'bride-window.jpg', 1600, 2133, 'Bride in a beaded veil holding orchids, standing by the window light'),
  photo(17, 'pelamin-decor.jpg', 1600, 2133, 'Pelamin with deep red drapes, pink and red flowers and crystal chandeliers'),
  photo(18, 'engagement-sign.jpg', 1600, 2133, 'Engagement welcome sign on a wooden easel between vases of flowers'),
  photo(19, 'social-1.jpg', 720, 900, 'Bridesmaids in powder blue laughing'),
  photo(20, 'social-2.jpg', 720, 900, 'Bride and groom cutting their wedding cake'),
  photo(21, 'social-3.jpg', 720, 900, 'Couple cheering on the pelamin'),
  photo(22, 'social-4.jpg', 720, 900, 'Bridal shoes, rings and invitation laid out before the day'),
  photo(23, 'social-5.jpg', 720, 900, 'Rose petals on a brick garden path'),
  photo(24, 'social-6.jpg', 720, 900, 'Reception hall with wooden chairs and white flowers'),
  // Films (vertical, with sound) and their cover frames
  film(40, 'hero-just-married', 'Newlyweds in white, soft light around them'),
  film(41, 'hero-holding-hands', 'The couple’s hands, lace and henna'),
  film(42, 'just-married', 'Bride and groom raise their hands together after the ceremony'),
  film(43, 'getting-ready', 'Getting ready: shoes, songkok and the bride'),
  film(44, 'bridesmaids', 'Bridesmaids in powder blue laughing with the bride'),
  film(45, 'holding-hands-film', 'Close-up of the couple holding hands'),
  film(46, 'couple-pelamin', 'Couple on the pelamin beneath their monogram'),
  film(47, 'cake-cutting', 'Cutting the wedding cake together'),
  film(48, 'hall-decor', 'The hall before the guests arrive: welcome screen, guestbook and aisle'),
  film(49, 'hall-details', 'Flowers and guests at the reception hall'),
  film(50, 'venue-vendors', 'A garden venue and its vendors'),
  still(60, 'just-married', 'Bride and groom raising their hands together'),
  still(61, 'getting-ready', 'Groom adjusting his songkok'),
  still(62, 'bridesmaids', 'Bridesmaids laughing with the bride'),
  still(63, 'couple-pelamin', 'Couple smiling on the pelamin'),
  still(64, 'cake-cutting', 'Couple cutting the cake'),
  still(65, 'hall-decor', 'Reception hall aisle with white flowers'),
]

/** Old sample files removed in version 4 (the slideshow film and reels). */
export const RETIRED_MEDIA_IDS = [11, 12, 13, 14, 28, 30, 31, 32].map(uuid)

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

const reel = (file: string, caption: string) => ({ video: m(`${file}.mp4`), poster: null, caption })

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export const DEFAULT_BOOKING_MESSAGE = [
  'Hi everafter.memoir! I’d like to book a date.',
  '',
  'Name: {name}',
  'Date: {date}',
  'Slot: {slot}',
  'Location: {location}',
  'Cover time: {time}',
  'Instagram: {instagram}',
  '',
  'Ref: {ref}',
].join('\n')

export const DEFAULT_BOOKING_MESSAGE_MS = [
  'Hai everafter.memoir! Saya nak book tarikh.',
  '',
  'Nama: {name}',
  'Tarikh: {date}',
  'Slot: {slot}',
  'Tempat: {location}',
  'Cover time: {time}',
  'IG pengantin: {instagram}',
  '',
  'Rujukan: {ref}',
].join('\n')

/** The version 4 messages, so migration 0005 can tell whether the owner changed them */
export const PREVIOUS_BOOKING_MESSAGE = [
  'Hi Ever After Memoir! I’d like to book {date}.',
  '',
  'Name: {name}',
  'Partner: {partner}',
  'Celebration: {type}',
  'Service: {service}',
  'Location: {location}',
  'Notes: {notes}',
  '',
  'Reference: {ref}',
].join('\n')


export const PREVIOUS_BOOKING_MESSAGE_MS = [
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
export const PREVIOUS_TAGLINE_MS = 'Hari anda, seperti yang dirasa.'
export const PREVIOUS_SITE_TITLE = 'Ever After Memoir'

const CELEBRATIONS = ['Solemnisation (akad nikah)', 'Reception (bersanding)', 'Solemnisation and reception', 'Engagement (tunang)', 'Something else']
const CELEBRATIONS_MS = ['Akad nikah', 'Majlis persandingan', 'Akad nikah dan persandingan', 'Majlis pertunangan', 'Lain-lain']

export const DEFAULT_SETTINGS: SettingsContent = {
  siteTitle: 'everafter.memoir',
  tagline: 'Your day, as it felt.',
  metaDescription:
    'everafter.memoir is a wedding content creator team capturing honest moments, fleeting details and the beautiful in-between — in reels, photos and little films.',
  logo: null,
  favicon: null,
  ogImage: m('og.jpg'),
  contactEmail: '',
  whatsappNumber: '',
  whatsappMessage: "Hi everafter.memoir, I'd love to ask about my wedding.",
  instagramUrl: 'https://www.instagram.com/everafter.memoir/',
  tiktokUrl: 'https://www.tiktok.com/@everafter.memoir/',
  footerNote: 'Wedding content and little films, made for remembering.',
  filmGrain: true,
  introAnimation: true,
  celebrationTypes: CELEBRATIONS,
  budgetRanges: [],
  inquiryRetentionMonths: 0,
  bookingEnabled: true,
  bookingLeadDays: 7,
  bookingMonthsAhead: 18,
  bookingMessage: DEFAULT_BOOKING_MESSAGE,
  ms: {
    tagline: 'Simpan rasa hari bahagia korang.',
    metaDescription:
      'everafter.memoir, team wedding content creator yang rakam momen jujur, detail kecil dan semua yang indah di celah-celah majlis. Reels, gambar dan video pendek.',
    whatsappMessage: 'Hai everafter.memoir, nak tanya pasal majlis kahwin saya.',
    footerNote: 'Content kahwin dan video pendek, untuk dikenang lama-lama.',
    bookingMessage: DEFAULT_BOOKING_MESSAGE_MS,
    ...Object.fromEntries(CELEBRATIONS_MS.map((c, i) => [`celebrationTypes.${i}`, c])),
  },
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
const checkDate = { label: 'Check your date', href: '/contact#book' }

export const DEFAULT_PAGES: Record<PageSlug, PageContent> = {
  home: {
    title: 'Home',
    seoTitle: 'everafter.memoir — Wedding content creator',
    seoDescription:
      'Wedding content creation, reels and little films by everafter.memoir. Honest moments, fleeting details and the beautiful in-between.',
    ms: {
      title: 'Utama',
      seoTitle: 'everafter.memoir — Wedding content creator',
      seoDescription: 'Wedding content creator di Malaysia. Reels, gambar dan video pendek dari majlis kahwin korang, oleh everafter.memoir.',
    },
    sections: [
      {
        key: 'hero',
        type: 'hero',
        visible: true,
        layout: 'reel',
        slides: [m('hero-just-married.mp4'), m('bride-window.jpg'), m('hero-holding-hands.mp4'), m('bride-salam.jpg')],
        interval: 5,
        eyebrow: 'Wedding content creators',
        headline: 'Your day,\n*as it felt.*',
        body: 'Honest moments, fleeting details, and the beautiful in-between — thoughtfully captured, so you can relive the feeling long after the day has passed.',
        media: m('bride-window.jpg'),
        video: null,
        focal: '50% 35%',
        overlay: 0.15,
        primary: checkDate,
        secondary: { label: 'Watch our reels', href: '#reels' },
        showTimecode: false,
        ms: {
          eyebrow: 'Wedding content creator',
          headline: 'Hari bahagia korang,\n*kami simpan rasanya.*',
          body: 'Gelak tawa, air mata, renungan curi-curi masa akad. Semua momen kecil tu kami rakam, supaya korang boleh rasa balik bila-bila masa.',
          'primary.label': 'Check tarikh',
          'secondary.label': 'Tengok reels kami',
        },
      },
      {
        key: 'philosophy',
        type: 'philosophy',
        visible: true,
        eyebrow: 'What we keep',
        headline: 'Not just how it looked.\n*But how it felt.*',
        body: 'The nervous laughter. The trembling hands. The little glances no one else noticed. We capture the moments that happen between the moments — the ones that make your story entirely yours.',
        media: m('rings-henna.jpg'),
        imageSide: 'left',
        ms: {
          eyebrow: 'Apa yang kami kejar',
          headline: 'Bukan sekadar cantik.\n*Tapi rasa dia sampai.*',
          body: 'Tangan yang menggigil masa lafaz akad. Mak yang curi-curi lap air mata. Kawan-kawan yang tak berhenti mengusik. Benda-benda kecil macam ni la yang kami cari, sebab ni la yang korang akan rindu nanti.',
        },
      },
      {
        key: 'reels',
        type: 'films',
        visible: true,
        eyebrow: 'Reels',
        headline: 'Little films.\n*Lasting feelings.*',
        body: 'Your day unfolds in a thousand little moments. We bring them together in a way that lets you feel it all over again.',
        film: null,
        poster: null,
        filmCaption: '',
        reels: [
          reel('just-married', 'Just married'),
          reel('getting-ready', 'Getting ready'),
          reel('bridesmaids', 'The bridesmaids'),
          reel('couple-pelamin', 'On the pelamin'),
          reel('cake-cutting', 'Cutting the cake'),
          reel('holding-hands-film', 'Hold on a little longer'),
          reel('hall-decor', 'Before the guests arrive'),
          reel('venue-vendors', 'The venue & vendors'),
          reel('hall-details', 'Little details'),
        ],
        ms: {
          headline: 'Video pendek.\n*Kenangan panjang.*',
          body: 'Satu hari, beribu momen kecil. Kami cantumkan jadi video yang buat korang senyum setiap kali tengok.',
          'reels.0.caption': 'Sah!',
          'reels.1.caption': 'Bersiap',
          'reels.2.caption': 'Geng pengapit',
          'reels.3.caption': 'Atas pelamin',
          'reels.4.caption': 'Potong kek',
          'reels.5.caption': 'Pegang erat-erat',
          'reels.6.caption': 'Sebelum tetamu sampai',
          'reels.7.caption': 'Venue & vendor',
          'reels.8.caption': 'Detail kecil',
        },
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
        ms: {
          eyebrow: 'Kisah',
          headline: 'Majlis yang *kami sempat rakam.*',
          body: 'Antara majlis yang kami rakam, dan cerita di sebaliknya.',
          'link.label': 'Tengok semua kisah',
        },
      },
      {
        key: 'break',
        type: 'image_break',
        visible: true,
        media: m('holding-hands.jpg'),
        focal: '50% 50%',
        quote: 'Hold on\n*a little longer.*',
        caption: '',
        ms: { quote: 'Pegang\n*lama sikit.*' },
      },
      {
        key: 'services',
        type: 'services_preview',
        visible: true,
        eyebrow: 'What we offer',
        headline: 'Ways we can *tell your day.*',
        link: { label: 'View services', href: '/services' },
        ms: { eyebrow: 'Servis', headline: 'Apa yang *kami boleh buat.*', 'link.label': 'Tengok servis' },
      },
      {
        key: 'testimonials',
        type: 'testimonials',
        visible: false,
        eyebrow: 'Kind words',
        headline: 'From our couples',
        manifesto:
          'We believe in unposed laughter, in the hush before the vows, in hands that hold on a little longer. We believe the best part of your day is the part you were too busy living to notice.',
        ms: {
          eyebrow: 'Kata mereka',
          headline: 'Dari pasangan kami',
          manifesto:
            'Kami suka gelak yang tak dibuat-buat, sunyi sekejap sebelum akad, dan tangan yang pegang lama sikit. Selalunya momen paling best hari tu adalah momen yang korang sendiri tak sempat perasan.',
        },
      },
      {
        key: 'social',
        type: 'social',
        visible: true,
        eyebrow: 'Follow along',
        headline: '@everafter.memoir',
        body: 'Behind the scenes, little reels and the moments in between — on Instagram and TikTok.',
        ms: { eyebrow: 'Follow kami', body: 'Behind the scenes, reels dan momen-momen kecil. Semua ada kat Instagram dan TikTok.' },
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
        body: 'See which dates are still open, then say hello on WhatsApp.',
        link: checkDate,
        ms: {
          headline: 'Jom simpan\n*kenangan korang.*',
          body: 'Check tarikh yang masih kosong, lepas tu terus WhatsApp kami.',
          'link.label': 'Check tarikh',
        },
      },
    ],
  },
  stories: {
    title: 'Stories',
    seoTitle: 'Stories — everafter.memoir',
    seoDescription: 'Wedding stories by everafter.memoir — candid moments, quiet details and little films.',
    ms: { title: 'Kisah', seoTitle: 'Kisah — everafter.memoir', seoDescription: 'Majlis-majlis yang kami rakam: momen spontan, detail kecil dan video pendek.' },
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'Our stories',
        headline: 'Every wedding\n*feels different.*',
        body: 'Some are loud and golden, some are quiet and close. Here are a few, told the way they felt.',
        media: m('engagement-sign.jpg'),
        ms: {
          eyebrow: 'Kisah kami',
          headline: 'Setiap majlis\n*ada rasa sendiri.*',
          body: 'Ada yang meriah sampai malam, ada yang kecil dan intim. Ni antara majlis yang kami sempat rakam.',
        },
      },
      { key: 'grid', type: 'stories_grid', visible: true, showFilters: true },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: 'Your story\n*could be next.*',
        body: 'See which dates are still open.',
        link: checkDate,
        ms: { headline: 'Lepas ni,\n*kisah korang pula.*', body: 'Tengok tarikh yang masih kosong.', 'link.label': 'Check tarikh' },
      },
    ],
  },
  services: {
    title: 'Services',
    seoTitle: 'Services — everafter.memoir',
    seoDescription: 'Wedding content creator (WCC) coverage, highlight films and personalised coverage by everafter.memoir.',
    ms: { title: 'Servis', seoTitle: 'Servis — everafter.memoir', seoDescription: 'Servis wedding content creator (WCC), video highlight dan liputan ikut citarasa oleh everafter.memoir.' },
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'Services',
        headline: 'Made around\n*your day.*',
        body: 'Every couple remembers different things. Choose what matters most to you, and we will shape the coverage around it.',
        media: m('just-married-poster.jpg'),
        ms: {
          eyebrow: 'Servis',
          headline: 'Ikut cara\n*korang nak.*',
          body: 'Setiap pasangan nak simpan benda yang lain-lain. Bagitahu kami apa yang paling penting, kami susun liputan ikut tu.',
        },
      },
      {
        key: 'list',
        type: 'services_list',
        visible: true,
        addonsHeadline: 'Little extras',
        footnote: 'Every wedding is different, so every quote is too. Pick your date and we will reply with options for your day.',
        ms: {
          addonsHeadline: 'Tambahan',
          footnote: 'Setiap majlis lain-lain, jadi harga pun ikut majlis. Pilih tarikh dulu, nanti kami bagi pilihan yang sesuai.',
        },
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: 'Not sure what\n*you need?*',
        body: "Tell us about your day and we'll help you choose.",
        link: checkDate,
        ms: { headline: 'Tak pasti\n*nak ambil yang mana?*', body: 'Cerita sikit pasal majlis korang, kami tolong pilihkan.', 'link.label': 'Check tarikh' },
      },
    ],
  },
  about: {
    title: 'About',
    seoTitle: 'About — everafter.memoir',
    seoDescription: 'everafter.memoir is a team of two wedding content creators, made for the moments that deserve to be remembered beyond the photographs.',
    ms: {
      title: 'Tentang Kami',
      seoTitle: 'Tentang Kami — everafter.memoir',
      seoDescription: 'everafter.memoir, team dua orang wedding content creator yang rakam momen-momen kecil hari bahagia korang.',
    },
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'About',
        headline: 'Behind every memoir,\n*a thousand little feelings.*',
        body: 'everafter.memoir was created for the moments that deserve to be remembered beyond the photographs — the laughter, the happy tears, the quiet glances, and all the beautiful in-between.',
        media: m('bride-window.jpg'),
        ms: {
          eyebrow: 'Tentang kami',
          headline: 'Setiap memoir,\n*ada seribu rasa.*',
          body: 'everafter.memoir bermula sebab kami percaya majlis kahwin bukan sekadar gambar cantik. Ia pasal gelak tawa, air mata gembira, renungan senyap, dan semua benda kecil di celah-celahnya.',
        },
      },
      {
        key: 'team',
        type: 'team',
        visible: true,
        eyebrow: 'The team',
        headline: 'Two creators,\n*one way of seeing.*',
        body: 'We are a team of two — wedding content creators first, photographers too. One of us is usually where the laughter is; the other is watching for the moment just after it.',
        members: [
          { name: '', role: 'Wedding content creator', bio: '', photo: null },
          { name: '', role: 'Wedding content creator & photographer', bio: '', photo: null },
        ],
        ms: {
          eyebrow: 'Kami berdua',
          headline: 'Dua orang,\n*satu cara pandang.*',
          body: 'Kami team dua orang. Wedding content creator, dan photographer sekali. Selalunya sorang ada dekat tempat orang tengah gelak, sorang lagi tunggu momen lepas tu.',
          'members.0.role': 'Wedding content creator',
          'members.1.role': 'Wedding content creator & photographer',
        },
      },
      {
        key: 'approach',
        type: 'text_image',
        visible: true,
        eyebrow: 'How we work',
        headline: 'Close enough to feel it.\n*Quiet enough to miss nothing.*',
        body: 'We stay near the moments that matter and out of the way of the ones that should simply happen.\n\nThe result is content that feels like being there again — the getting ready, the vows, the people you love, and everything in between.',
        media: m('getting-ready-poster.jpg'),
        imageSide: 'right',
        ms: {
          eyebrow: 'Cara kami kerja',
          headline: 'Cukup dekat untuk rasa.\n*Cukup senyap untuk tak terlepas apa-apa.*',
          body: 'Kami duduk dekat dengan momen yang penting, dan tak kacau momen yang patut berlaku dengan sendiri.\n\nHasilnya, video dan gambar yang buat korang rasa macam berada kat situ semula. Masa bersiap, masa akad, orang-orang tersayang, dan semua yang ada di celah-celahnya.',
        },
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
        link: { label: 'See the stories', href: '/stories' },
        ms: {
          eyebrow: 'Di celah-celah',
          headline: 'Momen yang\n*tak dirancang.*',
          body: 'Cium tangan. Gelak atas pelamin. Cincin yang akhirnya tersarung.',
          'items.0.caption': 'Salam',
          'items.3.caption': 'Satu jari, selamanya',
          'link.label': 'Tengok kisah',
        },
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
        ms: { text: 'Bukan sekadar cantik dalam gambar. Tapi rasa dia masih sampai.' },
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
        body: 'We would love to hear about your day.',
        link: checkDate,
        ms: { headline: 'Jom simpan\n*kenangan korang.*', body: 'Kami nak sangat dengar pasal majlis korang.', 'link.label': 'Check tarikh' },
      },
    ],
  },
  contact: {
    title: 'Contact',
    seoTitle: 'Book your date — everafter.memoir',
    seoDescription: 'Check which wedding dates are still available with everafter.memoir, then book on WhatsApp.',
    ms: { title: 'Hubungi', seoTitle: 'Book tarikh — everafter.memoir', seoDescription: 'Check tarikh yang masih kosong dengan everafter.memoir, pilih slot siang atau malam, lepas tu book terus kat WhatsApp.' },
    sections: [
      {
        key: 'book',
        type: 'booking',
        visible: true,
        eyebrow: 'Book your date',
        headline: 'Is your date\n*still free?*',
        body: 'Pick your date and a day or night slot, add a few details, and we’ll continue on WhatsApp.',
        note: 'Each date has two slots: day and night. Your date is confirmed once we reply.',
        ms: {
          eyebrow: 'Booking',
          headline: 'Tarikh korang\n*masih kosong?*',
          body: 'Pilih tarikh, pilih slot siang atau malam, isi sikit info. Lepas tu kita sambung borak kat WhatsApp.',
          note: 'Satu hari ada dua slot: siang dan malam. Tarikh confirm lepas kami reply.',
        },
      },
      {
        key: 'inquiry',
        type: 'inquiry',
        visible: true,
        headline: 'Prefer email?\n*Send a detailed inquiry.*',
        body: 'Tell us a little about your day, your plans, and the moments you want to remember most.',
        successHeadline: 'Thank you — *we have your message.*',
        successBody: 'We read every inquiry personally and will reply to the email you gave us.',
        privacyNote: 'We only use these details to reply to your inquiry and plan your coverage. We never sell or share them.',
        ms: {
          headline: 'Lebih selesa emel?\n*Hantar pertanyaan.*',
          body: 'Cerita sikit pasal majlis korang, plan korang, dan momen yang korang paling nak simpan.',
          successHeadline: 'Terima kasih! *Mesej korang dah sampai.*',
          successBody: 'Kami baca semua pertanyaan sendiri, dan akan reply ke emel yang korang bagi.',
          privacyNote: 'Info ni kami guna untuk reply dan rancang liputan je. Kami tak jual atau kongsi dengan sesiapa.',
        },
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    seoTitle: 'Privacy policy — everafter.memoir',
    seoDescription: 'How everafter.memoir handles the personal details you share with us.',
    ms: { title: 'Privasi', seoTitle: 'Dasar privasi — everafter.memoir', seoDescription: 'Macam mana everafter.memoir jaga info peribadi yang korang kongsi dengan kami.' },
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
          'Your inquiry is stored securely and is only visible to the everafter.memoir team. We do not sell, rent or share your details with anyone for marketing.',
          '## How long we keep it',
          'We keep inquiries for as long as we need them to work with you, and delete closed inquiries we no longer need.',
          '## Your choices',
          'You can ask us at any time to see, correct or delete the details you sent. Reply to any message from us or send a new inquiry with your request.',
          '## Cookies',
          'This website does not use advertising or tracking cookies.',
        ].join('\n\n'),
        ms: {
          headline: 'Dasar privasi',
          body: [
            '## Apa yang kami kumpul',
            'Apabila anda menempah tarikh atau menghantar pertanyaan, kami menerima maklumat yang anda isi: nama anda, nama pasangan, emel, nombor WhatsApp, tarikh majlis, lokasi, jenis majlis, servis yang diminati, bajet (pilihan) dan sebarang nota.',
            '## Mengapa kami mengumpulnya',
            'Kami menggunakan maklumat ini hanya untuk membalas anda, menyediakan sebut harga dan merancang liputan majlis anda. Apabila anda menempah melalui WhatsApp, perbualan diteruskan di WhatsApp di bawah terma privasinya sendiri.',
            '## Siapa yang boleh melihatnya',
            'Pertanyaan anda disimpan dengan selamat dan hanya boleh dilihat oleh pasukan everafter.memoir. Kami tidak menjual, menyewa atau berkongsi maklumat anda dengan sesiapa untuk tujuan pemasaran.',
            '## Berapa lama kami menyimpannya',
            'Kami menyimpan pertanyaan selama yang diperlukan untuk bekerja dengan anda, dan memadam pertanyaan yang telah selesai apabila tidak diperlukan lagi.',
            '## Pilihan anda',
            'Anda boleh meminta pada bila-bila masa untuk melihat, membetulkan atau memadam maklumat yang anda hantar. Balas mana-mana mesej daripada kami atau hantar pertanyaan baharu dengan permintaan anda.',
            '## Kuki',
            'Website ini tidak menggunakan kuki pengiklanan atau penjejakan.',
          ].join('\n\n'),
        },
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Example stories — real photos and films, example words (marked as samples)
// ---------------------------------------------------------------------------
export const DEFAULT_STORIES: (StoryContent & { id: string })[] = [
  {
    id: uuid(102),
    title: 'The Quiet Between Us',
    slug: 'the-quiet-between-us',
    excerpt: 'White flowers, soft light and a kiss on the hand.',
    description:
      'A soft morning and a small room full of white flowers. Between the vows and the first photos there was a moment of quiet — a hand on her head, a kiss on his — and that is the part we wanted to keep.',
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
      { media: m('holding-hands-film.mp4'), caption: 'Hold on a little longer.', layout: 'offset' },
      { media: null, caption: 'The little things', layout: 'chapter' },
      { media: m('rings-detail.jpg'), caption: '', layout: 'half' },
      { media: m('pelamin-laugh.jpg'), caption: 'And then, laughter.', layout: 'half' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
    ms: {
      title: 'Sunyi Antara Kita',
      excerpt: 'Bunga putih, cahaya lembut, dan cium tangan.',
      description:
        'Pagi yang tenang dalam bilik kecil penuh bunga putih. Antara lafaz akad dan sesi bergambar, ada satu momen senyap. Tangan suami di kepala isteri, ciuman di tangan suami. Itu yang kami nak simpan.',
      'tags.0': 'Akad nikah',
      'tags.1': 'Pelamin',
      'gallery.0.caption': 'Akad',
      'gallery.1.caption': 'Salam.',
      'gallery.3.caption': 'Pegang lama sikit.',
      'gallery.4.caption': 'Detail kecil',
      'gallery.6.caption': 'Lepas tu, gelak.',
    },
  },
  {
    id: uuid(101),
    title: 'A Day to Remember',
    slug: 'a-day-to-remember',
    excerpt: 'Bright walls, white baju and a house full of the people who matter.',
    description:
      'Getting ready at home, bridesmaids in powder blue and a family that would not stop laughing. A day that was loud in the best way.',
    cover: m('family-portrait.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Akad nikah', 'At home'],
    featured: true,
    gallery: [
      { media: null, caption: 'Before', layout: 'chapter' },
      { media: m('getting-ready.mp4'), caption: 'Getting ready.', layout: 'half' },
      { media: m('bride-smile.jpg'), caption: 'Ready.', layout: 'half' },
      { media: m('bridesmaids.mp4'), caption: 'The bridesmaids.', layout: 'offset' },
      { media: null, caption: 'Everyone', layout: 'chapter' },
      { media: m('family-portrait.jpg'), caption: 'The whole family, finally in one photo.', layout: 'offset' },
      { media: m('couple-standing.jpg'), caption: '', layout: 'half' },
      { media: m('just-married.mp4'), caption: 'Just married.', layout: 'half' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
    ms: {
      title: 'Hari Untuk Dikenang',
      excerpt: 'Dinding kuning ceria, baju putih, dan rumah penuh orang tersayang.',
      description: 'Bersiap kat rumah, pengapit berbaju biru lembut, dan family yang tak berhenti gelak. Riuh, tapi riuh yang best.',
      'tags.0': 'Akad nikah',
      'tags.1': 'Di rumah',
      'gallery.0.caption': 'Sebelum',
      'gallery.1.caption': 'Bersiap.',
      'gallery.2.caption': 'Dah siap.',
      'gallery.3.caption': 'Geng pengapit.',
      'gallery.4.caption': 'Semua orang',
      'gallery.5.caption': 'Satu family, akhirnya dalam satu frame.',
      'gallery.7.caption': 'Sah!',
    },
  },
  {
    id: uuid(103),
    title: 'In Red and Bloom',
    slug: 'in-red-and-bloom',
    excerpt: 'Deep red drapes, crystal light and a cake cut together.',
    description:
      'A reception dressed in deep red and blush flowers. We started with the empty hall, stayed for the pelamin and left after the last slice of cake.',
    cover: m('pelamin-decor.jpg'),
    weddingDate: '',
    venue: '',
    location: '',
    tags: ['Reception', 'Pelamin'],
    featured: true,
    gallery: [
      { media: null, caption: 'The hall', layout: 'chapter' },
      { media: m('pelamin-decor.jpg'), caption: '', layout: 'full' },
      { media: m('hall-details.mp4'), caption: 'Before the doors opened.', layout: 'half' },
      { media: m('hall-decor.mp4'), caption: '', layout: 'half' },
      { media: null, caption: 'The couple', layout: 'chapter' },
      { media: m('couple-pelamin.mp4'), caption: 'On the pelamin.', layout: 'half' },
      { media: m('cake-cutting.mp4'), caption: 'One slice, together.', layout: 'half' },
    ],
    seoTitle: '',
    seoDescription: '',
    isSample: true,
    ms: {
      title: 'Merah dan Mekar',
      excerpt: 'Langsir merah pekat, chandelier kristal, dan kek yang dipotong sama-sama.',
      description: 'Majlis sanding berhias merah pekat dan bunga pink. Kami mula dari dewan yang masih kosong, lepak lama kat pelamin, dan balik lepas potongan kek terakhir.',
      'tags.0': 'Sanding',
      'tags.1': 'Pelamin',
      'gallery.0.caption': 'Dewan',
      'gallery.2.caption': 'Sebelum pintu dibuka.',
      'gallery.4.caption': 'Pengantin',
      'gallery.5.caption': 'Atas pelamin.',
      'gallery.6.caption': 'Satu potong, sama-sama.',
    },
  },
]

// ---------------------------------------------------------------------------
// Services — descriptions from the brief; no prices or deliverables invented
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES: (ServiceContent & { id: string })[] = [
  {
    id: uuid(201),
    kind: 'service',
    name: 'Wedding Content Creator (WCC)',
    summary: 'Candid moments, behind-the-scenes details and the atmosphere of your celebration — as reels, photos and stories ready to share.',
    description:
      'We capture your day as it happens — the getting ready, the in-between, the people around you — as short-form content you can share on the day and keep for years.',
    deliverables: [],
    price: '',
    showPrice: false,
    priceNote: '',
    featured: false,
    media: m('getting-ready-poster.jpg'),
    ms: {
      summary: 'Momen spontan, behind the scenes dan suasana majlis, siap jadi reels, gambar dan story yang terus boleh share.',
      description:
        'Kami rakam hari korang macam mana ia berlaku. Masa bersiap, momen di celah-celah, orang-orang sekeliling. Ada yang korang boleh share hari tu juga, ada yang korang simpan bertahun-tahun.',
    },
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
    media: m('just-married-poster.jpg'),
    ms: {
      name: 'Video Highlight',
      summary: 'Video pendek yang himpunkan emosi, keriuhan dan detail yang korang tak nak lupa.',
      description: 'Video kecil dari momen-momen paling bermakna, supaya korang boleh rasa hari tu sekali lagi.',
    },
  },
  {
    id: uuid(203),
    kind: 'service',
    name: 'Personalised Coverage',
    summary: "Tailored content coverage based on each couple's priorities and wedding plans.",
    description: 'Tell us what matters to you and we will shape the coverage around it — from intimate ceremonies to full celebrations.',
    deliverables: [],
    price: '',
    showPrice: false,
    priceNote: '',
    featured: false,
    media: m('hall-decor-poster.jpg'),
    ms: {
      name: 'Liputan Ikut Citarasa',
      summary: 'Liputan yang disusun ikut apa yang paling penting untuk korang berdua.',
      description: 'Bagitahu apa yang korang nak, kami susun liputan ikut tu. Majlis kecil pun boleh, majlis besar pun boleh.',
    },
  },
]

export const DEFAULT_SOCIAL: (SocialItemContent & { id: string })[] = [
  { id: uuid(301), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-1.jpg'), caption: 'On TikTok', ms: { caption: 'Kat TikTok' } },
  { id: uuid(302), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-2.jpg'), caption: 'On Instagram', ms: { caption: 'Kat Instagram' } },
  { id: uuid(303), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-3.jpg'), caption: 'On TikTok', ms: { caption: 'Kat TikTok' } },
  { id: uuid(304), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-4.jpg'), caption: 'On Instagram', ms: { caption: 'Kat Instagram' } },
  { id: uuid(305), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-5.jpg'), caption: 'On TikTok', ms: { caption: 'Kat TikTok' } },
  { id: uuid(306), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-6.jpg'), caption: 'On Instagram', ms: { caption: 'Kat Instagram' } },
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
