'use client'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useIsDesktop } from './useIsDesktop'

/** Gentle vertical drift while scrolling. Off on small screens and for reduced motion. */
export function Parallax({ children, amount = 8, className = '' }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const desktop = useIsDesktop(768)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-amount}%`, `${amount}%`])
  const active = desktop && !reduce
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <m.div className="absolute -inset-y-[10%] inset-x-0" style={active ? { y } : undefined}>
        {children}
      </m.div>
    </div>
  )
}
