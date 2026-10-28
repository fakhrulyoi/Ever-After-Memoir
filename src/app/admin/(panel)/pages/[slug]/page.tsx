import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageEditor } from '@/components/admin/PageEditor'
import { getPageRow, listRows } from '@/lib/data/admin'
import { PAGE_LABELS } from '@/lib/content/fields'
import type { PageContent, PageSlug, StoryContent } from '@/lib/content/types'

export const metadata: Metadata = { title: 'Edit page' }

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === 'home') redirect('/admin/homepage')
  if (!(slug in PAGE_LABELS)) notFound()
  const [row, stories] = await Promise.all([getPageRow<PageContent>(slug as PageSlug), listRows<StoryContent>('stories')])
  if (!row) notFound()
  return (
    <PageEditor
      slug={slug as PageSlug}
      row={row}
      form={{ stories: stories.filter((s) => s.status !== 'archived').map((s) => ({ id: s.id, title: s.draft.title, status: s.status })) }}
    />
  )
}
