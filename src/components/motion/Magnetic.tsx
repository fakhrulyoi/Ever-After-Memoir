'use client'
import { m, useMotionValue, useSpring } from 'motion/react'
import type { ReactNode, PointerEvent } from 'react'
import { useIsDesktop } from './useIsDesktop'

/** Buttons lean very slightly toward the pointer (desktop only). */
export function Magnetic({ children, strength = 6, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const desktop = useIsDesktop()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const move = (e: PointerEvent<HTMLSpanElement>) => {
    if (!desktop) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set(((e.clientX - r.left) / r.width - 0.5) * strength * 2)
    y.set(((e.clientY - r.top) / r.height - 0.5) * strength * 2)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <m.span className={`inline-flex ${className}`} style={{ x, y }} onPointerMove={move} onPointerLeave={reset}>
      {children}
    </m.span>
  )
}
