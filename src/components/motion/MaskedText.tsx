'use client'
import { m, useReducedMotion } from 'motion/react'
import { Fragment, type ElementType } from 'react'
import { EASE } from './MotionProvider'
import { plain } from '@/lib/text'

type Token = { word: string; italic: boolean }

function tokenize(line: string): Token[] {
  const out: Token[] = []
  line.split(/(\*[^*]+\*)/g).forEach((part) => {
    if (!part) return
    const italic = part.startsWith('*') && part.endsWith('*') && part.length > 2
    const body = italic ? part.slice(1, -1) : part
    body.split(/(\s+)/).forEach((w) => {
      if (w && !/^\s+$/.test(w)) out.push({ word: w, italic })
    })
  })
  return out
}

/**
 * Headline whose words rise out of an invisible mask.
 * Supports *italic* and line breaks. Screen readers get the plain sentence.
 */
export function MaskedText({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  onMount = false,
  stagger = 0.055,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  /** Animate immediately (hero) instead of when scrolled into view */
  onMount?: boolean
  stagger?: number
}) {
  const reduce = useReducedMotion()
  const lines = text.split('\n')
  let i = 0

  const word = (t: Token, key: number) => {
    const n = i++
    const Inner = t.italic ? 'em' : Fragment
    const d = delay + n * stagger
    return (
      <Fragment key={key}>
        <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
          {onMount ? (
            // CSS animation: starts on first paint, before JavaScript loads
            <span className="rise-word inline-block" style={{ animationDelay: `${d}s` }}>
              <Inner>{t.word}</Inner>
            </span>
          ) : (
            <m.span
              className="inline-block will-change-transform"
              variants={{
                hide: { y: '108%', opacity: 0 },
                show: { y: '0%', opacity: 1, transition: { duration: 1.1, ease: EASE, delay: d } },
              }}
            >
              <Inner>{t.word}</Inner>
            </m.span>
          )}
        </span>{' '}
      </Fragment>
    )
  }

  const body = lines.map((line, li) => (
    <span key={li} className="block">
      {tokenize(line).map((t, wi) => word(t, wi))}
    </span>
  ))

  return (
    <Tag className={className}>
      <span className="sr-only">{plain(text)}</span>
      {onMount ? (
        <span aria-hidden className="block">{body}</span>
      ) : (
        <m.span aria-hidden initial={reduce ? 'show' : 'hide'} whileInView="show" viewport={{ once: true, amount: 0.5 }} className="block">
          {body}
        </m.span>
      )}
    </Tag>
  )
}
