import 'server-only'
import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ipSalt } from './env'

export const MAX_PER_HOUR = 5

export function clientIp(req: NextRequest) {
  return req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export function ipHash(req: NextRequest) {
  const salt = ipSalt()
  return createHash('sha256').update(`${salt}:${clientIp(req)}`).digest('hex')
}

/** Returns true when this visitor has already sent too many requests in the last hour. */
export async function overLimit(sb: SupabaseClient, hash: string): Promise<boolean | 'error'> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error } = await sb
    .from('inquiry_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', hash)
    .gte('created_at', since)
  if (error) return 'error'
  return (count ?? 0) >= MAX_PER_HOUR
}

export async function recordHit(sb: SupabaseClient, hash: string) {
  await sb.from('inquiry_rate_limits').insert({ ip_hash: hash })
  await sb.from('inquiry_rate_limits').delete().lt('created_at', new Date(Date.now() - 86400000).toISOString())
}
