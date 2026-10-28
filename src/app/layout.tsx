import type { Metadata, Viewport } from 'next'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource-variable/manrope/index.css'
import './globals.css'
import { getSettings } from '@/lib/data/site'
import { SITE_URL } from '@/lib/env'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null)
  const title = settings?.siteTitle ?? 'Ever After Memoir'
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${title}` },
    description: settings?.metaDescription,
    icons: settings?.favicon ? { icon: settings.favicon.url } : undefined,
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#343C2D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
