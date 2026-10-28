import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, serviceRoleKey } from '../env'

/**
 * Privileged client. SERVER ONLY — used for inserting public inquiries.
 * Never import this from a client component.
 */
export function createServiceClient() {
  const key = serviceRoleKey()
  if (!SUPABASE_URL || !key) return null
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
