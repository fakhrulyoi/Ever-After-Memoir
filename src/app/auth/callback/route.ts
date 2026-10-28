import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

/** Handles links from Supabase emails (password reset, email change). */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const nextParam = url.searchParams.get('next') ?? '/admin'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/admin'
  const supabase = await createSupabaseServer()

  let ok = false
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error

  return NextResponse.redirect(new URL(ok ? next : '/admin/login?e=link', url.origin))
}
