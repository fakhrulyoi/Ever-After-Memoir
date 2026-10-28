'use client'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { CollageSection, ImageBreakSection } from '@/lib/content/types'
import { Rich } from '@/lib/text'
import { ImageReveal } from '../../motion/ImageReveal'
import { MaskedText } from '../../motion/MaskedText'
import { Reveal } from '../../motion/Reveal'
import { useIsDesktop } from '../../motion/useIsDesktop'
import { SiteLink } from '../context'
import { SmartImage } from '../Media'

/**
 * A cinematic pause between sections. Landscape photos fill the width and
 * settle from a slow zoom. Portrait photos (most phone and Instagram shots)
 * would be cropped and blown up at that size, so on wide screens they sit
 * sharp in a tall frame over a soft, blurred wash of the same picture.
 */
export function ImageBreak({ s }: { s: ImageBreakSection }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.55], [1.22, 1])
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const textY = useTransform(scrollYProgress, [0.2, 0.6], ['30%', '0%'])
  const frameY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const frameScale = useTransform(scrollYProgress, [0.1, 0.5], [0.9, 1])
  if (!s.media) return null
  const portrait = !!(s.media.width && s.media.height && s.media.height > s.media.width * 1.05)

  const quote = (s.quote || s.caption) && (
    <>
      {s.quote && <p className="display display-lg max-w-[18ch] [text-shadow:0_2px_30px_rgba(40,41,35,0.3)]"><Rich text={s.quote} /></p>}
      {s.caption && <p className="meta mt-6 !text-ivory/80">{s.caption}</p>}
    </>
  )

  return (
    <section ref={ref} className={`on-dark relative overflow-hidden bg-olive-deep text-ivory ${portrait ? 'h-[86svh] min-h-[560px] md:h-[100svh] md:min-h-[680px]' : 'h-[78svh] min-h-[480px]'}`}>
      {/* Full-bleed photo: always on phones, and on every screen for landscape photos */}
      <m.div className={`absolute -inset-y-[8%] inset-x-0 ${portrait ? 'md:hidden' : ''}`} style={reduce ? undefined : { scale, y }}>
        <SmartImage media={s.media} focal={s.focal} sizes={portrait ? '(min-width: 768px) 1px, 100vw' : '100vw'} />
      </m.div>
      <div className={`absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent ${portrait ? 'md:hidden' : ''}`} aria-hidden />

      {portrait && (
        <div className="absolute inset-0 hidden md:block" aria-hidden={!s.media.alt}>
          {/* Soft wash: the same photo, tiny and blurred, so it costs almost nothing to load */}
          <div className="absolute -inset-16 opacity-60 blur-3xl saturate-[0.85]" aria-hidden>
            <SmartImage media={s.media} focal={s.focal} sizes="64px" alt="" />
          </div>
          <div className="absolute inset-0 bg-olive-deep/55" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_0%,rgba(40,41,35,0.55)_75%)]" aria-hidden />
          <m.figure
            className="absolute right-[8%] top-1/2 h-[78%] -translate-y-1/2 overflow-hidden shadow-[0_40px_80px_-30px_rgba(20,22,16,0.7)] lg:right-[12%]"
            style={{ aspectRatio: `${s.media.width} / ${s.media.height}`, ...(reduce ? {} : { y: frameY, scale: frameScale }) }}
          >
            <SmartImage media={s.media} focal={s.focal} sizes="(min-width: 768px) 40vw, 1px" />
            <span className="pointer-events-none absolute inset-3 border border-ivory/25" aria-hidden />
          </m.figure>
        </div>
      )}

      {quote && (
        <>
          <m.div className={`shell absolute inset-x-0 bottom-0 pb-14 md:pb-20 ${portrait ? 'md:hidden' : ''}`} style={reduce ? undefined : { y: textY }}>
            {quote}
          </m.div>
          {portrait && (
            <div className="shell absolute inset-0 hidden items-center md:flex">
              <m.div className="max-w-[46%]" style={reduce ? undefined : { y: textY }}>
                <span className="mb-8 block h-px w-16 bg-ivory/50" aria-hidden />
                {quote}
              </m.div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// Where each photo sits on wide screens (percent of the collage box) and how
// fast it drifts while scrolling: depth without any extra clicks.
const SPOTS = [
  { left: 2, top: 2, w: 25, aspect: '4 / 5', speed: 70 },
  { left: 72, top: 0, w: 24, aspect: '3 / 4', speed: -50 },
  { left: 9, top: 56, w: 21, aspect: '3 / 4', speed: -80 },
  { left: 40, top: 64, w: 19, aspect: '4 / 5', speed: 40 },
  { left: 70, top: 55, w: 23, aspect: '1 / 1', speed: 95 },
  { left: 44, top: 0, w: 13, aspect: '4 / 5', speed: -30 },
]

function CollageTile({ i, item, progress, desktop }: { i: number; item: CollageSection['items'][number]; progress: ReturnType<typeof useScroll>['scrollYProgress']; desktop: boolean }) {
  const spot = SPOTS[i % SPOTS.length]
  const reduce = useReducedMotion()
  const y = useTransform(progress, [0, 1], [spot.speed, -spot.speed])
  if (!item.media) return null
  const style = desktop
    ? { position: 'absolute' as const, left: `${spot.left}%`, top: `${spot.top}%`, width: `${spot.w}%`, y: reduce ? 0 : y }
    : undefined
  return (
    <m.figure style={style} className={desktop ? '' : i % 3 === 0 ? 'col-span-2' : ''}>
      <ImageReveal style={{ aspectRatio: desktop ? spot.aspect : i % 3 === 0 ? '4 / 3' : '4 / 5' }} delay={desktop ? (i % 3) * 0.12 : 0}>
        <SmartImage media={item.media} sizes={desktop ? '28vw' : '(min-width: 640px) 50vw, 100vw'} />
      </ImageReveal>
      {item.caption && <figcaption className="display mt-3 text-lg italic text-olive">{item.caption}</figcaption>}
    </m.figure>
  )
}

/** Overlapping editorial spread; photos drift at different speeds as you scroll. */
export function Collage({ s }: { s: CollageSection }) {
  const ref = useRef<HTMLElement>(null)
  const desktop = useIsDesktop(1024)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const items = s.items.filter((i) => i.media).slice(0, SPOTS.length)
  if (!items.length) return null
  const header = (
    <div className={desktop ? 'pointer-events-none absolute inset-x-[26%] top-[24%] z-10 text-center' : 'mb-12'}>
      {s.eyebrow && <Reveal><p className={`kicker mb-6 ${desktop ? 'justify-center' : ''}`}>{s.eyebrow}</p></Reveal>}
      <MaskedText text={s.headline} className="display display-lg text-olive-deep" />
      {s.body && <Reveal delay={0.2}><p className={`lede mt-6 ${desktop ? 'mx-auto' : ''}`}>{s.body}</p></Reveal>}
      {s.link.label && (
        <Reveal delay={0.3} className="pointer-events-auto mt-8">
          <SiteLink href={s.link.href} className="text-link text-olive-deep">{s.link.label}</SiteLink>
        </Reveal>
      )}
    </div>
  )
  return (
    <section ref={ref} className="section-y overflow-hidden">
      <div className="shell">
        {desktop ? (
          <div className="relative h-[min(118vw,1500px)]">
            {header}
            {items.map((item, i) => (
              <CollageTile key={i} i={i} item={item} progress={scrollYProgress} desktop />
            ))}
          </div>
        ) : (
          <>
            {header}
            <div className="grid grid-cols-2 gap-3">
              {items.map((item, i) => (
                <CollageTile key={i} i={i} item={item} progress={scrollYProgress} desktop={false} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
