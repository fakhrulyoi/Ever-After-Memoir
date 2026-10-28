import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './lib/env'

const PUBLIC_ADMIN = ['/admin/login', '/admin/forgot-password']

/**
 * Keeps the admin session fresh and sends signed-out visitors to the login page.
 * Pages and server actions check admin rights again on the server.
 */
export async function proxy(request: NextRequest) {
  const url = SUPABASE_URL
  const key = SUPABASE_ANON_KEY
  const { pathname, search } = request.nextUrl
  const isPublicAdmin = PUBLIC_ADMIN.some((p) => pathname === p)

  if (!url || !key) {
    if (isPublicAdmin) return NextResponse.next()
    return NextResponse.redirect(new URL('/admin/login?e=setup', request.url))
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v))
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims?.sub)

  if (!signedIn && !isPublicAdmin && pathname !== '/admin/reset-password') {
    const login = new URL('/admin/login', request.url)
    login.searchParams.set('next', pathname + search)
    return NextResponse.redirect(login)
  }
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/preview/:path*', '/preview'],
}
