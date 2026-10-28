import 'server-only'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Sections } from '@/components/site/Sections'
import { StoryView } from '@/components/site/StoryView'
import type { PageSlug } from './content/types'
import { getPage, getSettings, getSiteData, getStory, type Source } from './data/site'
import { SITE_URL } from './env'
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

export async function PageView({ slug, source, live }: { slug: PageSlug; source: Source; live?: boolean }) {
  const [page, data] = await Promise.all([getPage(slug, source), getSiteData(source)])
  if (!page) notFound()
  let liveId: string | undefined
  if (live && source === 'draft') liveId = slug
  return <Sections page={page} data={data} live={liveId} />
}

export async function StoryPageView({ slug, source }: { slug: string; source: Source }) {
  const found = await getStory(slug, source)
  if (!found) notFound()
  return <StoryView story={found.story} next={found.next} />
}

export async function pageMetadata(slug: PageSlug): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()])
  const title = page?.seoTitle || `${page?.title ?? ''} — ${settings.siteTitle}`
  const description = page?.seoDescription || settings.metaDescription
  const path = PAGE_PATHS[slug]
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: settings.siteTitle,
      type: 'website',
      images: settings.ogImage ? [{ url: abs(settings.ogImage.url) }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export async function storyMetadata(slug: string): Promise<Metadata> {
  const [found, settings] = await Promise.all([getStory(slug), getSettings()])
  if (!found) return { title: 'Story not found' }
  const s = found.story.content
  const title = s.seoTitle || `${s.title} — ${settings.siteTitle}`
  const description = s.seoDescription || s.excerpt || settings.metaDescription
  const image = s.cover?.type === 'image' ? s.cover.url : settings.ogImage?.url
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/stories/${s.slug}` },
    openGraph: { title, description, url: `/stories/${s.slug}`, type: 'article', images: image ? [{ url: abs(image), alt: plain(s.title) }] : undefined },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/** Paths whose first visible section is a full-bleed image. */
export async function heroPaths(source: Source) {
  const home = await getPage('home', source)
  const first = home?.sections.find((s) => s.visible)
  return first?.type === 'hero' ? ['/'] : []
}
