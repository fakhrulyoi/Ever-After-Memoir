import type { MetadataRoute } from 'next'
import { listStories } from '@/lib/data/site'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await listStories().catch(() => [])
  const pages = ['', '/stories', '/services', '/about', '/contact', '/privacy'].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.7,
  }))
  return [
    ...pages,
    ...stories.map((s) => ({
      url: `${SITE_URL}/stories/${s.content.slug}`,
      lastModified: s.publishedAt ? new Date(s.publishedAt) : undefined,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
