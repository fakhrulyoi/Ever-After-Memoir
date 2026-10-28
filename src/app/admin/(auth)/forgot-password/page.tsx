import type { Metadata } from 'next'
import { ForgotForm } from '@/components/admin/AuthForms'

export const metadata: Metadata = { title: 'Reset password' }

export default function ForgotPage() {
  return (
    <>
      <h1 className="display mb-3 text-5xl text-olive-deep">Reset your password</h1>
      <p className="mb-8 text-[0.9375rem] text-ink-soft">Enter your admin email and we’ll send you a link to choose a new password.</p>
      <ForgotForm />
    </>
  )
}
