import type { MetadataRoute } from 'next'
import { listStories } from '@/lib/data/site'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await listStories().catch(() => [])
  // Each page in English and Malay, linked to each other
  const both = (path: string) => ({
    en: `${SITE_URL}${path === '/' ? '' : path}`,
    ms: `${SITE_URL}/ms${path === '/' ? '' : path}`,
  })
  const entry = (path: string, extra: Omit<MetadataRoute.Sitemap[number], 'url'>) => {
    const urls = both(path)
    return (['en', 'ms'] as const).map((l) => ({ url: urls[l], alternates: { languages: urls }, ...extra }))
  }
  return [
    ...['/', '/stories', '/services', '/about', '/contact', '/privacy'].flatMap((p) =>
      entry(p, { changeFrequency: 'monthly', priority: p === '/' ? 1 : 0.7 }),
    ),
    ...stories.flatMap((s) =>
      entry(`/stories/${s.content.slug}`, {
        lastModified: s.publishedAt ? new Date(s.publishedAt) : undefined,
        changeFrequency: 'yearly',
        priority: 0.6,
      }),
    ),
  ]
}
