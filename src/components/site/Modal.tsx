'use client'
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { EASE } from '../motion/MotionProvider'
import { IconClose } from './icons'

/** Accessible full-screen dialog: focus trap, Escape to close, focus returns to the opener. */
export function Modal({
  open,
  onClose,
  label,
  children,
  onKey,
}: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  onKey?: (e: KeyboardEvent) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[data-autofocus],button')?.focus())
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('button,a,input,[tabindex="0"]')]
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
      onKey?.(e)
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', handler)
      opener?.focus()
    }
  }, [open, onClose, onKey])

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="on-dark fixed inset-0 z-[90] flex flex-col bg-charcoal/96 text-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center md:right-6 md:top-6" aria-label="Close">
            <IconClose size={26} />
          </button>
          {children}
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
