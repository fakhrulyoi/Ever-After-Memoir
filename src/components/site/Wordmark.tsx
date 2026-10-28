/** Typographic wordmark. Uses the uploaded logo instead when one is set. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-[family-name:var(--font-display)] leading-none tracking-[-0.01em] ${className}`}>
      Ever After <em className="font-light">Memoir</em>
    </span>
  )
}
