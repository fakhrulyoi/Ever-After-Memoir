import type { Metadata } from 'next'
import { InquiryInbox } from '@/components/admin/Inquiries'
import { PageHeader } from '@/components/admin/ui'
import { getSettingsRow, listInquiries } from '@/lib/data/admin'
import type { SettingsContent } from '@/lib/content/types'

export const metadata: Metadata = { title: 'Inquiries' }

export default async function InquiriesPage() {
  const [rows, settings] = await Promise.all([listInquiries(), getSettingsRow<SettingsContent>()])
  const notify = Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_NOTIFY_EMAIL)
  return (
    <>
      <PageHeader
        title="Inquiries"
        description={notify ? 'Messages from your contact form. You also receive an email for each new one.' : 'Messages from your contact form. Email alerts are off — see the README to switch them on.'}
      />
      <InquiryInbox rows={rows} retentionMonths={settings?.draft.inquiryRetentionMonths ?? 0} />
    </>
  )
}
