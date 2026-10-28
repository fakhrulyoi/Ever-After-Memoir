'use client'
import { useEffect, useState } from 'react'

/** True on wide screens with a precise pointer (mouse/trackpad). */
export function useIsDesktop(minWidth = 1024) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px) and (pointer: fine)`)
    const update = () => setOk(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [minWidth])
  return ok
}
