import { notFound } from 'next/navigation'
import type { PageSlug } from '@/lib/content/types'
import { requireAdmin } from '@/lib/auth'
import { PageView, StoryPageView } from '@/lib/views'

const PAGES: Record<string, PageSlug> = {
  '': 'home',
  stories: 'stories',
  services: 'services',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
}

/** Admin-only mirror of the website that shows unpublished drafts. */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<{ live?: string }>
}) {
  await requireAdmin('/preview')
  const path = (await params).path ?? []
  const live = (await searchParams).live === '1'
  if (path.length === 2 && path[0] === 'stories') return <StoryPageView slug={path[1]} source="draft" />
  const slug = PAGES[path.join('/')]
  if (!slug || path.length > 1) notFound()
  return <PageView slug={slug} source="draft" live={live} />
}
