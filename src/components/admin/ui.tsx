'use client'
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  variant = 'secondary',
  busy,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  const styles: Record<Variant, string> = {
    primary: 'bg-olive-deep text-ivory border-olive-deep hover:bg-olive',
    secondary: 'bg-ivory text-olive-deep border-charcoal/20 hover:border-olive-deep',
    ghost: 'bg-transparent text-olive-deep border-transparent hover:bg-cream',
    danger: 'bg-ivory text-danger border-danger/40 hover:bg-danger hover:text-ivory',
  }
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[2px] border px-4 text-[0.8125rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  )
}

export function StatusPill({ status, hasChanges }: { status: string; hasChanges?: boolean }) {
  if (status === 'published' && hasChanges)
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#efe3c8] px-2.5 py-0.5 text-xs font-medium text-[#6b4f1d]"><Dot c="#b98a2e" />Unpublished changes</span>
  if (status === 'published')
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2e7d8] px-2.5 py-0.5 text-xs font-medium text-success"><Dot c="#606B4F" />Live</span>
  if (status === 'archived')
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-ink-soft"><Dot c="#C8BFAF" />Archived</span>
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-ink-soft"><Dot c="#A5AD95" />Draft — not on the website</span>
}
const Dot = ({ c }: { c: string }) => <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} aria-hidden />

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-charcoal/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="display text-[2.5rem] leading-none text-olive-deep md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[0.9375rem] text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-charcoal/20 bg-ivory p-10">
      <p className="display text-3xl text-olive-deep">{title}</p>
      <p className="max-w-md text-[0.9375rem] text-ink-soft">{body}</p>
      {action}
    </div>
  )
}

export function FieldShell({
  id,
  label,
  help,
  error,
  children,
  counter,
}: {
  id: string
  label: string
  help?: string
  error?: string
  children: ReactNode
  counter?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-semibold text-charcoal">{label}</label>
        {counter && <span className="text-xs tabular-nums text-ink-soft">{counter}</span>}
      </div>
      {children}
      {help && !error && <p id={`${id}-help`} className="text-xs leading-relaxed text-ink-soft">{help}</p>}
      {error && <p className="text-xs text-danger" role="alert">{error}</p>}
    </div>
  )
}

export const inputClass =
  'block w-full rounded-[2px] border border-charcoal/20 bg-white/70 px-3 py-2.5 text-[0.9375rem] text-charcoal outline-none transition-colors placeholder:text-charcoal/35 focus:border-olive-deep focus:bg-white'

export function Toggle({ id, checked, onChange, label, help }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-olive-deep' : 'bg-taupe'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
        <span className="sr-only">{label}</span>
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[0.875rem] font-medium">{label}</span>
        {help && <span className="block text-xs text-ink-soft">{help}</span>}
      </label>
    </div>
  )
}

/** Confirmation dialog built on the native <dialog> element. */
export function Confirm({
  open,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean
  title: string
  body?: ReactNode
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onCancel() }}
      className="m-auto w-[min(92vw,30rem)] rounded-[2px] border border-charcoal/15 bg-ivory p-0 text-charcoal backdrop:bg-charcoal/50"
    >
      <div className="p-6">
        <h2 className="display text-3xl text-olive-deep">{title}</h2>
        {body && <div className="mt-3 text-[0.9375rem] text-ink-soft">{body}</div>}
        {children}
      </div>
      <div className="flex justify-end gap-2 border-t border-charcoal/10 bg-cream/60 px-6 py-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} busy={busy} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>
  )
}

export { formatBytes, formatWhen } from '@/lib/format'
