'use client'
import { useState, type DragEvent } from 'react'

/**
 * Drag-and-drop reordering for a list (mouse/trackpad). Arrow buttons remain
 * for keyboard and touch users.
 */
export function useDragSort<T>(items: T[], onChange: (next: T[]) => void) {
  const [from, setFrom] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const itemProps = (i: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      setFrom(i)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(i))
    },
    onDragOver: (e: DragEvent) => {
      if (from === null) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (over !== i) setOver(i)
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      if (from === null || from === i) return reset()
      const next = [...items]
      const [moved] = next.splice(from, 1)
      next.splice(i, 0, moved)
      onChange(next)
      reset()
    },
    onDragEnd: () => reset(),
    'data-dragging': from === i || undefined,
    'data-over': over === i && from !== i ? (from !== null && from < i ? 'below' : 'above') : undefined,
  })

  function reset() {
    setFrom(null)
    setOver(null)
  }

  return { itemProps, dragging: from !== null }
}

/** Shared classes: faded while dragged, a line where it will land. */
export const dragClasses =
  'data-[dragging]:opacity-40 data-[over=above]:shadow-[0_-2px_0_0_var(--color-olive-deep)] data-[over=below]:shadow-[0_2px_0_0_var(--color-olive-deep)]'
