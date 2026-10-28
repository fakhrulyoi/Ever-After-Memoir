'use client'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeroSection, MediaRef } from '@/lib/content/types'
import { EASE } from '../../motion/MotionProvider'
import { Magnetic } from '../../motion/Magnetic'
import { MaskedText } from '../../motion/MaskedText'
import { SiteLink, useT } from '../context'
import { SmartImage } from '../Media'
import { Timecode } from '../Timecode'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * A silent video slide. The cover frame is shown straight away (and is what
 * the page measures as loaded); the video itself starts once the page is ready.
 */
function SlideVideo({ media, first, active }: { media: MediaRef; first: boolean; active: boolean }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(!first)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!first || reduce) return
    const go = () => setTimeout(() => setReady(true), 200)
    if (document.readyState === 'complete') {
      const t = go()
      return () => clearTimeout(t)
    }
    window.addEventListener('load', go, { once: true })
    return () => window.removeEventListener('load', go)
  }, [first, reduce])
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) {
      v.currentTime = 0
      v.play().catch(() => {})
    } else v.pause()
  }, [active, ready])
  const poster: MediaRef = { url: media.poster ?? '', type: 'image', alt: media.alt, width: media.width, height: media.height }
  return (
    <>
      {media.poster && <SmartImage media={poster} priority={first} sizes="(min-width: 768px) 50vw, 100vw" />}
      {ready && !reduce && (
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: playing ? 1 : 0 }}
          src={media.url}
          muted
          loop
          playsInline
          preload={first ? 'auto' : 'metadata'}
          onPlaying={() => setPlaying(true)}
          aria-hidden
          tabIndex={-1}
        />
      )}
    </>
  )
}

/**
 * Opening "reel": photos and short silent videos play one after another like
 * a story, with segmented progress bars. Tap the left or right side to move;
 * press and hold to pause. Under reduced motion the reel never advances.
 */
export function HeroReel({ s }: { s: HeroSection }) {
  const t = useT()
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
      className="on-dark relative min-h-[max(100svh,640px)] overflow-hidden bg-olive-deep text-ivory"
      aria-roledescription="carousel"
      aria-label={t('hero.photos')}
    >
      {/* Frame: full-bleed on phones, the right half on larger screens */}
      <m.div className="absolute inset-0 md:left-auto md:w-[50%] lg:w-[47%]" style={{ y: frameY }}>
        <div className="absolute inset-0 overflow-hidden">
          {slides.map((slide, i) =>
            visible.has(i) ? (
              <m.div
                key={i}
                className="absolute inset-0"
                style={{ zIndex: i === index ? 2 : 1 }}
                initial={false}
                animate={i === index || i === prev ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 0% 100%)' }}
                transition={{ duration: reduce ? 0 : 1.1, ease: EASE }}
                aria-hidden={i !== index}
              >
                <m.div
                  key={`${i}-${i === index ? index : 'x'}`}
                  className="absolute inset-0"
                  initial={{ scale: reduce ? 1 : slide.type === 'video' ? 1.06 : 1.14 }}
                  animate={{ scale: reduce ? 1 : 1.02 }}
                  transition={{ duration: reduce ? 0 : s.interval + 1.5, ease: 'linear' }}
                >
                  {slide.type === 'video' ? (
                    <SlideVideo media={slide} first={i === 0} active={i === index && inView && !reduce} />
                  ) : (
                    <SmartImage media={slide} priority={i === 0} sizes="(min-width: 768px) 50vw, 100vw" focal={i === 0 ? s.focal : undefined} />
                  )}
                </m.div>
              </m.div>
            ) : null,
          )}
          <div className="absolute inset-0 z-[3] bg-olive-deep" style={{ opacity: s.overlay * 0.6 }} aria-hidden />
          {/* Phones: a deep fade behind the words so they always read clearly */}
          <div className="absolute inset-0 z-[3] bg-gradient-to-t from-charcoal/90 via-charcoal/55 to-charcoal/15 md:inset-x-0 md:top-auto md:h-1/3 md:from-charcoal/45 md:via-transparent md:to-transparent" aria-hidden />
          <div className="absolute inset-x-0 top-0 z-[3] h-36 bg-gradient-to-b from-charcoal/50 to-transparent" aria-hidden />
        </div>

        {n > 1 && (
          <div className="absolute inset-x-4 top-[4.75rem] z-[5] flex gap-1.5 md:inset-x-6 md:top-28" aria-hidden>
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

        {n > 1 && (
          <div className="absolute inset-0 z-[4] flex" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)} onPointerCancel={() => setPaused(false)}>
            <button type="button" className="h-full w-1/3 cursor-w-resize focus-visible:outline-offset-[-6px]" aria-label={t('hero.prev')} onClick={() => goTo(index - 1)} />
            <button type="button" className="h-full flex-1 cursor-e-resize focus-visible:outline-offset-[-6px]" aria-label={t('hero.next')} onClick={() => goTo(index + 1)} />
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
        className="shell pointer-events-none relative z-10 flex min-h-[max(100svh,640px)] flex-col justify-end pb-10 pt-40 md:pb-16"
        style={{ y: contentY, opacity: fade }}
      >
        <div className="max-w-[44rem] md:max-w-[46%]">
          {s.eyebrow && (
            <p className="kicker fade-in mb-5 !text-ivory/90 md:mb-7" style={{ animationDelay: '0.3s' }}>
              {s.eyebrow}
            </p>
          )}
          <MaskedText
            as="h1"
            text={s.headline}
            onMount
            delay={0.25}
            className="display text-[clamp(3.6rem,15vw,5rem)] leading-[0.95] [text-shadow:0_2px_30px_rgba(40,41,35,0.3)] md:text-[clamp(4rem,7.6vw,9rem)]"
          />
          <div className="fade-up pointer-events-auto mt-6 flex max-w-md flex-col gap-7 md:mt-8 md:max-w-sm md:gap-8 lg:max-w-md" style={{ animationDelay: '0.5s' }}>
            {s.body && <p className="text-[1rem] leading-relaxed text-ivory/90 md:text-[1.0625rem]">{s.body}</p>}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {s.primary.label && (
                <Magnetic>
                  <SiteLink href={s.primary.href} className="btn btn-light min-h-13 bg-ivory !text-olive-deep md:bg-transparent md:!text-ivory md:hover:!text-olive-deep">
                    {s.primary.label}
                  </SiteLink>
                </Magnetic>
              )}
              {s.secondary.label && <SiteLink href={s.secondary.href} className="text-link">{s.secondary.label}</SiteLink>}
            </div>
          </div>
        </div>
        {n > 1 && (
          <p className="mt-8 flex items-center gap-3 md:hidden" aria-hidden>
            <span className="display text-base italic text-ivory/80">{pad(index + 1)} / {pad(n)}</span>
          </p>
        )}
      </m.div>
      <span className="sr-only" aria-live="polite">
        {t('hero.slide', { n: index + 1, total: n })}
        {slides[index]?.alt ? `: ${slides[index].alt}` : ''}
      </span>
    </section>
  )
}
