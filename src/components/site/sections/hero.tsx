'use client'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeroSection } from '@/lib/content/types'
import { EASE } from '../../motion/MotionProvider'
import { Magnetic } from '../../motion/Magnetic'
import { MaskedText } from '../../motion/MaskedText'
import { SiteLink } from '../context'
import { SmartImage } from '../Media'
import { Timecode } from '../Timecode'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Opening "reel": photos play one after another like a story, with segmented
 * progress bars. Tap the left or right half to move between photos; press and
 * hold to pause. Under reduced motion the reel never advances on its own.
 */
export function HeroReel({ s }: { s: HeroSection }) {
  const slides = s.slides.length ? s.slides : s.media ? [s.media] : []
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const frameY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const n = slides.length

  const goTo = useCallback(
    (i: number) => {
      if (n < 2) return
      setPrev(index)
      setIndex(((i % n) + n) % n)
    },
    [index, n],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    const onVis = () => setInView(!document.hidden && el.getBoundingClientRect().bottom > 0)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const running = !reduce && !paused && inView && n > 1
  const visible = new Set([index, prev, (index + 1) % Math.max(n, 1)].filter((x): x is number => x !== null))

  return (
    <section
      ref={ref}
      className="on-dark relative min-h-[max(100svh,680px)] overflow-hidden bg-olive-deep text-ivory"
      aria-roledescription="carousel"
      aria-label="Opening photos"
    >
      {/* Photo frame: full-bleed on phones, the right half on larger screens */}
      <m.div className="absolute inset-0 md:left-auto md:w-[50%] lg:w-[47%]" style={{ y: frameY }}>
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, i) =>
            visible.has(i) ? (
              <m.div
                key={i}
                className="absolute inset-0"
                style={{ zIndex: i === index ? 2 : 1 }}
                initial={false}
                animate={
                  i === index
                    ? { clipPath: 'inset(0% 0% 0% 0%)' }
                    : i === prev
                      ? { clipPath: 'inset(0% 0% 0% 0%)' }
                      : { clipPath: 'inset(0% 0% 0% 100%)' }
                }
                transition={{ duration: reduce ? 0 : 1.15, ease: EASE }}
                aria-hidden={i !== index}
              >
                <m.div
                  key={`${i}-${i === index ? index : 'x'}`}
                  className="absolute inset-0"
                  initial={{ scale: reduce ? 1 : 1.14 }}
                  animate={{ scale: reduce ? 1 : 1.02 }}
                  transition={{ duration: reduce ? 0 : s.interval + 1.5, ease: 'linear' }}
                >
                  <SmartImage media={slide} priority={i === 0} sizes="(min-width: 768px) 50vw, 100vw" focal={i === 0 ? s.focal : undefined} />
                </m.div>
              </m.div>
            ) : null,
          )}
          <div className="absolute inset-0 z-[3] bg-olive-deep" style={{ opacity: s.overlay * 0.6 }} aria-hidden />
          <div className="absolute inset-x-0 bottom-0 z-[3] h-3/4 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-transparent md:h-1/3 md:from-charcoal/45" aria-hidden />
          <div className="absolute inset-x-0 top-0 z-[3] h-40 bg-gradient-to-b from-charcoal/45 to-transparent" aria-hidden />
        </div>

        {/* Story-style progress */}
        {n > 1 && (
          <div className="absolute inset-x-4 top-[5.25rem] z-[5] flex gap-1.5 md:inset-x-6 md:top-28" aria-hidden>
            {slides.map((_, i) => (
              <span key={i} className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-ivory/30">
                <span
                  key={i === index ? `run-${index}` : `idle-${i}`}
                  className="absolute inset-y-0 left-0 bg-ivory"
                  style={
                    i < index
                      ? { width: '100%' }
                      : i === index
                        ? reduce
                          ? { width: '100%' }
                          : {
                              width: '100%',
                              transformOrigin: 'left',
                              animation: `eam-progress ${s.interval}s linear forwards`,
                              animationPlayState: running ? 'running' : 'paused',
                            }
                        : { width: 0 }
                  }
                  onAnimationEnd={i === index && !reduce ? () => goTo(index + 1) : undefined}
                />
              </span>
            ))}
          </div>
        )}

        {/* Tap zones: left = previous, right = next; press and hold = pause */}
        {n > 1 && (
          <div className="absolute inset-0 z-[4] flex" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
            <button type="button" className="h-full w-1/3 cursor-w-resize focus-visible:outline-offset-[-6px]" aria-label="Previous photo" onClick={() => goTo(index - 1)} />
            <button type="button" className="h-full flex-1 cursor-e-resize focus-visible:outline-offset-[-6px]" aria-label="Next photo" onClick={() => goTo(index + 1)} />
          </div>
        )}

        <div className="pointer-events-none absolute bottom-8 right-4 z-[5] hidden items-center gap-5 md:right-28 md:flex" aria-hidden>
          {s.showTimecode && <Timecode className="text-ivory/85" />}
          {n > 1 && (
            <span className="display text-xl italic text-ivory/90">
              {pad(index + 1)} <span className="text-ivory/50">/ {pad(n)}</span>
            </span>
          )}
        </div>
      </m.div>

      {/* Words */}
      <m.div
        className="shell pointer-events-none relative z-10 flex min-h-[max(100svh,680px)] flex-col justify-end pb-12 pt-40 md:pb-16"
        style={{ y: contentY, opacity: fade }}
      >
        <div className="pointer-events-auto max-w-[44rem] md:max-w-none">
          {s.eyebrow && (
            <p className="kicker fade-in mb-7 !text-ivory/85" style={{ animationDelay: '0.4s' }}>
              {s.eyebrow}
            </p>
          )}
          <MaskedText as="h1" text={s.headline} onMount delay={0.35} className="display display-xl [text-shadow:0_2px_30px_rgba(40,41,35,0.25)]" />
          <div className="fade-up mt-8 flex max-w-md flex-col gap-8 md:max-w-sm lg:max-w-md" style={{ animationDelay: '0.6s' }}>
            {s.body && <p className="lede !text-ivory/85">{s.body}</p>}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {s.primary.label && (
                <Magnetic>
                  <SiteLink href={s.primary.href} className="btn btn-light">{s.primary.label}</SiteLink>
                </Magnetic>
              )}
              {s.secondary.label && <SiteLink href={s.secondary.href} className="text-link">{s.secondary.label}</SiteLink>}
            </div>
          </div>
        </div>
        <m.div
          className="mt-10 flex items-center gap-3 text-[0.75rem] tracking-[0.14em] text-ivory/70 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          aria-hidden
        >
          {s.showTimecode && <Timecode />}
          {n > 1 && <span className="display text-base italic tracking-normal">{pad(index + 1)} / {pad(n)}</span>}
        </m.div>
      </m.div>
      <span className="sr-only" aria-live="polite">
        Photo {index + 1} of {n}{slides[index]?.alt ? `: ${slides[index].alt}` : ''}
      </span>
    </section>
  )
}
