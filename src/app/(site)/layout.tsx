import { SiteShell } from '@/components/site/SiteShell'
import { getSettings } from '@/lib/data/site'
import { heroPaths } from '@/lib/views'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, heroes] = await Promise.all([getSettings(), heroPaths('published')])
  return (
    <SiteShell settings={settings} heroPaths={heroes}>
      {children}
    </SiteShell>
  )
}
