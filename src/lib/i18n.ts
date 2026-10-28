// Two languages: English at /, Bahasa Melayu at /ms.
// UI words live here. Owner-written content keeps its Malay version in an
// `ms` map on each item ({ "headline": "…", "primary.label": "…" }), filled in
// from the admin with the "Bahasa Melayu" switch.

export type Lang = 'en' | 'ms'
export const LANGS: Lang[] = ['en', 'ms']

/** Language of a public path: /ms, /ms/…, /preview/ms/… are Malay. */
export function langFromPath(path: string): Lang {
  return /^(\/preview)?\/ms(\/|$)/.test(path) ? 'ms' : 'en'
}

/** Remove the /ms part: /ms/stories → /stories, /ms → / */
export function stripLang(path: string) {
  return path.replace(/^\/ms(?=\/|$)/, '') || '/'
}

/** Add the language to a site path: ('ms', '/stories#x') → /ms/stories#x */
export function withLang(lang: Lang, href: string) {
  if (lang === 'en' || !href.startsWith('/') || href.startsWith('//')) return href
  if (/^\/(admin|api|preview|brand|_next)(\/|$)/.test(href)) return href
  if (/^\/ms(\/|$|#|\?)/.test(href)) return href
  if (href === '/' ) return '/ms'
  if (/^\/[#?]/.test(href)) return `/ms${href.slice(1)}`
  return `/ms${href}`
}

export const LOCALE: Record<Lang, string> = { en: 'en-GB', ms: 'ms-MY' }
export const HREFLANG: Record<Lang, string> = { en: 'en', ms: 'ms' }

// ---------------------------------------------------------------------------
// Owner content: apply the Malay overrides
// ---------------------------------------------------------------------------
type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

function setString(target: Obj, path: string, value: string) {
  const parts = path.split('.')
  let cur: unknown = target
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    if (Array.isArray(cur)) cur = cur[Number(k)]
    else if (isObj(cur)) cur = cur[k]
    else return
  }
  const last = parts[parts.length - 1]
  if (Array.isArray(cur)) {
    const i = Number(last)
    if (Number.isInteger(i) && typeof cur[i] === 'string') cur[i] = value
  } else if (isObj(cur) && typeof cur[last] === 'string') cur[last] = value
}

/**
 * Content in the visitor's language. Malay text that is empty falls back to
 * the English, so nothing is ever blank. With `strip`, the translation maps
 * are dropped so a page only carries the language it shows.
 */
export function localize<T>(value: T, lang: Lang, strip = false): T {
  if (lang === 'en' && !strip) return value
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk)
    if (!isObj(v)) return v
    const out: Obj = {}
    for (const [k, child] of Object.entries(v)) {
      if (k === 'ms') {
        if (!strip) out[k] = child
      } else out[k] = walk(child)
    }
    const ms = v.ms
    if (lang === 'ms' && isObj(ms)) {
      for (const [path, text] of Object.entries(ms)) {
        if (typeof text === 'string' && text.trim()) setString(out, path, text)
      }
    }
    return out
  }
  return walk(value) as T
}

// ---------------------------------------------------------------------------
// UI words
// ---------------------------------------------------------------------------
const en = {
  'nav.home': 'Home',
  'nav.stories': 'Stories',
  'nav.services': 'Services',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.cta': 'Check your date',
  'nav.main': 'Main',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.menu': 'Menu',
  'nav.homeLabel': '{site} — home',
  'lang.switch': 'Bahasa Melayu',
  'lang.short': 'BM',
  'lang.label': 'Baca dalam Bahasa Melayu',
  'skip': 'Skip to content',
  'footer.explore': 'Explore',
  'footer.hello': 'Say hello',
  'footer.inquiry': 'Send an inquiry',
  'footer.privacy': 'Privacy policy',
  'footer.label': 'Footer',
  'wa.chat': 'Chat with us on WhatsApp',
  'bar.cta': 'Check your date',
  'sample': 'Sample',
  'sampleStory': 'Sample story',
  'hero.photos': 'Opening photos and films',
  'hero.prev': 'Previous',
  'hero.next': 'Next',
  'hero.slide': 'Slide {n} of {total}',
  'stories.swipe': 'Swipe to see more',
  'stories.next': 'Next story',
  'stories.all': 'All stories',
  'stories.filter': 'Filter stories',
  'stories.empty': 'New stories are on their way.',
  'stories.openImage': 'Open image',
  'stories.film': 'film',
  'reels.label': 'Reels',
  'reels.watch': 'Watch',
  'reels.tapSound': 'Tap a reel to watch with sound',
  'reels.prev': 'Previous reel',
  'reels.next': 'Next reel',
  'reels.mute': 'Mute',
  'reels.unmute': 'Unmute',
  'reels.pause': 'Pause',
  'reels.play': 'Play',
  'reels.of': '{n} of {total}',
  'video.play': 'Play {title}',
  'video.loading': 'Loading video',
  'video.failed': 'This film could not be loaded. Please try again later.',
  'video.seek': 'Seek',
  'video.fullscreen': 'Full screen',
  'close': 'Close',
  'gallery.label': 'Image gallery',
  'gallery.prev': 'Previous image',
  'gallery.next': 'Next image',
  'services.most': 'Most requested',
  'services.receive': 'What you receive',
  'services.contactPrice': 'Contact for pricing',
  'services.ask': 'Ask about this',
  'social.view': 'View post',
  'social.opens': 'opens {where}',
  'team.member': 'Team member',
  // Booking
  'book.choose': 'Choose your wedding date',
  'book.prevMonth': 'Previous month',
  'book.nextMonth': 'Next month',
  'book.open': '{n} dates open',
  'book.open1': '1 date open',
  'book.full': 'Fully booked',
  'book.key': 'Calendar key',
  'book.available': 'Available',
  'book.limited': 'Few slots left',
  'book.booked': 'Booked',
  'book.yours': 'Your date',
  'book.state.available': 'available',
  'book.state.limited': 'few slots left',
  'book.state.booked': 'booked',
  'book.state.unavailable': 'not available',
  'book.state.outside': 'not open for booking',
  'book.paused': 'Online booking is paused right now.',
  'book.pausedBody': 'Please send us an inquiry below and we’ll reply with available dates.',
  'book.opening': 'Opening WhatsApp so you can send us your booking…',
  'book.openWa': 'Open WhatsApp',
  'book.thanksEmail': 'Thank you — we have your booking request and will reply to your email soon.',
  'book.name': 'Your name',
  'book.partner': 'Partner’s name',
  'book.type': 'Type of celebration',
  'book.service': 'Service',
  'book.location': 'Location or venue',
  'book.locationHint': 'e.g. Kuantan, or the name of the hall',
  'book.email': 'Email',
  'book.notes': 'Anything we should know?',
  'book.consent': 'I agree to Ever After Memoir keeping these details to reply.',
  'book.send': 'Send booking request',
  'book.continue': 'Continue on WhatsApp',
  'book.waHint': 'WhatsApp opens with your details filled in. Just press send.',
  'book.preview': 'Booking is switched off in preview so no test bookings are created.',
  'book.failed': 'Your booking was not sent. Please try again.',
  'book.offline': 'Your booking was not sent. Check your connection and try again.',
  'book.email.prefer': 'Prefer email?',
  'book.change': 'Change date',
  // Forms
  'form.optional': '(optional)',
  'form.choose': 'Choose one',
  'form.notSure': 'Not sure yet',
  'form.preferNot': 'Prefer not to say',
  'form.sending': 'Sending…',
  'form.privacyLink': 'Read the privacy policy',
  'form.privacy': 'Privacy policy',
  'form.honeypot': 'Leave this empty',
  'inq.name': 'Your name',
  'inq.partner': 'Partner’s name',
  'inq.email': 'Email',
  'inq.whatsapp': 'WhatsApp number',
  'inq.whatsappHint': 'With country code, e.g. +60 12 345 6789',
  'inq.date': 'Wedding date',
  'inq.location': 'Location or venue',
  'inq.type': 'Type of celebration',
  'inq.service': 'Service you’re interested in',
  'inq.budget': 'Estimated budget',
  'inq.notes': 'Tell us about your day',
  'inq.consent': 'I agree to Ever After Memoir keeping these details to reply to my inquiry.',
  'inq.send': 'Send inquiry',
  'inq.another': 'Send another inquiry',
  'inq.emailLabel': 'Email',
  'inq.waLabel': 'WhatsApp',
  'inq.waLink': 'Message us on WhatsApp',
  'inq.preview': 'The form is switched off in preview so no test inquiries are created.',
  'inq.failed': 'Your inquiry was not sent. Please check your connection and try again.',
  'inq.open': 'Prefer email? Send a detailed inquiry',
  // Field errors (keys come from the shared form schemas)
  'err.name': 'Please tell us your name',
  'err.nameLong': 'Keep your name under 120 characters',
  'err.long': 'Keep this under 120 characters',
  'err.email': 'Please enter a valid email address',
  'err.emailNeeded': 'Please add your email so we can reply',
  'err.whatsapp': 'Use digits only, including the country code — e.g. +60 12 345 6789',
  'err.date': 'Please choose your wedding date',
  'err.dateFuture': 'The date should be today or later',
  'err.calendarDate': 'Choose a date on the calendar',
  'err.location': 'Where is the wedding? A town or venue is fine',
  'err.type': 'Please choose the type of celebration',
  'err.service': 'Please choose a service — “Not sure yet” is fine',
  'err.notes': 'Please keep your notes shorter',
  'err.consent': 'Please agree so we can keep your details to reply',
  // Server replies
  'api.origin': 'This form can only be sent from the website.',
  'api.unreadable': 'Your message could not be read. Please try again.',
  'api.tooLong': 'Your message is too long.',
  'api.check': 'Please check the highlighted fields.',
  'api.notConnected': 'This form is not connected yet. Please message us on Instagram or TikTok for now.',
  'api.retry': 'Your message was not sent. Please try again in a few minutes.',
  'api.limit': 'You have sent several requests already. Please wait an hour, or message us on Instagram.',
  'api.paused': 'Online booking is paused right now. Please send an inquiry instead.',
  'api.outside': 'That date can’t be booked online. Please choose another date.',
  'api.taken': 'Sorry — that date was just booked. Please choose another one.',
  // 404
  'nf.kicker': 'Page not found',
  'nf.title': 'This moment *slipped away.*',
  'nf.body': 'The page you were looking for has moved or is no longer available.',
  'nf.home': 'Go to the homepage',
  'nf.stories': 'See our stories',
  'scroll': 'Scroll',
} as const

export type UIKey = keyof typeof en

const ms: Record<UIKey, string> = {
  'nav.home': 'Utama',
  'nav.stories': 'Kisah',
  'nav.services': 'Servis',
  'nav.about': 'Tentang Kami',
  'nav.contact': 'Hubungi',
  'nav.cta': 'Semak tarikh',
  'nav.main': 'Utama',
  'nav.openMenu': 'Buka menu',
  'nav.closeMenu': 'Tutup menu',
  'nav.menu': 'Menu',
  'nav.homeLabel': '{site} — laman utama',
  'lang.switch': 'English',
  'lang.short': 'EN',
  'lang.label': 'Read in English',
  'skip': 'Terus ke kandungan',
  'footer.explore': 'Teroka',
  'footer.hello': 'Jom berbual',
  'footer.inquiry': 'Hantar pertanyaan',
  'footer.privacy': 'Dasar privasi',
  'footer.label': 'Kaki laman',
  'wa.chat': 'Berbual dengan kami di WhatsApp',
  'bar.cta': 'Semak tarikh anda',
  'sample': 'Contoh',
  'sampleStory': 'Kisah contoh',
  'hero.photos': 'Gambar dan video pembukaan',
  'hero.prev': 'Sebelum',
  'hero.next': 'Seterusnya',
  'hero.slide': 'Slaid {n} daripada {total}',
  'stories.swipe': 'Leret untuk lihat lagi',
  'stories.next': 'Kisah seterusnya',
  'stories.all': 'Semua kisah',
  'stories.filter': 'Tapis kisah',
  'stories.empty': 'Kisah baharu akan menyusul.',
  'stories.openImage': 'Buka gambar',
  'stories.film': 'video',
  'reels.label': 'Reels',
  'reels.watch': 'Tonton',
  'reels.tapSound': 'Tekan reel untuk tonton dengan bunyi',
  'reels.prev': 'Reel sebelum',
  'reels.next': 'Reel seterusnya',
  'reels.mute': 'Senyapkan',
  'reels.unmute': 'Buka bunyi',
  'reels.pause': 'Jeda',
  'reels.play': 'Main',
  'reels.of': '{n} daripada {total}',
  'video.play': 'Main {title}',
  'video.loading': 'Memuatkan video',
  'video.failed': 'Video ini tidak dapat dimuatkan. Sila cuba lagi nanti.',
  'video.seek': 'Cari',
  'video.fullscreen': 'Skrin penuh',
  'close': 'Tutup',
  'gallery.label': 'Galeri gambar',
  'gallery.prev': 'Gambar sebelum',
  'gallery.next': 'Gambar seterusnya',
  'services.most': 'Paling diminati',
  'services.receive': 'Apa yang anda terima',
  'services.contactPrice': 'Hubungi untuk harga',
  'services.ask': 'Tanya tentang ini',
  'social.view': 'Lihat hantaran',
  'social.opens': 'buka {where}',
  'team.member': 'Ahli pasukan',
  'book.choose': 'Pilih tarikh majlis anda',
  'book.prevMonth': 'Bulan sebelum',
  'book.nextMonth': 'Bulan seterusnya',
  'book.open': '{n} tarikh kosong',
  'book.open1': '1 tarikh kosong',
  'book.full': 'Penuh',
  'book.key': 'Petunjuk kalendar',
  'book.available': 'Kosong',
  'book.limited': 'Slot terhad',
  'book.booked': 'Sudah ditempah',
  'book.yours': 'Tarikh anda',
  'book.state.available': 'kosong',
  'book.state.limited': 'slot terhad',
  'book.state.booked': 'sudah ditempah',
  'book.state.unavailable': 'tidak tersedia',
  'book.state.outside': 'belum dibuka untuk tempahan',
  'book.paused': 'Tempahan dalam talian ditutup buat sementara.',
  'book.pausedBody': 'Sila hantar pertanyaan di bawah dan kami akan balas dengan tarikh yang kosong.',
  'book.opening': 'Membuka WhatsApp supaya anda boleh hantar tempahan…',
  'book.openWa': 'Buka WhatsApp',
  'book.thanksEmail': 'Terima kasih — kami dah terima permintaan anda dan akan balas melalui emel tidak lama lagi.',
  'book.name': 'Nama anda',
  'book.partner': 'Nama pasangan',
  'book.type': 'Jenis majlis',
  'book.service': 'Servis',
  'book.location': 'Lokasi atau dewan',
  'book.locationHint': 'cth. Kuantan, atau nama dewan',
  'book.email': 'Emel',
  'book.notes': 'Ada apa-apa yang kami perlu tahu?',
  'book.consent': 'Saya setuju Ever After Memoir menyimpan maklumat ini untuk membalas.',
  'book.send': 'Hantar permintaan',
  'book.continue': 'Teruskan di WhatsApp',
  'book.waHint': 'WhatsApp akan dibuka dengan maklumat anda. Tekan hantar sahaja.',
  'book.preview': 'Tempahan ditutup dalam preview supaya tiada tempahan ujian dibuat.',
  'book.failed': 'Tempahan anda tidak dihantar. Sila cuba lagi.',
  'book.offline': 'Tempahan anda tidak dihantar. Semak sambungan internet dan cuba lagi.',
  'book.email.prefer': 'Lebih suka emel?',
  'book.change': 'Tukar tarikh',
  'form.optional': '(pilihan)',
  'form.choose': 'Pilih satu',
  'form.notSure': 'Belum pasti',
  'form.preferNot': 'Tidak mahu nyatakan',
  'form.sending': 'Menghantar…',
  'form.privacyLink': 'Baca dasar privasi',
  'form.privacy': 'Dasar privasi',
  'form.honeypot': 'Biarkan kosong',
  'inq.name': 'Nama anda',
  'inq.partner': 'Nama pasangan',
  'inq.email': 'Emel',
  'inq.whatsapp': 'Nombor WhatsApp',
  'inq.whatsappHint': 'Dengan kod negara, cth. +60 12 345 6789',
  'inq.date': 'Tarikh majlis',
  'inq.location': 'Lokasi atau dewan',
  'inq.type': 'Jenis majlis',
  'inq.service': 'Servis yang diminati',
  'inq.budget': 'Anggaran bajet',
  'inq.notes': 'Ceritakan tentang majlis anda',
  'inq.consent': 'Saya setuju Ever After Memoir menyimpan maklumat ini untuk membalas pertanyaan saya.',
  'inq.send': 'Hantar pertanyaan',
  'inq.another': 'Hantar pertanyaan lain',
  'inq.emailLabel': 'Emel',
  'inq.waLabel': 'WhatsApp',
  'inq.waLink': 'Mesej kami di WhatsApp',
  'inq.preview': 'Borang ditutup dalam preview supaya tiada pertanyaan ujian dibuat.',
  'inq.failed': 'Pertanyaan anda tidak dihantar. Semak sambungan internet dan cuba lagi.',
  'inq.open': 'Lebih suka emel? Hantar pertanyaan terperinci',
  'err.name': 'Sila isi nama anda',
  'err.nameLong': 'Nama mestilah kurang daripada 120 aksara',
  'err.long': 'Mestilah kurang daripada 120 aksara',
  'err.email': 'Sila masukkan alamat emel yang sah',
  'err.emailNeeded': 'Sila isi emel supaya kami boleh membalas',
  'err.whatsapp': 'Gunakan nombor sahaja, termasuk kod negara — cth. +60 12 345 6789',
  'err.date': 'Sila pilih tarikh majlis',
  'err.dateFuture': 'Tarikh mestilah hari ini atau selepasnya',
  'err.calendarDate': 'Pilih tarikh pada kalendar',
  'err.location': 'Di mana majlisnya? Nama bandar atau dewan pun dah cukup',
  'err.type': 'Sila pilih jenis majlis',
  'err.service': 'Sila pilih servis — “Belum pasti” pun boleh',
  'err.notes': 'Sila pendekkan nota anda',
  'err.consent': 'Sila tanda setuju supaya kami boleh simpan maklumat untuk membalas',
  'api.origin': 'Borang ini hanya boleh dihantar dari website.',
  'api.unreadable': 'Mesej anda tidak dapat dibaca. Sila cuba lagi.',
  'api.tooLong': 'Mesej anda terlalu panjang.',
  'api.check': 'Sila semak ruangan yang ditanda.',
  'api.notConnected': 'Borang ini belum disambungkan. Sila mesej kami di Instagram atau TikTok buat masa ini.',
  'api.retry': 'Mesej anda tidak dihantar. Sila cuba lagi dalam beberapa minit.',
  'api.limit': 'Anda sudah menghantar beberapa permintaan. Sila tunggu sejam, atau mesej kami di Instagram.',
  'api.paused': 'Tempahan dalam talian ditutup buat sementara. Sila hantar pertanyaan.',
  'api.outside': 'Tarikh itu tidak boleh ditempah dalam talian. Sila pilih tarikh lain.',
  'api.taken': 'Maaf — tarikh itu baru sahaja ditempah. Sila pilih tarikh lain.',
  'nf.kicker': 'Halaman tidak dijumpai',
  'nf.title': 'Saat ini *terlepas pergi.*',
  'nf.body': 'Halaman yang anda cari telah berpindah atau tiada lagi.',
  'nf.home': 'Ke laman utama',
  'nf.stories': 'Lihat kisah kami',
  'scroll': 'Skrol',
}

const DICT: Record<Lang, Record<UIKey, string>> = { en, ms }

/** UI word in the visitor's language, with {placeholders}. */
export function t(lang: Lang, key: UIKey, vars?: Record<string, string | number>) {
  let s: string = DICT[lang][key] ?? en[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

/** Translate a form error key (or pass through text that isn't a key). */
export function tErr(lang: Lang, keyOrText: string | undefined) {
  if (!keyOrText) return undefined
  return keyOrText in en ? t(lang, keyOrText as UIKey) : keyOrText
}

// Calendar words
export const WEEKDAYS: Record<Lang, string[]> = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  ms: ['Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa', 'Ah'],
}
