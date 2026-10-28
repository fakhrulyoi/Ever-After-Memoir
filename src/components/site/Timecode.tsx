'use client'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

/** A film timecode that keeps running — the day, as it happens. */
export function Timecode({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  const [t, setT] = useState(0)
  useEffect(() => {
    if (reduce) return
    const start = performance.now()
    let raf = 0
    const tick = () => {
      setT(performance.now() - start)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce])
  const total = Math.floor(t / 1000)
  const frames = Math.floor(((t % 1000) / 1000) * 24)
  return (
    <span className={`inline-flex items-center gap-2.5 text-[0.75rem] font-medium tabular-nums tracking-[0.06em] ${className}`} aria-hidden>
      <span className="h-1.5 w-1.5 rounded-full bg-sage" style={{ opacity: Math.floor(t / 600) % 2 && !reduce ? 0.35 : 1 }} />
      {pad(Math.floor(total / 3600))}:{pad(Math.floor(total / 60) % 60)}:{pad(total % 60)}:{pad(frames)}
    </span>
  )
}
