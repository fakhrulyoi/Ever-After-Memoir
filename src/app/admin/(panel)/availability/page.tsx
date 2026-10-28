import type { Metadata } from 'next'
import { AvailabilityManager } from '@/components/admin/AvailabilityManager'
import { PageHeader } from '@/components/admin/ui'
import { loadAvailability } from '@/lib/actions/availability'
import { getSettingsRow } from '@/lib/data/admin'
import type { SettingsContent } from '@/lib/content/types'
import { addMonths, monthStart, todayISO } from '@/lib/dates'

export const metadata: Metadata = { title: 'Availability' }

export default async function AvailabilityPage() {
  const from = monthStart(todayISO())
  const [{ days, inquiries }, settings] = await Promise.all([loadAvailability(from, addMonths(from, 36)), getSettingsRow<SettingsContent>()])
  const s = settings?.published ?? settings?.draft
  return (
    <>
      <PageHeader
        title="Availability"
        description={
          s?.whatsappNumber
            ? 'The dates couples see on your booking calendar. Changes show on the website straight away — no need to publish.'
            : 'The dates couples see on your booking calendar. Add your WhatsApp number in Settings so bookings open WhatsApp.'
        }
      />
      <AvailabilityManager initialDays={days} inquiries={inquiries} />
    </>
  )
}
