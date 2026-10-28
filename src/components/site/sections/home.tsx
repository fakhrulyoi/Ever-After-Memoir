'use client'
import { m, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import type {
  CtaSection,
  FeaturedStoriesSection,
  FilmsSection,
  HeroSection,
  MarqueeSection,
  PhilosophySection,
  Published,
  Reel,
  ServicesPreviewSection,
  SocialSection,
  StoryContent,
  TestimonialsSection,
} from '@/lib/content/types'
import type { SiteData } from '@/lib/data/site'
import { Paragraphs, plain } from '@/lib/text'
import { EASE } from '../../motion/MotionProvider'
import { ImageReveal } from '../../motion/ImageReveal'
import { MaskedText } from '../../motion/MaskedText'
import { Magnetic } from '../../motion/Magnetic'
import { Parallax } from '../../motion/Parallax'
import { Reveal } from '../../motion/Reveal'
import { useIsDesktop } from '../../motion/useIsDesktop'
import { SiteLink, useSite } from '../context'
import { IconInstagram, IconPlay, IconTikTok } from '../icons'
import { LoopVideo, SmartImage, VideoPlayer } from '../Media'
import { Modal } from '../Modal'
import { Timecode } from '../Timecode'

// ---------------------------------------------------------------------------
export function Hero({ s }: { s: HeroSection }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  return (
    <section ref={ref} className="on-dark relative flex min-h-[max(100svh,640px)] items-end overflow-hidden bg-olive-deep text-ivory">
      <m.div className="absolute inset-0" style={{ y }}>
        <m.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 2.6, ease: EASE }}
        >
          {s.video ? (
            <>
              <SmartImage media={s.media ?? { url: s.video.poster ?? '', type: 'image' }} priority focal={s.focal} alt="" />
              <LoopVideo media={s.video} focal={s.focal} defer noPoster />
            </>
          ) : (
            <SmartImage media={s.media} priority focal={s.focal} />
          )}
        </m.div>
      </m.div>
      <div className="absolute inset-0 bg-olive-deep" style={{ opacity: s.overlay }} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/55 to-transparent" aria-hidden />

      <m.div className="shell relative z-10 grid w-full gap-10 pb-12 pt-36 md:grid-cols-12 md:pb-16" style={{ opacity: fade }}>
        <div className="md:col-span-9">
          {s.eyebrow && (
            <p className="kicker fade-in mb-7 !text-ivory/85" style={{ animationDelay: '0.4s' }}>
              {s.eyebrow}
            </p>
          )}
          <MaskedText as="h1" text={s.headline} onMount delay={0.35} className="display display-xl" />
        </div>
        <div className="fade-up flex flex-col gap-8 md:col-span-5 md:col-start-1 lg:col-span-4" style={{ animationDelay: '0.6s' }}>
          {s.body && <p className="lede">{s.body}</p>}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {s.primary.label && (
              <Magnetic>
                <SiteLink href={s.primary.href} className="btn btn-light">{s.primary.label}</SiteLink>
              </Magnetic>
            )}
            {s.secondary.label && (
              <SiteLink href={s.secondary.href} className="text-link">{s.secondary.label}</SiteLink>
            )}
          </div>
        </div>
        <div className="hidden items-end justify-end gap-8 self-end md:col-span-4 md:col-start-9 md:flex lg:col-span-3 lg:col-start-10">
          {s.showTimecode && <Timecode className="text-ivory/80" />}
          <span className="flex flex-col items-center gap-3 text-[0.6875rem] tracking-[0.14em] text-ivory/80" aria-hidden>
            <span className="relative block h-14 w-px overflow-hidden bg-ivory/25">
              <span className="scroll-cue-dot absolute left-0 top-0 block h-4 w-px bg-ivory" />
            </span>
            Scroll
          </span>
        </div>
      </m.div>
    </section>
  )
}

// ---------------------------------------------------------------------------
export function Philosophy({ s }: { s: PhilosophySection }) {
  const left = s.imageSide === 'left'
  return (
    <section className="section-y">
      <div className="shell grid items-center gap-12 md:grid-cols-12 md:gap-0">
        <div className={`md:col-span-6 ${left ? 'md:col-start-1' : 'md:order-2 md:col-start-7'}`}>
          <ImageReveal className="aspect-[4/5]">
            <Parallax className="h-full w-full" amount={6}>
              <SmartImage media={s.media} sizes="(min-width: 768px) 50vw, 100vw" />
            </Parallax>
          </ImageReveal>
        </div>
        <div className={`relative md:col-span-6 ${left ? 'md:col-start-7 md:pl-[8%]' : 'md:order-1 md:col-start-1 md:pr-[8%]'}`}>
          {s.eyebrow && <Reveal><p className="kicker mb-8">{s.eyebrow}</p></Reveal>}
          <MaskedText
            text={s.headline}
            className={`display display-lg text-olive-deep ${left ? 'md:-ml-[12%]' : 'md:-mr-[12%]'} relative z-10`}
          />
          <Reveal delay={0.2} className="mt-10 space-y-5">
            <Paragraphs text={s.body} className="lede" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
export function Marquee({ s }: { s: MarqueeSection }) {
  if (!s.words.length) return null
  const row = [...s.words, ...s.words]
  return (
    <section className="marquee overflow-hidden border-y border-charcoal/10 py-7 md:py-10" aria-label={s.words.join(', ')}>
      <div className="marquee-track" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center">
                <span className="display whitespace-nowrap px-8 text-[clamp(2rem,4.5vw,4rem)] italic text-olive md:px-12">{w}</span>
                <span className="h-2 w-2 rounded-full bg-sage" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
function SampleTag({ show, dark }: { show: boolean; dark?: boolean }) {
  if (!show) return null
  return (
    <span className={`absolute left-3 top-3 z-10 px-2 py-1 text-[0.6875rem] font-medium ${dark ? 'bg-charcoal/70 text-ivory' : 'bg-ivory/85 text-olive-deep'}`}>
      Sample
    </span>
  )
}

const FEATURE_LAYOUT = [
  { box: 'md:col-span-7', aspect: 'aspect-[4/5]' },
  { box: 'md:col-span-4 md:col-start-9 md:mt-48', aspect: 'aspect-[3/4]' },
  { box: 'md:col-span-5 md:col-start-2 md:-mt-24', aspect: 'aspect-[3/2]' },
  { box: 'md:col-span-5 md:col-start-8 md:mt-24', aspect: 'aspect-[4/5]' },
]

export function StoryCard({
  story,
  aspect,
  sizes,
  priority,
  level = 'h3',
}: {
  story: Published<StoryContent>
  aspect: string
  sizes: string
  priority?: boolean
  level?: 'h2' | 'h3'
}) {
  const Title = level
  const s = story.content
  const meta = [s.location, s.tags[0]].filter(Boolean).join(', ')
  return (
    <SiteLink href={`/stories/${s.slug}`} className="group block">
      <div data-cursor="View" className="relative">
        <SampleTag show={s.isSample} />
        <ImageReveal className={aspect}>
          <div className="absolute inset-0 transition-transform duration-[1.6s] ease-[var(--ease-film)] group-hover:scale-[1.04]">
            <SmartImage media={s.cover} sizes={sizes} priority={priority} />
          </div>
        </ImageReveal>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <Title className="display text-[clamp(1.6rem,2.4vw,2.25rem)] leading-tight text-olive-deep transition-[font-style] group-hover:italic">
          {s.title}
        </Title>
        {meta && <p className="meta shrink-0">{meta}</p>}
      </div>
      {s.excerpt && <p className="mt-2 max-w-md text-[0.9375rem] text-ink-soft">{s.excerpt}</p>}
    </SiteLink>
  )
}

export function FeaturedStories({ s, data }: { s: FeaturedStoriesSection; data: SiteData }) {
  const pool = data.stories
  const chosen = s.storyIds.length
    ? s.storyIds.map((id) => pool.find((p) => p.id === id)).filter((x): x is Published<StoryContent> => !!x)
    : pool.filter((p) => p.content.featured)
  const stories = (chosen.length ? chosen : pool).slice(0, 4)
  if (!stories.length) return null
  return (
    <section className="section-y">
      <div className="shell">
        <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            {s.eyebrow && <Reveal><p className="kicker mb-6">{s.eyebrow}</p></Reveal>}
            <MaskedText text={s.headline} className="display display-lg text-olive-deep" />
          </div>
          <Reveal className="flex flex-col items-start gap-6 md:col-span-4 md:col-start-9" delay={0.15}>
            {s.body && <p className="lede">{s.body}</p>}
            {s.link.label && <SiteLink href={s.link.href} className="text-link text-olive-deep">{s.link.label}</SiteLink>}
          </Reveal>
        </div>
        <div className="grid gap-16 md:grid-cols-12 md:gap-x-0 md:gap-y-28">
          {stories.map((story, i) => {
            const l = FEATURE_LAYOUT[i % FEATURE_LAYOUT.length]
            return (
              <div key={story.id} className={l.box}>
                <StoryCard story={story} aspect={l.aspect} sizes="(min-width: 768px) 55vw, 100vw" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
export function Films({ s }: { s: FilmsSection }) {
  const [open, setOpen] = useState<Reel | null>(null)
  const reels = s.reels.filter((r) => r.video)
  return (
    <section className="on-dark section-y overflow-hidden bg-olive-deep text-ivory">
      <div className="shell">
        <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            {s.eyebrow && <Reveal><p className="kicker mb-6">{s.eyebrow}</p></Reveal>}
            <MaskedText text={s.headline} className="display display-lg" />
          </div>
          <Reveal className="md:col-span-4 md:col-start-9" delay={0.15}>
            <p className="lede">{s.body}</p>
          </Reveal>
        </div>
        {s.film && (
          <Reveal y={40}>
            <VideoPlayer media={s.film} poster={s.poster} title={plain(s.headline)} aspect={s.film.width && s.film.height ? `${s.film.width} / ${s.film.height}` : '16 / 9'} />
            {s.filmCaption && <p className="meta mt-4">{s.filmCaption}</p>}
          </Reveal>
        )}
      </div>
      {reels.length > 0 && (
        <div className="mt-20 md:mt-28">
          <div className="shell mb-6 flex items-center justify-between">
            <p className="text-sm text-taupe">Little reels</p>
            <p className="meta hidden md:block">Tap to watch with sound</p>
          </div>
          <ul className="no-scrollbar shell flex snap-x snap-mandatory scroll-px-[clamp(1rem,4.5vw,4rem)] gap-4 overflow-x-auto pb-2 md:gap-6">
            {reels.map((r, i) => (
              <li key={i} className="w-[62vw] max-w-[320px] shrink-0 snap-start sm:w-[38vw] md:w-[24vw]">
                <button
                  type="button"
                  className="group block w-full text-left"
                  onClick={() => setOpen(r)}
                  aria-label={`Watch reel${r.caption ? `: ${r.caption}` : ''}`}
                  data-cursor="Play"
                >
                  <div className="relative aspect-[9/16] overflow-hidden bg-charcoal">
                    <LoopVideo media={r.video!} poster={r.poster?.url} className="transition-transform duration-[1.4s] ease-[var(--ease-film)] group-hover:scale-105" />
                    <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-ivory/70">
                      <IconPlay size={14} />
                    </span>
                  </div>
                  {r.caption && <p className="mt-3 text-[0.9375rem] text-ivory/85">{r.caption}</p>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} label="Reel">
        {open?.video && (
          <div className="flex flex-1 items-center justify-center p-4 pt-16">
            <div className="h-full max-h-[85svh] w-auto" style={{ aspectRatio: '9 / 16' }}>
              <VideoPlayer media={open.video} poster={open.poster} title={open.caption || 'Reel'} aspect="9 / 16" />
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

// ---------------------------------------------------------------------------
export function ServicesPreview({ s, data }: { s: ServicesPreviewSection; data: SiteData }) {
  const services = data.services.filter((x) => x.content.kind === 'service')
  const desktop = useIsDesktop()
  const [hover, setHover] = useState<number | null>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 160, damping: 22 })
  const y = useSpring(useMotionValue(0), { stiffness: 160, damping: 22 })
  if (!services.length) return null
  return (
    <section className="section-y bg-cream">
      <div className="shell">
        <div className="mb-14 md:mb-20">
          {s.eyebrow && <Reveal><p className="kicker mb-6">{s.eyebrow}</p></Reveal>}
          <MaskedText text={s.headline} className="display display-lg text-olive-deep" />
        </div>
        <ul
          className="relative border-t border-charcoal/15"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            x.set(e.clientX - r.left)
            y.set(e.clientY - r.top)
          }}
          onPointerLeave={() => setHover(null)}
        >
          {services.map((svc, i) => (
            <li key={svc.id} className="border-b border-charcoal/15" onPointerEnter={() => setHover(i)}>
              <SiteLink href={s.link.href || '/services'} className="group grid items-baseline gap-3 py-9 md:grid-cols-12 md:py-12">
                <span className="display text-2xl italic text-olive md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                <span className="display text-[clamp(2rem,4.2vw,4rem)] leading-none text-olive-deep transition-transform duration-700 ease-[var(--ease-film)] group-hover:translate-x-3 md:col-span-6">
                  {svc.content.name}
                </span>
                <span className="max-w-sm text-[0.9375rem] text-ink-soft md:col-span-4 md:col-start-9">{svc.content.summary}</span>
              </SiteLink>
            </li>
          ))}
          {desktop && (
            <m.div
              className="pointer-events-none absolute left-0 top-0 z-10 hidden aspect-[4/5] w-56 overflow-hidden md:block"
              style={{ x, y, translateX: '-50%', translateY: '-50%' }}
              animate={{ opacity: hover === null ? 0 : 1, scale: hover === null ? 0.85 : 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              aria-hidden
            >
              {services.map((svc, i) => (
                <div key={svc.id} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: hover === i ? 1 : 0 }}>
                  <SmartImage media={svc.content.media} sizes="224px" />
                </div>
              ))}
            </m.div>
          )}
        </ul>
        {s.link.label && (
          <Reveal className="mt-12">
            <SiteLink href={s.link.href} className="text-link text-olive-deep">{s.link.label}</SiteLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
function ScrollWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  // 0.58 keeps even the faded words at 3:1 contrast (WCAG AA for large text)
  const opacity = useTransform(progress, range, [0.58, 1])
  return <m.span style={{ opacity }}>{word} </m.span>
}

export function Testimonials({ s, data }: { s: TestimonialsSection; data: SiteData }) {
  // No approved testimonials yet: show the brand manifesto instead.
  return data.testimonials.length ? <TestimonialList s={s} data={data} /> : <Manifesto text={s.manifesto} />
}

function TestimonialList({ s, data }: { s: TestimonialsSection; data: SiteData }) {
  return (
    <section className="section-y">
      <div className="shell">
        <div className="mb-14">
          {s.eyebrow && <p className="kicker mb-6">{s.eyebrow}</p>}
          <MaskedText text={s.headline} className="display display-md text-olive-deep" />
        </div>
        <ul className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {data.testimonials.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 2) * 0.12} className={i % 2 ? 'md:mt-24' : ''}>
              <figure>
                <blockquote className="display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.2] text-olive-deep">
                  <span aria-hidden className="text-sage">“</span>{t.content.text}<span aria-hidden className="text-sage">”</span>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  {t.content.photo && (
                    <span className="relative h-12 w-12 overflow-hidden rounded-full">
                      <SmartImage media={t.content.photo} sizes="48px" />
                    </span>
                  )}
                  <span>
                    <span className="block text-[0.9375rem] font-medium">{t.content.displayName}</span>
                    <span className="meta">{[t.content.weddingDate, t.content.location].filter(Boolean).join(', ')}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Manifesto({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <section className="section-y">
      <div ref={ref} className="shell">
        {words.length > 0 && (
          <p className="display mx-auto max-w-[22ch] text-center text-[clamp(2rem,4.6vw,4.5rem)] leading-[1.12] text-olive-deep">
            <span className="sr-only">{text}</span>
            <span aria-hidden>
              {words.map((w, i) => (
                <ScrollWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 2) / words.length)]} />
              ))}
            </span>
          </p>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
export function Social({ s, data }: { s: SocialSection; data: SiteData }) {
  const { settings } = useSite()
  const items = data.social.slice(0, 12)
  return (
    <section className="section-y">
      <div className="shell">
        <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            {s.eyebrow && <Reveal><p className="kicker mb-6">{s.eyebrow}</p></Reveal>}
            <MaskedText text={s.headline} className="display display-md text-olive-deep" />
            {s.body && <Reveal delay={0.1}><p className="lede mt-6">{s.body}</p></Reveal>}
          </div>
          <Reveal className="flex gap-4" delay={0.2}>
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark min-h-12 px-5">
                <IconInstagram size={16} /> Instagram
              </a>
            )}
            {settings.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark min-h-12 px-5">
                <IconTikTok size={16} /> TikTok
              </a>
            )}
          </Reveal>
        </div>
        {items.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((it, i) => (
              <Reveal as="li" key={it.id} delay={(i % 6) * 0.06}>
                <a
                  href={it.content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-[4/5] overflow-hidden bg-cream"
                  aria-label={`${it.content.caption || 'View post'} (opens ${it.content.platform === 'tiktok' ? 'TikTok' : it.content.platform === 'instagram' ? 'Instagram' : 'link'})`}
                >
                  <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-film)] group-hover:scale-105">
                    <SmartImage media={it.content.preview} sizes="(min-width: 1024px) 16vw, 50vw" />
                  </div>
                  <span className="on-dark absolute inset-0 flex flex-col justify-end bg-olive-deep/0 p-4 text-ivory opacity-0 transition-all duration-500 group-hover:bg-olive-deep/55 group-hover:opacity-100 group-focus-visible:bg-olive-deep/55 group-focus-visible:opacity-100">
                    {it.content.platform === 'tiktok' ? <IconTikTok size={18} /> : <IconInstagram size={18} />}
                    {it.content.caption && <span className="mt-2 text-sm">{it.content.caption}</span>}
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
export function Cta({ s }: { s: CtaSection }) {
  return (
    <section className="section-y relative overflow-hidden bg-cream">
      <div className="shell flex flex-col items-center text-center">
        <MaskedText text={s.headline} className="display display-xl text-olive-deep" />
        {s.body && <Reveal delay={0.25}><p className="lede mx-auto mt-8 text-center">{s.body}</p></Reveal>}
        {s.link.label && (
          <Reveal delay={0.35} className="mt-12">
            <Magnetic>
              <SiteLink href={s.link.href} className="btn btn-solid">
                {s.link.label}
              </SiteLink>
            </Magnetic>
          </Reveal>
        )}
      </div>
    </section>
  )
}

