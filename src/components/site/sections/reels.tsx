'use client'
import { useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FilmsSection, MediaRef, Reel } from '@/lib/content/types'
import { plain } from '@/lib/text'
import { MaskedText } from '../../motion/MaskedText'
import { Reveal } from '../../motion/Reveal'
import { useIsDesktop } from '../../motion/useIsDesktop'
import { useT } from '../context'
import { IconArrow, IconMute, IconPause, IconPlay, IconSound } from '../icons'
import { VideoPlayer, posterUrl } from '../Media'
import { Modal } from '../Modal'

const pad = (n: number) => String(n).padStart(2, '0')
const coverOf = (r: Reel) => r.poster?.url ?? r.video?.poster ?? null

/** One card in the row: a silent preview that plays only while it is in view (phones) or hovered (desktop). */
function ReelCard({ reel, i, total, onOpen }: { reel: Reel; i: number; total: number; onOpen: () => void }) {
  const t = useT()
  const desktop = useIsDesktop()
  const reduce = useReducedMotion()
  const box = useRef<HTMLButtonElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [active, setActive] = useState(false)
  const [hover, setHover] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '200px' })
    const mainIo = new IntersectionObserver(([e]) => setActive(e.intersectionRatio > 0.7), { threshold: [0, 0.7, 1] })
    nearIo.observe(el)
    mainIo.observe(el)
    return () => {
      nearIo.disconnect()
      mainIo.disconnect()
    }
  }, [])

  const shouldPlay = !reduce && near && (desktop ? hover : active)
  useEffect(() => {
    const v = video.current
    if (!v) return
    if (shouldPlay) v.play().catch(() => {})
    else v.pause()
  }, [shouldPlay])

  const cover = coverOf(reel)
  return (
    <button
      ref={box}
      type="button"
      onClick={onOpen}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="group block w-full text-left"
      aria-label={`${t('reels.watch')}${reel.caption ? `: ${reel.caption}` : ''} (${t('reels.of', { n: i + 1, total })})`}
      data-cursor={t('reels.watch')}
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-[2px] bg-charcoal">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl(cover, 640)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {near && reel.video && !reduce && (
          <video
            ref={video}
            src={reel.video.url}
            muted
            loop
            playsInline
            preload="none"
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: playing ? 1 : 0 }}
            aria-hidden
            tabIndex={-1}
          />
        )}
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/70 to-transparent" aria-hidden />
        <span className="absolute left-3 top-3 text-[0.8125rem] tabular-nums text-ivory/85" aria-hidden>
          {pad(i + 1)}
        </span>
        <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/70 bg-charcoal/20 text-ivory backdrop-blur-[2px] transition-transform duration-500 group-hover:scale-110" aria-hidden>
          <IconPlay size={15} />
        </span>
        {reel.caption && (
          <span className="display absolute bottom-3.5 left-3 right-16 text-[1.35rem] italic leading-tight text-ivory" aria-hidden>
            {reel.caption}
          </span>
        )}
      </span>
    </button>
  )
}

/** Full-screen viewer, like stories: sound on, tap the sides to move, next reel plays when one ends. */
function ReelViewer({ reels, start, onClose }: { reels: Reel[]; start: number | null; onClose: () => void }) {
  const t = useT()
  const [i, setI] = useState(start ?? 0)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const video = useRef<HTMLVideoElement>(null)
  const open = start !== null
  useEffect(() => {
    if (start !== null) {
      setI(start)
      setPaused(false)
    }
  }, [start])
  const go = useCallback(
    (d: number) => {
      const next = i + d
      if (next < 0) return
      if (next >= reels.length) return onClose()
      setI(next)
      setProgress(0)
      setPaused(false)
    },
    [i, reels.length, onClose],
  )
  useEffect(() => {
    const v = video.current
    if (!v || !open) return
    v.muted = muted
    if (paused) v.pause()
    else v.play().catch(() => {
      // Browsers may refuse sound without a fresh tap: fall back to muted
      v.muted = true
      setMuted(true)
      v.play().catch(() => {})
    })
  }, [i, open, paused, muted])
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    },
    [go],
  )
  const reel = reels[i]
  return (
    <Modal open={open} onClose={onClose} label={t('reels.label')} onKey={onKey}>
      {reel?.video && (
        <div className="flex flex-1 items-center justify-center bg-charcoal md:p-6">
          <div className="relative h-full max-h-[100svh] w-full overflow-hidden md:h-[92svh] md:w-auto md:rounded-[2px]" style={{ aspectRatio: '9 / 16' }}>
            <video
              key={reel.video.url}
              ref={video}
              src={reel.video.url}
              poster={posterUrl(coverOf(reel), 828)}
              playsInline
              autoPlay
              preload="auto"
              onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
              onEnded={() => go(1)}
              className="absolute inset-0 h-full w-full object-contain md:object-cover"
              aria-label={reel.caption || t('reels.label')}
            />
            {/* Progress, one bar per reel */}
            <div className="absolute inset-x-3 top-3 z-10 flex gap-1" aria-hidden>
              {reels.map((_, k) => (
                <span key={k} className="h-[2px] flex-1 overflow-hidden rounded-full bg-ivory/30">
                  <span className="block h-full bg-ivory" style={{ width: k < i ? '100%' : k === i ? `${progress * 100}%` : '0%' }} />
                </span>
              ))}
            </div>
            {/* Tap zones */}
            <button type="button" className="absolute inset-y-0 left-0 z-[5] w-1/3" onClick={() => go(-1)} aria-label={t('reels.prev')} />
            <button type="button" className="absolute inset-y-0 right-0 z-[5] w-2/3" onClick={() => go(1)} aria-label={t('reels.next')} />
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 bg-gradient-to-t from-charcoal/80 to-transparent p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16">
              <div className="min-w-0">
                <p className="text-[0.8125rem] tabular-nums text-ivory/70">{t('reels.of', { n: i + 1, total: reels.length })}</p>
                {reel.caption && <p className="display mt-1 text-[1.75rem] italic leading-tight text-ivory">{reel.caption}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setPaused((p) => !p)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/40" aria-label={paused ? t('reels.play') : t('reels.pause')}>
                  {paused ? <IconPlay size={16} /> : <IconPause size={16} />}
                </button>
                <button type="button" onClick={() => setMuted((v) => !v)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/40" aria-label={muted ? t('reels.unmute') : t('reels.mute')}>
                  {muted ? <IconMute size={18} /> : <IconSound size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function Films({ s }: { s: FilmsSection }) {
  const t = useT()
  const reels = s.reels.filter((r) => r.video)
  const [open, setOpen] = useState<number | null>(null)
  const row = useRef<HTMLUListElement>(null)
  const [at, setAt] = useState(0)
  const onScroll = () => {
    const el = row.current
    if (!el) return
    const card = el.querySelector('li')
    if (!card) return
    setAt(Math.round(el.scrollLeft / (card.getBoundingClientRect().width + 16)))
  }
  const nudge = (d: number) => {
    const el = row.current
    const card = el?.querySelector('li')
    if (!el || !card) return
    el.scrollBy({ left: d * (card.getBoundingClientRect().width + 24) * 2, behavior: 'smooth' })
  }
  return (
    <section id={s.key} className="on-dark section-y scroll-mt-16 overflow-hidden bg-olive-deep text-ivory">
      <div className="shell">
        <div className="mb-10 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-8">
          <div className="md:col-span-7">
            {s.eyebrow && <Reveal><p className="kicker mb-5 md:mb-6">{s.eyebrow}</p></Reveal>}
            <MaskedText text={s.headline} className="display display-lg" />
          </div>
          <Reveal className="md:col-span-4 md:col-start-9" delay={0.1}>
            {s.body && <p className="lede">{s.body}</p>}
          </Reveal>
        </div>
      </div>

      {reels.length > 0 && (
        <>
          <ul
            ref={row}
            onScroll={onScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1rem,4.5vw,4rem)] scroll-px-[clamp(1rem,4.5vw,4rem)] pb-2 md:gap-6"
          >
            {reels.map((r, i) => (
              <li key={i} className="w-[64vw] max-w-[300px] shrink-0 snap-start sm:w-[40vw] md:w-[23vw] md:max-w-[340px]">
                <ReelCard reel={r} i={i} total={reels.length} onOpen={() => setOpen(i)} />
              </li>
            ))}
            <li aria-hidden className="w-px shrink-0" />
          </ul>
          <div className="shell mt-6 flex items-center justify-between gap-6">
            <p className="text-[0.9375rem] text-taupe">
              <span className="tabular-nums text-ivory">{pad(Math.min(at + 1, reels.length))}</span> / {pad(reels.length)}
              <span className="ml-4 hidden sm:inline">{t('reels.tapSound')}</span>
              <span className="ml-3 sm:hidden">{t('stories.swipe')}</span>
            </p>
            <div className="hidden gap-2 md:flex">
              <button type="button" onClick={() => nudge(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-ivory/30 transition-colors hover:bg-ivory hover:text-olive-deep" aria-label={t('reels.prev')}>
                <IconArrow dir="left" size={18} />
              </button>
              <button type="button" onClick={() => nudge(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-ivory/30 transition-colors hover:bg-ivory hover:text-olive-deep" aria-label={t('reels.next')}>
                <IconArrow size={18} />
              </button>
            </div>
          </div>
        </>
      )}

      {s.film && (
        <div className="shell mt-16 md:mt-24">
          <VideoPlayer media={s.film} poster={s.poster} title={plain(s.headline)} aspect={aspectOf(s.film)} />
          {s.filmCaption && <p className="meta mt-4">{s.filmCaption}</p>}
        </div>
      )}

      <ReelViewer reels={reels} start={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function aspectOf(m: MediaRef) {
  return m.width && m.height ? `${m.width} / ${m.height}` : '16 / 9'
}
