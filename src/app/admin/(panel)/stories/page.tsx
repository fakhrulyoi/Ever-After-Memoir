import type { Metadata } from 'next'
import { CollectionManager } from '@/components/admin/CollectionManager'
import { PageHeader } from '@/components/admin/ui'
import { listRows } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Stories' }

export default async function Page() {
  const rows = await listRows('stories')
  return (
    <>
      <PageHeader title="Stories" description="Your wedding stories. Only published stories appear on the website, in this order." />
      <CollectionManager
        table="stories"
        newLabel="New story"
        items={rows.map((r) => ({ id: r.id, status: r.status, hasChanges: r.hasChanges, draft: r.draft, updated_at: r.updated_at }))}
      />
    </>
  )
}
