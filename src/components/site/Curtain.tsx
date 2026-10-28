'use client'
import { m, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { EASE } from '../motion/MotionProvider'
import { Wordmark } from './Wordmark'

let firstLoad = true

/** Page transition: a deep-olive panel lifts away when you move between pages. */
export function Curtain() {
  const reduce = useReducedMotion()
  const [active] = useState(() => !firstLoad)
  useEffect(() => {
    firstLoad = false
  }, [])
  if (!active || reduce) return null
  return (
    <m.div
      className="pointer-events-none fixed inset-0 z-[65] flex items-center justify-center bg-olive-deep text-ivory"
      initial={{ y: '0%' }}
      animate={{ y: '-101%' }}
      transition={{ duration: 0.75, ease: EASE, delay: 0.05 }}
      aria-hidden
    >
      <m.span
        className="text-3xl"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Wordmark />
      </m.span>
    </m.div>
  )
}
