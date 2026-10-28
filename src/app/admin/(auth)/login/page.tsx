import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/AuthForms'
import { getAdmin } from '@/lib/auth'
import { isSupabaseConfigured } from '@/lib/env'

export const metadata: Metadata = { title: 'Sign in' }

const NOTICES: Record<string, string> = {
  setup: 'The database is not connected yet. Follow the setup steps in the README, then sign in.',
  link: 'That link has expired or was already used. Request a new one.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; e?: string; signed_out?: string }> }) {
  const sp = await searchParams
  if (await getAdmin()) redirect(sp.next?.startsWith('/') ? sp.next : '/admin')
  const notice = !isSupabaseConfigured ? NOTICES.setup : sp.e ? NOTICES[sp.e] : sp.signed_out ? 'You have signed out.' : undefined
  return (
    <>
      <p className="mb-2 font-[family-name:var(--font-display)] text-2xl text-olive-deep">Ever After <em>Memoir</em></p>
      <h1 className="display mb-8 text-5xl text-olive-deep">Sign in</h1>
      <LoginForm next={sp.next ?? '/admin'} notice={notice} />
    </>
  )
}
