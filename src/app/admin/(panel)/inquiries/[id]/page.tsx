import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InquiryDetail } from '@/components/admin/Inquiries'
import { PageHeader } from '@/components/admin/ui'
import { getInquiry } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Inquiry' }

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const found = await getInquiry(id)
  if (!found) notFound()
  const { inquiry, notes } = found
  return (
    <>
      <Link href="/admin/inquiries" className="mb-3 inline-block text-xs text-ink-soft hover:text-olive-deep">← All inquiries</Link>
      <PageHeader title={`${inquiry.full_name}${inquiry.partner_name ? ` & ${inquiry.partner_name}` : ''}`} />
      <InquiryDetail inquiry={inquiry} notes={notes} />
    </>
  )
}
