import 'server-only'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Sections } from '@/components/site/Sections'
import { StoryView } from '@/components/site/StoryView'
import type { PageSlug } from './content/types'
import { getPage, getSettings, getSiteData, getStory, type Source } from './data/site'
import { SITE_URL } from './env'
import { localize, withLang, type Lang } from './i18n'
import { plain } from './text'

export const PAGE_PATHS: Record<PageSlug, string> = {
  home: '/',
  stories: '/stories',
  services: '/services',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
}

const abs = (url: string) => (url.startsWith('http') ? url : `${SITE_URL}${url}`)

/** canonical + hreflang links for a path (given without the language) */
function alternates(path: string, lang: Lang): Metadata['alternates'] {
  return {
    canonical: withLang(lang, path),
    languages: { en: path, ms: withLang('ms', path), 'x-default': path },
  }
}

export async function PageView({ slug, source, live, lang = 'en' }: { slug: PageSlug; source: Source; live?: boolean; lang?: Lang }) {
  const [page, data] = await Promise.all([getPage(slug, source), getSiteData(source)])
  if (!page) notFound()
  let liveId: string | undefined
  if (live && source === 'draft') liveId = slug
  // Live preview keeps both languages so edits from the admin show in either one
  return <Sections page={liveId ? page : localize(page, lang, true)} data={localize(data, lang, true)} live={liveId} />
}

export async function StoryPageView({ slug, source, lang = 'en' }: { slug: string; source: Source; lang?: Lang }) {
  const found = await getStory(slug, source)
  if (!found) notFound()
  return <StoryView story={localize(found.story, lang, true)} next={found.next ? localize(found.next, lang, true) : null} />
}

export async function pageMetadata(slug: PageSlug, lang: Lang = 'en'): Promise<Metadata> {
  const [rawPage, rawSettings] = await Promise.all([getPage(slug), getSettings()])
  const page = rawPage ? localize(rawPage, lang) : null
  const settings = localize(rawSettings, lang)
  const title = page?.seoTitle || `${page?.title ?? ''} — ${settings.siteTitle}`
  const description = page?.seoDescription || settings.metaDescription
  const path = PAGE_PATHS[slug]
  return {
    title: { absolute: title },
    description,
    alternates: alternates(path, lang),
    openGraph: {
      title,
      description,
      url: withLang(lang, path),
      siteName: settings.siteTitle,
      type: 'website',
      locale: lang === 'ms' ? 'ms_MY' : 'en_GB',
      images: settings.ogImage ? [{ url: abs(settings.ogImage.url) }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export async function storyMetadata(slug: string, lang: Lang = 'en'): Promise<Metadata> {
  const [found, rawSettings] = await Promise.all([getStory(slug), getSettings()])
  if (!found) return { title: 'Story not found' }
  const settings = localize(rawSettings, lang)
  const s = localize(found.story, lang).content
  const title = s.seoTitle || `${s.title} — ${settings.siteTitle}`
  const description = s.seoDescription || s.excerpt || settings.metaDescription
  const image = s.cover?.type === 'image' ? s.cover.url : settings.ogImage?.url
  const path = `/stories/${s.slug}`
  return {
    title: { absolute: title },
    description,
    alternates: alternates(path, lang),
    openGraph: {
      title,
      description,
      url: withLang(lang, path),
      type: 'article',
      locale: lang === 'ms' ? 'ms_MY' : 'en_GB',
      images: image ? [{ url: abs(image), alt: plain(s.title) }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/** Paths whose first visible section is a full-bleed image. */
export async function heroPaths(source: Source) {
  const home = await getPage('home', source)
  const first = home?.sections.find((s) => s.visible)
  return first?.type === 'hero' ? ['/'] : []
}
