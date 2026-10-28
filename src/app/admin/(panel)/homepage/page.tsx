import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageEditor } from '@/components/admin/PageEditor'
import { getPageRow, listRows } from '@/lib/data/admin'
import type { PageContent, StoryContent } from '@/lib/content/types'

export const metadata: Metadata = { title: 'Homepage' }

export default async function HomepageEditor() {
  const [row, stories] = await Promise.all([getPageRow<PageContent>('home'), listRows<StoryContent>('stories')])
  if (!row) notFound()
  return (
    <PageEditor
      slug="home"
      row={row}
      form={{ stories: stories.filter((s) => s.status !== 'archived').map((s) => ({ id: s.id, title: s.draft.title, status: s.status })) }}
    />
  )
}
