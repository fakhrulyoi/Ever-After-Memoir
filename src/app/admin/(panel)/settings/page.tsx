import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ItemEditor } from '@/components/admin/ItemEditor'
import { getSettingsRow } from '@/lib/data/admin'
import { SITE_URL } from '@/lib/env'

export const metadata: Metadata = { title: 'Settings & SEO' }

export default async function SettingsPage() {
  const row = await getSettingsRow()
  if (!row) notFound()
  const host = new URL(SITE_URL).host
  const custom = !/vercel\.app$|localhost/.test(host)
  return (
    <>
      <ItemEditor table="site_settings" row={row} />
      <section className="mt-12 max-w-3xl border border-charcoal/10 bg-white/55 p-6">
        <h2 className="display text-2xl text-olive-deep">Website address</h2>
        <p className="mt-2 text-[0.9375rem]">
          Current address: <strong>{host}</strong> — {custom ? 'custom domain connected.' : 'no custom domain yet.'}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          To use your own domain, add it in Vercel → your project → Settings → Domains, follow the DNS steps shown there, then update
          NEXT_PUBLIC_SITE_URL and redeploy once. The README has step-by-step instructions.
        </p>
      </section>
    </>
  )
}
