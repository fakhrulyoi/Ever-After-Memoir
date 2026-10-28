import type { Metadata } from 'next'
import { CollectionManager } from '@/components/admin/CollectionManager'
import { PageHeader } from '@/components/admin/ui'
import { listRows } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Services & packages' }

export default async function Page() {
  const rows = await listRows('services')
  return (
    <>
      <PageHeader title="Services & packages" description="What you offer. Prices only appear when you switch on “Show the price”." />
      <CollectionManager
        table="services"
        newLabel="New service"
        items={rows.map((r) => ({ id: r.id, status: r.status, hasChanges: r.hasChanges, draft: r.draft, updated_at: r.updated_at }))}
      />
    </>
  )
}
