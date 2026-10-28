import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from './supabase/server'
import { isSupabaseConfigured } from './env'

export interface AdminSession {
  userId: string
  email: string
  role: 'owner' | 'editor'
}

/** Returns the signed-in admin, or null. Verified with Supabase Auth on every call. */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) return null
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  const { data: row } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (!row) return null
  return { userId: data.user.id, email: data.user.email ?? '', role: row.role }
})

/** Use at the top of every admin page and server action. */
export async function requireAdmin(next?: string): Promise<AdminSession> {
  const admin = await getAdmin()
  if (!admin) {
    redirect(`/admin/login${next ? `?next=${encodeURIComponent(next)}` : ''}`)
  }
  return admin
}
