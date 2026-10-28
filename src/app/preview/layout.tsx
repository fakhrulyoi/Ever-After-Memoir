import type { Metadata } from 'next'
import { SiteShell } from '@/components/site/SiteShell'
import { requireAdmin } from '@/lib/auth'
import { getSettings } from '@/lib/data/site'
import { heroPaths } from '@/lib/views'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin('/preview')
  const [settings, heroes] = await Promise.all([getSettings('draft'), heroPaths('draft')])
  return (
    <SiteShell settings={settings} preview heroPaths={heroes}>
      {children}
    </SiteShell>
  )
}
