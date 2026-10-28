'use client'
import Link from 'next/link'

export function PreviewBanner() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-ivory/15 bg-charcoal px-4 py-3 text-[0.8125rem] text-ivory" role="status">
      <span><strong className="font-semibold">Preview</strong> — showing unpublished changes. Visitors can&rsquo;t see this.</span>
      <Link href="/admin" className="underline underline-offset-4 hover:text-sage">Back to admin</Link>
    </div>
  )
}
