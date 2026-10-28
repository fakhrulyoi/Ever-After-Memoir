import { AdminNav } from '@/components/admin/AdminNav'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  const sb = await createSupabaseServer()
  const { count } = await sb.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new')
  return (
    <div className="lg:flex">
      <AdminNav email={admin.email} newInquiries={count ?? 0} />
      <main id="main" className="min-w-0 flex-1 px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-[110rem]">{children}</div>
      </main>
    </div>
  )
}
