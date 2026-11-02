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
  'book.limited': 'One slot left',
  'book.booked': 'Booked',
  'book.yours': 'Your date',
  'book.state.available': 'available',
  'book.state.limited': 'one slot left',
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
  'book.consent': 'I agree to {site} keeping these details to reply.',
  'book.send': 'Send booking request',
  'book.continue': 'Continue on WhatsApp',
  'book.waHint': 'WhatsApp opens with your details filled in. Just press send.',
  'book.preview': 'Booking is switched off in preview so no test bookings are created.',
  'book.failed': 'Your booking was not sent. Please try again.',
  'book.offline': 'Your booking was not sent. Check your connection and try again.',
  'book.email.prefer': 'Prefer email?',
  'book.change': 'Change date',
  'slot.label': 'Slot',
  'slot.day': 'Day',
  'slot.night': 'Night',
  'slot.dayHint': 'Morning to afternoon',
  'slot.nightHint': 'Evening to night',
  'slot.taken': 'Taken',
  'slot.choose': 'Day or night?',
  'book.coverTime': 'Cover time',
  'book.coverTimeHint': 'e.g. 11am – 4pm',
  'book.instagram': 'Bride or groom’s Instagram',
  'book.instagramHint': '@username',
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
  'inq.consent': 'I agree to {site} keeping these details to reply to my inquiry.',
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
  'err.slot': 'Choose day or night',
  'err.coverTime': 'Roughly what time should we cover?',
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
  'api.slotTaken': 'Sorry, that slot was just taken. Please choose the other slot or another date.',
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
  'nav.about': 'Tentang kami',
  'nav.contact': 'Hubungi',
  'nav.cta': 'Check tarikh',
  'nav.main': 'Menu utama',
  'nav.openMenu': 'Buka menu',
  'nav.closeMenu': 'Tutup menu',
  'nav.menu': 'Menu',
  'nav.homeLabel': '{site} — laman utama',
  'lang.switch': 'English',
  'lang.short': 'EN',
  'lang.label': 'Read in English',
  'skip': 'Terus ke kandungan',
  'footer.explore': 'Jalan-jalan',
  'footer.hello': 'Jom borak',
  'footer.inquiry': 'Hantar pertanyaan',
  'footer.privacy': 'Dasar privasi',
  'footer.label': 'Bawah laman',
  'wa.chat': 'WhatsApp kami',
  'bar.cta': 'Check tarikh kosong',
  'sample': 'Contoh',
  'sampleStory': 'Kisah contoh',
  'hero.photos': 'Gambar dan video pembukaan',
  'hero.prev': 'Sebelum',
  'hero.next': 'Seterusnya',
  'hero.slide': '{n} daripada {total}',
  'stories.swipe': 'Leret ke tepi',
  'stories.next': 'Kisah seterusnya',
  'stories.all': 'Semua',
  'stories.filter': 'Tapis kisah',
  'stories.empty': 'Kisah baru akan menyusul, nanti datang lagi ya.',
  'stories.openImage': 'Buka gambar',
  'stories.film': 'video',
  'reels.label': 'Reels',
  'reels.watch': 'Tengok',
  'reels.tapSound': 'Tekan reel untuk tengok dengan bunyi',
  'reels.prev': 'Reel sebelum',
  'reels.next': 'Reel seterusnya',
  'reels.mute': 'Senyap',
  'reels.unmute': 'Buka bunyi',
  'reels.pause': 'Pause',
  'reels.play': 'Main',
  'reels.of': '{n} / {total}',
  'video.play': 'Main {title}',
  'video.loading': 'Tengah load video',
  'video.failed': 'Video tak dapat dibuka. Cuba lagi kejap lagi ya.',
  'video.seek': 'Cari',
  'video.fullscreen': 'Skrin penuh',
  'close': 'Tutup',
  'gallery.label': 'Galeri gambar',
  'gallery.prev': 'Gambar sebelum',
  'gallery.next': 'Gambar seterusnya',
  'services.most': 'Paling ramai ambil',
  'services.receive': 'Apa yang korang dapat',
  'services.contactPrice': 'Tanya harga',
  'services.ask': 'Tanya pasal ni',
  'social.view': 'Tengok post',
  'social.opens': 'buka {where}',
  'team.member': 'Ahli team',
  'book.choose': 'Pilih tarikh majlis',
  'book.prevMonth': 'Bulan sebelum',
  'book.nextMonth': 'Bulan depan',
  'book.open': '{n} tarikh kosong',
  'book.open1': '1 tarikh kosong',
  'book.full': 'Dah penuh',
  'book.key': 'Maksud warna kalendar',
  'book.available': 'Kosong',
  'book.limited': 'Tinggal 1 slot',
  'book.booked': 'Penuh',
  'book.yours': 'Tarikh korang',
  'book.state.available': 'kosong',
  'book.state.limited': 'tinggal satu slot',
  'book.state.booked': 'penuh',
  'book.state.unavailable': 'tak available',
  'book.state.outside': 'belum buka untuk booking',
  'book.paused': 'Booking online ditutup sekejap.',
  'book.pausedBody': 'Hantar pertanyaan kat bawah, nanti kami reply dengan tarikh yang kosong.',
  'book.opening': 'Tengah buka WhatsApp, kejap ya…',
  'book.openWa': 'Buka WhatsApp',
  'book.thanksEmail': 'Terima kasih! Kami dah terima, nanti kami reply melalui emel.',
  'book.name': 'Nama',
  'book.partner': 'Nama pasangan',
  'book.type': 'Jenis majlis',
  'book.service': 'Servis',
  'book.location': 'Tempat',
  'book.locationHint': 'cth. Dewan Seri Melati, Kuantan',
  'book.email': 'Emel',
  'book.notes': 'Ada apa-apa nak bagitahu?',
  'book.consent': 'Saya setuju {site} simpan info ni untuk reply saya.',
  'book.send': 'Hantar',
  'book.continue': 'Sambung kat WhatsApp',
  'book.waHint': 'WhatsApp akan buka dengan info korang dah siap ditulis. Tekan hantar je.',
  'book.preview': 'Booking ditutup dalam preview, supaya takde booking ujian masuk.',
  'book.failed': 'Booking tak berjaya dihantar. Cuba sekali lagi ya.',
  'book.offline': 'Booking tak berjaya dihantar. Check internet, lepas tu cuba lagi.',
  'book.email.prefer': 'Lebih selesa emel?',
  'book.change': 'Tukar tarikh',
  'slot.label': 'Slot',
  'slot.day': 'Siang',
  'slot.night': 'Malam',
  'slot.dayHint': 'Pagi sampai petang',
  'slot.nightHint': 'Petang sampai malam',
  'slot.taken': 'Dah diambil',
  'slot.choose': 'Siang ke malam?',
  'book.coverTime': 'Cover time',
  'book.coverTimeHint': 'cth. 11 pagi – 4 petang',
  'book.instagram': 'IG pengantin',
  'book.instagramHint': '@username',
  'form.optional': '(kalau ada)',
  'form.choose': 'Pilih satu',
  'form.notSure': 'Belum pasti lagi',
  'form.preferNot': 'Tak nak bagitahu',
  'form.sending': 'Tengah hantar…',
  'form.privacyLink': 'Baca dasar privasi',
  'form.privacy': 'Dasar privasi',
  'form.honeypot': 'Biar kosong',
  'inq.name': 'Nama',
  'inq.partner': 'Nama pasangan',
  'inq.email': 'Emel',
  'inq.whatsapp': 'No. WhatsApp',
  'inq.whatsappHint': 'Dengan kod negara, cth. +60 12 345 6789',
  'inq.date': 'Tarikh majlis',
  'inq.location': 'Tempat',
  'inq.type': 'Jenis majlis',
  'inq.service': 'Servis yang korang minat',
  'inq.budget': 'Anggaran bajet',
  'inq.notes': 'Cerita sikit pasal majlis korang',
  'inq.consent': 'Saya setuju {site} simpan info ni untuk reply pertanyaan saya.',
  'inq.send': 'Hantar pertanyaan',
  'inq.another': 'Hantar lagi satu',
  'inq.emailLabel': 'Emel',
  'inq.waLabel': 'WhatsApp',
  'inq.waLink': 'WhatsApp kami',
  'inq.preview': 'Borang ditutup dalam preview, supaya takde pertanyaan ujian masuk.',
  'inq.failed': 'Pertanyaan tak berjaya dihantar. Check internet, lepas tu cuba lagi.',
  'inq.open': 'Lebih selesa emel? Hantar pertanyaan penuh',
  'err.name': 'Isi nama dulu ya',
  'err.nameLong': 'Nama terlalu panjang',
  'err.long': 'Panjang sangat ni, pendekkan sikit',
  'err.email': 'Emel ni macam tak betul',
  'err.emailNeeded': 'Isi emel supaya kami boleh reply',
  'err.whatsapp': 'Nombor je, dengan kod negara. cth. +60 12 345 6789',
  'err.date': 'Pilih tarikh majlis dulu',
  'err.dateFuture': 'Tarikh kena hari ini atau lepas ni',
  'err.calendarDate': 'Pilih tarikh kat kalendar dulu',
  'err.location': 'Majlis kat mana? Nama dewan atau bandar pun dah cukup',
  'err.type': 'Pilih jenis majlis',
  'err.service': 'Pilih servis. “Belum pasti lagi” pun boleh',
  'err.notes': 'Panjang sangat, pendekkan sikit ya',
  'err.consent': 'Tanda setuju dulu supaya kami boleh simpan info dan reply',
  'err.slot': 'Pilih siang atau malam',
  'err.coverTime': 'Lebih kurang pukul berapa nak cover?',
  'api.origin': 'Borang ni hanya boleh dihantar dari website kami.',
  'api.unreadable': 'Ada masalah sikit. Cuba sekali lagi ya.',
  'api.tooLong': 'Mesej panjang sangat.',
  'api.check': 'Ada ruangan yang belum betul, check balik ya.',
  'api.notConnected': 'Borang belum disambung lagi. Buat masa ni, DM kami kat Instagram atau TikTok ya.',
  'api.retry': 'Tak berjaya dihantar. Cuba lagi dalam beberapa minit.',
  'api.limit': 'Korang dah hantar beberapa kali. Tunggu sejam, atau DM kami kat Instagram.',
  'api.paused': 'Booking online ditutup sekejap. Hantar pertanyaan dulu ya.',
  'api.outside': 'Tarikh tu tak boleh dibook online. Pilih tarikh lain ya.',
  'api.taken': 'Alamak, tarikh tu baru je kena book. Pilih tarikh lain ya.',
  'api.slotTaken': 'Alamak, slot tu baru je kena ambil. Pilih slot lagi satu atau tarikh lain.',
  'nf.kicker': 'Page tak jumpa',
  'nf.title': 'Momen ni *dah terlepas.*',
  'nf.body': 'Page yang korang cari dah pindah, atau dah takde.',
  'nf.home': 'Balik ke laman utama',
  'nf.stories': 'Tengok kisah kami',
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
