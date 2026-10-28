// Starter content in English with a Malay version (`ms`). Used to seed the
// database and as a fallback when the database is not connected yet.
// Everything here is editable in /admin. Photos and videos in /public/brand
// are Ever After Memoir's own work. The three stories use real photos with
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
  photo(15, 'og.jpg', 1200, 630, 'Ever After Memoir'),
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

export const DEFAULT_BOOKING_MESSAGE_MS = [
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

const CELEBRATIONS = ['Solemnisation (akad nikah)', 'Reception (bersanding)', 'Solemnisation and reception', 'Engagement (tunang)', 'Something else']
const CELEBRATIONS_MS = ['Akad nikah', 'Majlis persandingan', 'Akad nikah dan persandingan', 'Majlis pertunangan', 'Lain-lain']

export const DEFAULT_SETTINGS: SettingsContent = {
  siteTitle: 'Ever After Memoir',
  tagline: 'Your day, as it felt.',
  metaDescription:
    'Ever After Memoir is a wedding content creator team capturing honest moments, fleeting details and the beautiful in-between — in reels, photos and little films.',
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
  celebrationTypes: CELEBRATIONS,
  budgetRanges: [],
  inquiryRetentionMonths: 0,
  bookingEnabled: true,
  bookingLeadDays: 7,
  bookingMonthsAhead: 18,
  bookingMessage: DEFAULT_BOOKING_MESSAGE,
  ms: {
    tagline: 'Hari anda, seperti yang dirasa.',
    metaDescription:
      'Ever After Memoir ialah pasukan wedding content creator yang merakam detik jujur, butiran kecil dan segala yang indah di antaranya — dalam reels, gambar dan video pendek.',
    whatsappMessage: 'Hai Ever After Memoir, saya nak tanya tentang majlis perkahwinan saya.',
    footerNote: 'Kandungan perkahwinan dan video pendek, untuk dikenang.',
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
    seoTitle: 'Ever After Memoir — Wedding content creator',
    seoDescription:
      'Wedding content creation, reels and little films by Ever After Memoir. Honest moments, fleeting details and the beautiful in-between.',
    ms: {
      title: 'Utama',
      seoTitle: 'Ever After Memoir — Wedding content creator',
      seoDescription: 'Wedding content creator, reels dan video pendek oleh Ever After Memoir. Detik jujur, butiran kecil dan segala yang indah di antaranya.',
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
          headline: 'Hari anda,\n*seperti yang dirasa.*',
          body: 'Detik yang jujur, butiran yang sekejap, dan segala yang indah di antaranya — dirakam dengan teliti, supaya anda dapat merasainya semula lama selepas hari itu berlalu.',
          'primary.label': 'Semak tarikh anda',
          'secondary.label': 'Tonton reels kami',
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
          eyebrow: 'Apa yang kami simpan',
          headline: 'Bukan sekadar rupanya.\n*Tetapi rasanya.*',
          body: 'Tawa yang gugup. Tangan yang menggeletar. Pandangan kecil yang tiada siapa perasan. Kami rakam detik-detik di antara detik — yang menjadikan kisah anda milik anda sepenuhnya.',
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
          headline: 'Video kecil.\n*Rasa yang kekal.*',
          body: 'Hari anda terbentang dalam seribu detik kecil. Kami himpunkan semuanya supaya anda dapat merasainya sekali lagi.',
          'reels.0.caption': 'Sah!',
          'reels.1.caption': 'Bersiap',
          'reels.2.caption': 'Para pengapit',
          'reels.3.caption': 'Di pelamin',
          'reels.4.caption': 'Potong kek',
          'reels.5.caption': 'Genggam lebih lama',
          'reels.6.caption': 'Sebelum tetamu tiba',
          'reels.7.caption': 'Venue & vendor',
          'reels.8.caption': 'Butiran kecil',
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
          headline: 'Hari yang *dikenang.*',
          body: 'Beberapa kisah perkahwinan, diceritakan seperti yang dirasa.',
          'link.label': 'Lihat semua kisah',
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
        ms: { quote: 'Genggam\n*lebih lama.*' },
      },
      {
        key: 'services',
        type: 'services_preview',
        visible: true,
        eyebrow: 'What we offer',
        headline: 'Ways we can *tell your day.*',
        link: { label: 'View services', href: '/services' },
        ms: { eyebrow: 'Apa yang kami tawarkan', headline: 'Cara kami *menceritakan hari anda.*', 'link.label': 'Lihat servis' },
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
          eyebrow: 'Kata-kata mereka',
          headline: 'Daripada pasangan kami',
          manifesto:
            'Kami percaya pada tawa yang tidak dibuat-buat, pada sunyi sebelum lafaz akad, pada tangan yang menggenggam sedikit lebih lama. Bahagian terindah hari anda ialah bahagian yang anda terlalu sibuk menjalaninya untuk perasan.',
        },
      },
      {
        key: 'social',
        type: 'social',
        visible: true,
        eyebrow: 'Follow along',
        headline: '@everafter.memoir',
        body: 'Behind the scenes, little reels and the moments in between — on Instagram and TikTok.',
        ms: { eyebrow: 'Ikuti kami', body: 'Di sebalik tabir, reels kecil dan detik-detik di antaranya — di Instagram dan TikTok.' },
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
        body: 'See which dates are still open, then say hello on WhatsApp.',
        link: checkDate,
        ms: {
          headline: 'Mari simpan kenangan\n*anda dekat di hati.*',
          body: 'Lihat tarikh yang masih kosong, kemudian sapa kami di WhatsApp.',
          'link.label': 'Semak tarikh anda',
        },
      },
    ],
  },
  stories: {
    title: 'Stories',
    seoTitle: 'Stories — Ever After Memoir',
    seoDescription: 'Wedding stories by Ever After Memoir — candid moments, quiet details and little films.',
    ms: { title: 'Kisah', seoTitle: 'Kisah — Ever After Memoir', seoDescription: 'Kisah perkahwinan oleh Ever After Memoir — detik spontan, butiran kecil dan video pendek.' },
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
          headline: 'Setiap perkahwinan\n*terasa berbeza.*',
          body: 'Ada yang meriah dan bergemerlapan, ada yang tenang dan intim. Inilah sebahagiannya, diceritakan seperti yang dirasa.',
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
        ms: { headline: 'Kisah anda\n*mungkin seterusnya.*', body: 'Lihat tarikh yang masih kosong.', 'link.label': 'Semak tarikh anda' },
      },
    ],
  },
  services: {
    title: 'Services',
    seoTitle: 'Services — Ever After Memoir',
    seoDescription: 'Wedding content creator (WCC) coverage, highlight films and personalised coverage by Ever After Memoir.',
    ms: { title: 'Servis', seoTitle: 'Servis — Ever After Memoir', seoDescription: 'Liputan wedding content creator (WCC), video highlight dan liputan mengikut citarasa oleh Ever After Memoir.' },
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
          headline: 'Dibentuk mengikut\n*hari anda.*',
          body: 'Setiap pasangan mengingati perkara yang berbeza. Pilih apa yang paling penting bagi anda, dan kami akan bentuk liputan di sekelilingnya.',
        },
      },
      {
        key: 'list',
        type: 'services_list',
        visible: true,
        addonsHeadline: 'Little extras',
        footnote: 'Every wedding is different, so every quote is too. Pick your date and we will reply with options for your day.',
        ms: {
          addonsHeadline: 'Tambahan kecil',
          footnote: 'Setiap majlis berbeza, jadi setiap sebut harga pun berbeza. Pilih tarikh anda dan kami akan balas dengan pilihan untuk hari anda.',
        },
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: 'Not sure what\n*you need?*',
        body: "Tell us about your day and we'll help you choose.",
        link: checkDate,
        ms: { headline: 'Belum pasti\n*apa yang diperlukan?*', body: 'Ceritakan tentang majlis anda dan kami akan bantu anda memilih.', 'link.label': 'Semak tarikh anda' },
      },
    ],
  },
  about: {
    title: 'About',
    seoTitle: 'About — Ever After Memoir',
    seoDescription: 'Ever After Memoir is a team of two wedding content creators, made for the moments that deserve to be remembered beyond the photographs.',
    ms: {
      title: 'Tentang Kami',
      seoTitle: 'Tentang Kami — Ever After Memoir',
      seoDescription: 'Ever After Memoir ialah pasukan dua orang wedding content creator, untuk detik-detik yang layak dikenang melangkaui gambar.',
    },
    sections: [
      {
        key: 'intro',
        type: 'page_intro',
        visible: true,
        layout: 'side',
        eyebrow: 'About',
        headline: 'Behind every memoir,\n*a thousand little feelings.*',
        body: 'Ever After Memoir was created for the moments that deserve to be remembered beyond the photographs — the laughter, the happy tears, the quiet glances, and all the beautiful in-between.',
        media: m('bride-window.jpg'),
        ms: {
          eyebrow: 'Tentang kami',
          headline: 'Di sebalik setiap memoir,\n*seribu rasa kecil.*',
          body: 'Ever After Memoir lahir untuk detik-detik yang layak dikenang melangkaui gambar — gelak tawa, air mata gembira, pandangan yang senyap, dan segala yang indah di antaranya.',
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
          eyebrow: 'Pasukan kami',
          headline: 'Dua pencipta,\n*satu cara melihat.*',
          body: 'Kami pasukan dua orang — wedding content creator, dan juga jurugambar. Seorang biasanya berada di tempat gelak tawa; seorang lagi menanti detik sejurus selepasnya.',
          'members.0.role': 'Wedding content creator',
          'members.1.role': 'Wedding content creator & jurugambar',
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
          eyebrow: 'Cara kami bekerja',
          headline: 'Cukup dekat untuk merasainya.\n*Cukup senyap untuk tidak terlepas apa-apa.*',
          body: 'Kami kekal dekat dengan detik yang penting, dan menjauh daripada detik yang sepatutnya berlaku dengan sendiri.\n\nHasilnya ialah kandungan yang terasa seperti berada di sana semula — saat bersiap, lafaz akad, orang yang anda sayang, dan segalanya di antaranya.',
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
          eyebrow: 'Di antaranya',
          headline: 'Detik yang\n*tidak dirancang.*',
          body: 'Kucupan di tangan. Tawa di pelamin. Cincin, akhirnya di tempatnya.',
          'items.0.caption': 'Salam',
          'items.3.caption': 'Selamanya, di satu jari',
          'link.label': 'Lihat kisah',
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
        ms: { text: 'Hari anda, seperti yang dirasa — bukan sekadar rupanya.' },
      },
      {
        key: 'cta',
        type: 'cta',
        visible: true,
        headline: "Let's keep your\n*memories close.*",
        body: 'We would love to hear about your day.',
        link: checkDate,
        ms: { headline: 'Mari simpan kenangan\n*anda dekat di hati.*', body: 'Kami teruja untuk mendengar tentang hari anda.', 'link.label': 'Semak tarikh anda' },
      },
    ],
  },
  contact: {
    title: 'Contact',
    seoTitle: 'Book your date — Ever After Memoir',
    seoDescription: 'Check which wedding dates are still available with Ever After Memoir, then book on WhatsApp.',
    ms: { title: 'Hubungi', seoTitle: 'Tempah tarikh anda — Ever After Memoir', seoDescription: 'Semak tarikh perkahwinan yang masih kosong dengan Ever After Memoir, kemudian tempah melalui WhatsApp.' },
    sections: [
      {
        key: 'book',
        type: 'booking',
        visible: true,
        eyebrow: 'Book your date',
        headline: 'Is your date\n*still free?*',
        body: 'Pick your wedding date, tell us a little about your day, and we’ll continue on WhatsApp.',
        note: 'Dates marked “Few slots left” already have another booking. Your date is confirmed once we reply.',
        ms: {
          eyebrow: 'Tempah tarikh anda',
          headline: 'Tarikh anda\n*masih kosong?*',
          body: 'Pilih tarikh majlis, ceritakan sedikit tentang hari anda, dan kita sambung di WhatsApp.',
          note: 'Tarikh bertanda “Slot terhad” sudah ada tempahan lain. Tarikh anda disahkan selepas kami membalas.',
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
          headline: 'Lebih suka emel?\n*Hantar pertanyaan terperinci.*',
          body: 'Ceritakan sedikit tentang hari anda, rancangan anda, dan detik yang paling ingin anda kenang.',
          successHeadline: 'Terima kasih — *mesej anda sudah kami terima.*',
          successBody: 'Kami membaca setiap pertanyaan sendiri dan akan membalas ke emel yang anda berikan.',
          privacyNote: 'Kami hanya menggunakan maklumat ini untuk membalas pertanyaan dan merancang liputan anda. Kami tidak pernah menjual atau berkongsi maklumat anda.',
        },
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    seoTitle: 'Privacy policy — Ever After Memoir',
    seoDescription: 'How Ever After Memoir handles the personal details you share with us.',
    ms: { title: 'Privasi', seoTitle: 'Dasar privasi — Ever After Memoir', seoDescription: 'Cara Ever After Memoir mengendalikan maklumat peribadi yang anda kongsi dengan kami.' },
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
        ms: {
          headline: 'Dasar privasi',
          body: [
            '## Apa yang kami kumpul',
            'Apabila anda menempah tarikh atau menghantar pertanyaan, kami menerima maklumat yang anda isi: nama anda, nama pasangan, emel, nombor WhatsApp, tarikh majlis, lokasi, jenis majlis, servis yang diminati, bajet (pilihan) dan sebarang nota.',
            '## Mengapa kami mengumpulnya',
            'Kami menggunakan maklumat ini hanya untuk membalas anda, menyediakan sebut harga dan merancang liputan majlis anda. Apabila anda menempah melalui WhatsApp, perbualan diteruskan di WhatsApp di bawah terma privasinya sendiri.',
            '## Siapa yang boleh melihatnya',
            'Pertanyaan anda disimpan dengan selamat dan hanya boleh dilihat oleh pasukan Ever After Memoir. Kami tidak menjual, menyewa atau berkongsi maklumat anda dengan sesiapa untuk tujuan pemasaran.',
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
      excerpt: 'Bunga putih, cahaya lembut dan kucupan di tangan.',
      description:
        'Pagi yang tenang dan bilik kecil yang penuh bunga putih. Di antara lafaz akad dan sesi bergambar pertama ada satu detik sunyi — tangan di kepalanya, kucupan di tangannya — dan itulah yang kami mahu simpan.',
      'tags.0': 'Akad nikah',
      'tags.1': 'Pelamin',
      'gallery.0.caption': 'Akad',
      'gallery.1.caption': 'Salam.',
      'gallery.3.caption': 'Genggam lebih lama.',
      'gallery.4.caption': 'Butiran kecil',
      'gallery.6.caption': 'Kemudian, gelak tawa.',
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
      excerpt: 'Dinding ceria, baju putih dan rumah yang penuh dengan orang tersayang.',
      description: 'Bersiap di rumah, pengapit berbaju biru lembut dan keluarga yang tak henti ketawa. Hari yang riuh, dengan cara yang paling indah.',
      'tags.0': 'Akad nikah',
      'tags.1': 'Di rumah',
      'gallery.0.caption': 'Sebelum',
      'gallery.1.caption': 'Bersiap.',
      'gallery.2.caption': 'Sedia.',
      'gallery.3.caption': 'Para pengapit.',
      'gallery.4.caption': 'Semua orang',
      'gallery.5.caption': 'Satu keluarga, akhirnya dalam satu gambar.',
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
      excerpt: 'Langsir merah pekat, cahaya kristal dan kek yang dipotong bersama.',
      description: 'Majlis persandingan berhias merah pekat dan bunga merah jambu. Kami bermula dengan dewan yang masih kosong, kekal di pelamin, dan pulang selepas potongan kek terakhir.',
      'tags.0': 'Persandingan',
      'tags.1': 'Pelamin',
      'gallery.0.caption': 'Dewan',
      'gallery.2.caption': 'Sebelum pintu dibuka.',
      'gallery.4.caption': 'Pasangan',
      'gallery.5.caption': 'Di pelamin.',
      'gallery.6.caption': 'Satu potong, bersama.',
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
      summary: 'Detik spontan, di sebalik tabir dan suasana majlis anda — sebagai reels, gambar dan story yang sedia dikongsi.',
      description:
        'Kami rakam hari anda seadanya — saat bersiap, detik di antaranya, orang di sekeliling anda — sebagai kandungan pendek yang boleh dikongsi pada hari itu juga dan disimpan bertahun-tahun.',
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
      name: 'Video Highlight Perkahwinan',
      summary: 'Penceritaan ringkas yang menghimpunkan emosi, tenaga dan butiran yang tidak dilupakan pada hari itu.',
      description: 'Video kecil daripada detik-detik paling bermakna, supaya anda dapat merasai hari anda sekali lagi.',
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
      name: 'Liputan Mengikut Citarasa',
      summary: 'Liputan kandungan yang disesuaikan dengan keutamaan dan rancangan majlis setiap pasangan.',
      description: 'Beritahu kami apa yang penting bagi anda dan kami akan bentuk liputan di sekelilingnya — dari majlis kecil hingga sambutan besar.',
    },
  },
]

export const DEFAULT_SOCIAL: (SocialItemContent & { id: string })[] = [
  { id: uuid(301), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-1.jpg'), caption: 'On TikTok', ms: { caption: 'Di TikTok' } },
  { id: uuid(302), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-2.jpg'), caption: 'On Instagram', ms: { caption: 'Di Instagram' } },
  { id: uuid(303), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-3.jpg'), caption: 'On TikTok', ms: { caption: 'Di TikTok' } },
  { id: uuid(304), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-4.jpg'), caption: 'On Instagram', ms: { caption: 'Di Instagram' } },
  { id: uuid(305), platform: 'tiktok', url: 'https://www.tiktok.com/@everafter.memoir/', preview: m('social-5.jpg'), caption: 'On TikTok', ms: { caption: 'Di TikTok' } },
  { id: uuid(306), platform: 'instagram', url: 'https://www.instagram.com/everafter.memoir/', preview: m('social-6.jpg'), caption: 'On Instagram', ms: { caption: 'Di Instagram' } },
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
