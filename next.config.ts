import type { NextConfig } from 'next'

const supabase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  } catch {
    return undefined
  }
})()
// Only for testing against a Supabase running on this machine
const isLocalSupabase = supabase?.hostname === 'localhost' || supabase?.hostname === '127.0.0.1'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2400],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      ...(supabase && !supabase.hostname.endsWith('.supabase.co')
        ? [
            {
              protocol: supabase.protocol.replace(':', '') as 'http' | 'https',
              hostname: supabase.hostname,
              port: supabase.port,
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
    ],
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/preview/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default nextConfig
