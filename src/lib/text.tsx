import { Fragment, type ReactNode } from 'react'
import { isSafeHref } from './url'

/**
 * Safe, tiny markup for owner-written text (never renders HTML):
 *   *words*   → italic
 *   new line  → line break (headlines)
 */
export function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*[^*\n]+\*)/g)
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>,
  )
}

/** Headline with line breaks and italics. */
export function Rich({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {inline(line)}
        </Fragment>
      ))}
    </>
  )
}

/** Plain text version of a headline (for alt text, titles, aria labels). */
export function plain(text: string) {
  return text.replace(/\*/g, '').replace(/\s*\n\s*/g, ' ').trim()
}

/** Paragraphs separated by a blank line. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className={className}>
          {inline(p)}
        </p>
      ))}
    </>
  )
}

/** Long text: "## Heading", paragraphs, *italic* and [label](https://link). */
export function LongText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className="prose-memoir">
      {blocks.map((b, i) =>
        b.startsWith('## ') ? (
          <h2 key={i}>{b.slice(3)}</h2>
        ) : (
          <p key={i}>{withLinks(b)}</p>
        ),
      )}
    </div>
  )
}

function withLinks(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\[([^\]]{1,120})\]\(([^)\s]{1,500})\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    out.push(...inline(text.slice(last, m.index)))
    const href = m[2]
    out.push(
      isSafeHref(href) ? (
        <a key={m.index} href={href} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
          {m[1]}
        </a>
      ) : (
        m[1]
      ),
    )
    last = m.index + m[0].length
  }
  out.push(...inline(text.slice(last)))
  return out
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }, lang: 'en' | 'ms' = 'en') {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(lang === 'ms' ? 'ms-MY' : 'en-GB', opts).format(d)
}

export function waLink(number: string, message: string) {
  const digits = number.replace(/\D/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
