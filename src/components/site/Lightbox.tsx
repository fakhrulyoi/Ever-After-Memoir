'use client'
import Image from 'next/image'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useRef } from 'react'
import type { MediaRef } from '@/lib/content/types'
import { EASE } from '../motion/MotionProvider'
import { Modal } from './Modal'
import { IconArrow } from './icons'

export interface LightboxItem {
  media: MediaRef
  caption?: string
}

/** Full-screen gallery: arrow keys, swipe, Escape. */
export function Lightbox({
  items,
  index,
  onChange,
  onClose,
}: {
  items: LightboxItem[]
  index: number | null
  onChange: (i: number) => void
  onClose: () => void
}) {
  const startX = useRef<number | null>(null)
  const go = useCallback(
    (d: number) => index !== null && onChange((index + d + items.length) % items.length),
    [index, items.length, onChange],
  )
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    },
    [go],
  )
  const item = index !== null ? items[index] : null
  return (
    <Modal open={index !== null} onClose={onClose} label="Image gallery" onKey={onKey}>
      <div
        className="relative flex flex-1 touch-pan-y select-none items-center justify-center px-4 py-16 md:px-24"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return
          const dx = e.clientX - startX.current
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
          startX.current = null
        }}
      >
        <AnimatePresence mode="wait">
          {item && (
            <m.div
              key={index}
              className="relative h-full w-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Image src={item.media.url} alt={item.media.alt ?? ''} fill sizes="100vw" className="object-contain" />
            </m.div>
          )}
        </AnimatePresence>
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center md:left-6" aria-label="Previous image">
              <IconArrow dir="left" size={26} />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center md:right-6" aria-label="Next image">
              <IconArrow size={26} />
            </button>
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-6 px-5 pb-6 text-sm md:px-10" aria-live="polite">
        <p className="text-taupe">{item?.caption}</p>
        <p className="meta shrink-0">{index !== null ? index + 1 : 0} / {items.length}</p>
      </div>
    </Modal>
  )
}
