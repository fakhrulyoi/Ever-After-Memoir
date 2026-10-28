import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const IconPlay = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" stroke="none" /></svg>
)
export const IconPause = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8.5 5v14M15.5 5v14" strokeWidth={2} /></svg>
)
export const IconSound = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5Z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></svg>
)
export const IconMute = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5Z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></svg>
)
export const IconExpand = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
)
export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 5l14 14M19 5 5 19" /></svg>
)
export const IconArrow = ({ size, dir = 'right', ...p }: P & { dir?: 'left' | 'right' | 'up' | 'down' }) => {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir]
  return (
    <svg {...base(size)} {...p} style={{ transform: `rotate(${r}deg)` }}><path d="M4 12h15M14 6.5 19.5 12 14 17.5" /></svg>
  )
}
export const IconInstagram = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></svg>
)
export const IconTikTok = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M14 3.5v11.25a3.75 3.75 0 1 1-3.75-3.75" /><path d="M14 3.5c.4 2.6 2.3 4.4 5 4.6" /></svg>
)
export const IconWhatsApp = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6L4.5 19.5Z" /><path d="M9.2 8.6c.2-.5.9-.6 1.1-.1l.6 1.3c.1.3 0 .6-.2.8l-.4.4c.5 1 1.3 1.8 2.3 2.3l.4-.4c.2-.2.5-.3.8-.2l1.3.6c.5.2.4.9-.1 1.1-1.5.7-3.3.1-4.6-1.2s-1.9-3.1-1.2-4.6Z" /></svg>
)
export const IconMenu = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3.5 9h17M3.5 15h17" /></svg>
)
