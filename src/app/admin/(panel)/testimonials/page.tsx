import type { Metadata } from 'next'
import { CollectionManager } from '@/components/admin/CollectionManager'
import { PageHeader } from '@/components/admin/ui'
import { listRows } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Testimonials' }

export default async function Page() {
  const rows = await listRows('testimonials')
  return (
    <>
      <PageHeader title="Testimonials" description="Only add words couples have approved. Until one is published, your homepage shows your manifesto instead." />
      <CollectionManager
        table="testimonials"
        newLabel="New testimonial"
        items={rows.map((r) => ({ id: r.id, status: r.status, hasChanges: r.hasChanges, draft: r.draft, updated_at: r.updated_at }))}
      />
    </>
  )
}
