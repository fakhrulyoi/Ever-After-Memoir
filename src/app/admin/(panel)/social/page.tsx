import type { Metadata } from 'next'
import { CollectionManager } from '@/components/admin/CollectionManager'
import { PageHeader } from '@/components/admin/ui'
import { listRows } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Social' }

export default async function Page() {
  const rows = await listRows('social_items')
  return (
    <>
      <PageHeader title="Social" description="The tiles in the social gallery. Each one links to a post. Your profile links live in Settings." />
      <CollectionManager
        table="social_items"
        newLabel="New tile"
        items={rows.map((r) => ({ id: r.id, status: r.status, hasChanges: r.hasChanges, draft: r.draft, updated_at: r.updated_at }))}
      />
    </>
  )
}
