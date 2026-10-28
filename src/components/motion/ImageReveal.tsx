'use client'
import { m } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { EASE } from './MotionProvider'

/** Image uncovered from the bottom while it settles from a slight zoom. */
export function ImageReveal({
  children,
  className = '',
  delay = 0,
  onMount = false,
  style,
}: {
  children: ReactNode
  className?: string
  delay?: number
  onMount?: boolean
  style?: CSSProperties
}) {
  const trigger = onMount
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport: { once: true, amount: 0.2 } }
  // The in-view trigger sits on a wrapper without clip-path: Chrome treats a
  // fully clipped element as invisible and would never start the reveal.
  return (
    <m.div className={`relative ${className}`} style={style} initial="hide" {...trigger}>
      <m.div
        className="absolute inset-0 overflow-hidden"
        variants={{
          hide: { clipPath: 'inset(100% 0% 0% 0%)' },
          show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.25, ease: EASE, delay } },
        }}
      >
        <m.div
          className="absolute inset-0"
          variants={{ hide: { scale: 1.14 }, show: { scale: 1, transition: { duration: 1.8, ease: EASE, delay } } }}
        >
          {children}
        </m.div>
      </m.div>
    </m.div>
  )
}
