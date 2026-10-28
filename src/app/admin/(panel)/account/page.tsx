import type { Metadata } from 'next'
import { EmailForm, NewPasswordForm } from '@/components/admin/AuthForms'
import { PageHeader } from '@/components/admin/ui'
import { signOutEverywhere } from '@/lib/actions/auth'
import { requireAdmin } from '@/lib/auth'

export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const admin = await requireAdmin()
  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${admin.email}.`} />
      <div className="grid max-w-4xl gap-10 md:grid-cols-2">
        <section>
          <h2 className="display mb-4 text-2xl text-olive-deep">Change password</h2>
          <NewPasswordForm after="account" />
        </section>
        <section className="space-y-10">
          <div>
            <h2 className="display mb-4 text-2xl text-olive-deep">Sign-in email</h2>
            <EmailForm current={admin.email} />
          </div>
          <div>
            <h2 className="display mb-2 text-2xl text-olive-deep">Sign out everywhere</h2>
            <p className="mb-4 text-sm text-ink-soft">Use this if you signed in on a shared or lost device.</p>
            <form action={signOutEverywhere}>
              <button type="submit" className="inline-flex min-h-10 items-center rounded-[2px] border border-danger/40 px-4 text-[0.8125rem] font-semibold text-danger hover:bg-danger hover:text-ivory">Sign out on all devices</button>
            </form>
          </div>
        </section>
      </div>
    </>
  )
}
