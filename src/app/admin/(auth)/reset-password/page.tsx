import type { Metadata } from 'next'
import Link from 'next/link'
import { NewPasswordForm } from '@/components/admin/AuthForms'
import { createSupabaseServer } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/env'

export const metadata: Metadata = { title: 'Choose a new password' }
export const dynamic = 'force-dynamic'

export default async function ResetPage() {
  let signedIn = false
  if (isSupabaseConfigured) {
    const sb = await createSupabaseServer()
    signedIn = Boolean((await sb.auth.getUser()).data.user)
  }
  return (
    <>
      <h1 className="display mb-8 text-5xl text-olive-deep">Choose a new password</h1>
      {signedIn ? (
        <NewPasswordForm after="login" />
      ) : (
        <p className="text-[0.9375rem] text-ink-soft">
          This reset link has expired or was opened in a different browser. <Link className="underline" href="/admin/forgot-password">Request a new link</Link>.
        </p>
      )}
    </>
  )
}
