import type { Metadata } from 'next'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — Admin' },
  robots: { index: false, follow: false },
}

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-ivory text-charcoal">
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#343C2D', color: '#F7F5EF', border: 'none', borderRadius: 2, fontFamily: 'var(--font-sans)' },
        }}
      />
    </div>
  )
}
