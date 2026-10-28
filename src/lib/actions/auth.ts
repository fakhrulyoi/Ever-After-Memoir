'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin } from '../auth'
import { createSupabaseServer } from '../supabase/server'
import { isSupabaseConfigured, SITE_URL } from '../env'
import type { ActionResult } from './result'

const safeNext = (n: unknown) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/admin')

export async function signIn(_: unknown, form: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: 'The database is not connected yet. Add the Supabase keys first (see README).' }
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' }
  const sb = await createSupabaseServer()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error || !data.user) return { ok: false, error: 'That email and password don’t match an admin account.' }
  const { data: admin } = await sb.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle()
  if (!admin) {
    await sb.auth.signOut()
    return { ok: false, error: 'This account doesn’t have admin access.' }
  }
  redirect(safeNext(form.get('next')))
}

export async function signOut() {
  const sb = await createSupabaseServer()
  await sb.auth.signOut({ scope: 'local' })
  redirect('/admin/login?signed_out=1')
}

export async function signOutEverywhere() {
  await requireAdmin()
  const sb = await createSupabaseServer()
  await sb.auth.signOut({ scope: 'global' })
  redirect('/admin/login?signed_out=1')
}

async function origin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : SITE_URL
}

export async function requestPasswordReset(_: unknown, form: FormData): Promise<ActionResult> {
  const email = String(form.get('email') ?? '').trim()
  if (!z.string().email().safeParse(email).success) return { ok: false, error: 'Enter a valid email address.' }
  if (!isSupabaseConfigured) return { ok: false, error: 'The database is not connected yet.' }
  const sb = await createSupabaseServer()
  await sb.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback?next=/admin/reset-password` })
  // Same answer whether or not the account exists
  return { ok: true }
}

const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters.')
  .max(72, 'Use 72 characters or fewer.')

export async function updatePassword(_: unknown, form: FormData): Promise<ActionResult> {
  const password = String(form.get('password') ?? '')
  const confirm = String(form.get('confirm') ?? '')
  const p = passwordSchema.safeParse(password)
  if (!p.success) return { ok: false, error: p.error.issues[0].message }
  if (password !== confirm) return { ok: false, error: 'The two passwords don’t match.' }
  const sb = await createSupabaseServer()
  const { data } = await sb.auth.getUser()
  if (!data.user) return { ok: false, error: 'This reset link has expired. Request a new one.' }
  const { error } = await sb.auth.updateUser({ password })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function updateEmail(_: unknown, form: FormData): Promise<ActionResult> {
  await requireAdmin()
  const email = String(form.get('email') ?? '').trim()
  if (!z.string().email().safeParse(email).success) return { ok: false, error: 'Enter a valid email address.' }
  const sb = await createSupabaseServer()
  const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: `${await origin()}/auth/callback?next=/admin/account` })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
