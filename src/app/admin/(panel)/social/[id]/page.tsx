import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ItemEditor } from '@/components/admin/ItemEditor'
import { getRow } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Edit' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const row = await getRow('social_items', id)
  if (!row) notFound()
  return <ItemEditor table="social_items" row={row} />
}
