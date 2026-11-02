'use client'
import { useSite } from './context'

/**
 * Typographic wordmark from the website name in Settings.
 * "everafter.memoir" → everafter.<em>memoir</em>; "Ever After Memoir" → Ever After <em>Memoir</em>.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  const { settings } = useSite()
  const name = settings.siteTitle || 'everafter.memoir'
  const cut = name.includes('.') ? name.lastIndexOf('.') + 1 : name.lastIndexOf(' ') + 1
  const head = cut > 0 ? name.slice(0, cut) : name
  const tail = cut > 0 ? name.slice(cut) : ''
  return (
    <span className={`font-[family-name:var(--font-display)] leading-none tracking-[-0.01em] ${className}`}>
      {head}
      {tail && <em className="font-light">{tail}</em>}
    </span>
  )
}
