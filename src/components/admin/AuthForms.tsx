'use client'
import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset, signIn, updateEmail, updatePassword } from '@/lib/actions/auth'
import type { ActionResult } from '@/lib/actions/result'
import { Button, FieldShell, inputClass } from './ui'

function Alert({ state, success }: { state: ActionResult | null; success?: string }) {
  if (!state) return null
  if (!state.ok) return <p className="border-l-2 border-danger bg-[#f6e7e3] px-3 py-2 text-sm text-danger" role="alert">{state.error}</p>
  return success ? <p className="border-l-2 border-olive bg-[#e2e7d8] px-3 py-2 text-sm text-success" role="status">{success}</p> : null
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, null)
  return (
    <form action={action} className="space-y-5">
      {notice && <p className="border-l-2 border-sage bg-cream px-3 py-2 text-sm" role="status">{notice}</p>}
      <Alert state={state} />
      <input type="hidden" name="next" value={next} />
      <FieldShell id="email" label="Email">
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
      </FieldShell>
      <FieldShell id="password" label="Password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </FieldShell>
      <Button type="submit" variant="primary" busy={pending} className="w-full">Sign in</Button>
      <p className="text-center text-sm"><Link href="/admin/forgot-password" className="text-ink-soft underline underline-offset-4 hover:text-olive-deep">Forgot your password?</Link></p>
    </form>
  )
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null)
  return (
    <form action={action} className="space-y-5">
      <Alert state={state} success="If that email belongs to an admin, a reset link is on its way. Open it on this device." />
      <FieldShell id="email" label="Email">
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
      </FieldShell>
      <Button type="submit" variant="primary" busy={pending} className="w-full">Send reset link</Button>
      <p className="text-center text-sm"><Link href="/admin/login" className="text-ink-soft underline underline-offset-4">Back to sign in</Link></p>
    </form>
  )
}

export function NewPasswordForm({ after }: { after: 'login' | 'account' }) {
  const [state, action, pending] = useActionState(updatePassword, null)
  return (
    <form action={action} className="space-y-5">
      <Alert state={state} success={after === 'login' ? 'Password updated.' : 'Password changed.'} />
      {state?.ok && after === 'login' && <Link href="/admin" className="block text-sm underline">Continue to the admin</Link>}
      <FieldShell id="password" label="New password" help="At least 10 characters. A short sentence is easy to remember and hard to guess.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </FieldShell>
      <FieldShell id="confirm" label="Type it again">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </FieldShell>
      <Button type="submit" variant="primary" busy={pending}>Save new password</Button>
    </form>
  )
}

export function EmailForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(updateEmail, null)
  return (
    <form action={action} className="space-y-5">
      <Alert state={state} success="Check both inboxes: Supabase sends a confirmation link before the change takes effect." />
      <FieldShell id="new-email" label="Email address">
        <input id="new-email" name="email" type="email" defaultValue={current} required className={inputClass} />
      </FieldShell>
      <Button type="submit" busy={pending}>Change email</Button>
    </form>
  )
}
