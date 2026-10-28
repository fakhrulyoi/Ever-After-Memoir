import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '../env'

/**
 * Privileged client. SERVER ONLY — used for inserting public inquiries.
 * Never import this from a client component.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !key) return null
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
