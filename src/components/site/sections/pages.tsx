'use client'
import { useMemo, useState } from 'react'
import type {
  FounderSection,
  PageIntroSection,
  QuoteSection,
  RichTextSection,
  ServicesListSection,
  StoriesGridSection,
  TextImageSection,
} from '@/lib/content/types'
import type { SiteData } from '@/lib/data/site'
import { LongText, Paragraphs, Rich } from '@/lib/text'
import { ImageReveal } from '../../motion/ImageReveal'
import { MaskedText } from '../../motion/MaskedText'
import { Parallax } from '../../motion/Parallax'
import { Reveal } from '../../motion/Reveal'
import { SiteLink } from '../context'
import { SmartImage } from '../Media'
import { StoryCard } from './home'

export function PageIntro({ s, first }: { s: PageIntroSection; first: boolean }) {
  const Heading = first ? 'h1' : 'h2'
  if (s.layout === 'side' && s.media) {
    return (
      <section className={first ? 'pb-10 pt-32 md:pb-16 md:pt-44' : 'section-y'}>
        <div className="shell grid items-end gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7 md:pb-6">
            {s.eyebrow && <Reveal><p className="kicker mb-8">{s.eyebrow}</p></Reveal>}
            <MaskedText as={Heading} text={s.headline} onMount={first} delay={first ? 0.15 : 0} className="display display-xl text-olive-deep" />
            {s.body && (
              <Reveal delay={0.35} className="mt-10 max-w-xl md:mt-12">
                <Paragraphs text={s.body} className="lede" />
              </Reveal>
            )}
          </div>
          <div className="ml-auto w-[78%] md:col-span-5 md:col-start-8 md:w-full">
            <ImageReveal className="aspect-[4/5]" onMount={first} delay={first ? 0.3 : 0}>
              <Parallax className="h-full w-full" amount={5}>
                <SmartImage media={s.media} priority={first} sizes="(min-width: 768px) 40vw, 80vw" />
              </Parallax>
            </ImageReveal>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className={first ? 'pt-36 md:pt-52' : 'section-y'}>
      <div className="shell">
        {s.eyebrow && <Reveal><p className="kicker mb-8">{s.eyebrow}</p></Reveal>}
        <MaskedText as={Heading} text={s.headline} onMount={first} delay={first ? 0.15 : 0} className="display display-xl max-w-[18ch] text-olive-deep" />
        {s.body && (
          <Reveal delay={0.35} className="mt-10 md:ml-[42%] md:mt-14">
            <Paragraphs text={s.body} className="lede" />
          </Reveal>
        )}
      </div>
      {s.media && (
        <div className="mt-16 md:mt-24">
          <ImageReveal className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]" onMount={first} delay={first ? 0.4 : 0}>
            <Parallax className="h-full w-full" amount={7}>
              <SmartImage media={s.media} priority={first} />
            </Parallax>
          </ImageReveal>
        </div>
      )}
      {!s.media && first && <div className="h-16 md:h-20" aria-hidden />}
    </section>
  )
}

export function TextImage({ s }: { s: TextImageSection }) {
  const right = s.imageSide === 'right'
  return (
    <section className="section-y">
      <div className="shell grid items-center gap-12 md:grid-cols-12 md:gap-0">
        <div className={`md:col-span-5 ${right ? 'md:order-2 md:col-start-8' : 'md:col-start-1'}`}>
          <ImageReveal className="aspect-[4/5]">
            <SmartImage media={s.media} sizes="(min-width: 768px) 42vw, 100vw" />
          </ImageReveal>
        </div>
        <div className={`md:col-span-6 ${right ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
          {s.eyebrow && <Reveal><p className="kicker mb-8">{s.eyebrow}</p></Reveal>}
          <MaskedText text={s.headline} className="display display-md text-olive-deep" />
          <Reveal delay={0.2} className="mt-10 space-y-5">
            <Paragraphs text={s.body} className="lede" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function Founder({ s }: { s: FounderSection }) {
  return (
    <section className="section-y bg-cream">
      <div className="shell grid items-end gap-12 md:grid-cols-12">
        {s.media && (
          <div className="md:col-span-4">
            <ImageReveal className="aspect-[3/4]">
              <SmartImage media={s.media} sizes="(min-width: 768px) 33vw, 100vw" />
            </ImageReveal>
          </div>
        )}
        <div className={s.media ? 'md:col-span-7 md:col-start-6' : 'md:col-span-8'}>
          {s.eyebrow && <p className="kicker mb-8">{s.eyebrow}</p>}
          <MaskedText text={s.headline} className="display display-md text-olive-deep" />
          {(s.name || s.role) && (
            <p className="mt-6 text-[0.9375rem]"><span className="font-semibold">{s.name}</span>{s.role && <span className="text-ink-soft">, {s.role}</span>}</p>
          )}
          <Reveal delay={0.2} className="mt-8 space-y-5">
            <Paragraphs text={s.body} className="lede" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function StoriesGrid({ s, data }: { s: StoriesGridSection; data: SiteData }) {
  const tags = useMemo(() => [...new Set(data.stories.flatMap((x) => x.content.tags))].sort(), [data.stories])
  const [tag, setTag] = useState<string | null>(null)
  const list = tag ? data.stories.filter((x) => x.content.tags.includes(tag)) : data.stories
  return (
    <section className="pb-28 pt-12 md:pb-40">
      <div className="shell">
        {s.showFilters && tags.length > 1 && (
          <div className="mb-14 flex flex-wrap gap-x-6 gap-y-3" role="group" aria-label="Filter stories">
            {[null, ...tags].map((t) => (
              <button
                key={t ?? 'all'}
                type="button"
                onClick={() => setTag(t)}
                aria-pressed={tag === t}
                className={`border-b py-1.5 text-[0.875rem] transition-colors ${tag === t ? 'border-olive-deep text-olive-deep' : 'border-transparent text-ink-soft hover:text-olive-deep'}`}
              >
                {t ?? 'All stories'}
              </button>
            ))}
          </div>
        )}
        {list.length === 0 ? (
          <p className="lede">New stories are on their way.</p>
        ) : (
          <ul className="grid gap-x-10 gap-y-20 md:grid-cols-2 md:gap-y-32">
            {list.map((story, i) => (
              <li key={story.id} className={i % 2 === 1 ? 'md:mt-40' : ''}>
                <StoryCard story={story} level="h2" aspect={i % 3 === 2 ? 'aspect-[3/2]' : 'aspect-[4/5]'} sizes="(min-width: 768px) 50vw, 100vw" priority={i < 2} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function ServicesList({ s, data }: { s: ServicesListSection; data: SiteData }) {
  const services = data.services.filter((x) => x.content.kind === 'service')
  const addons = data.services.filter((x) => x.content.kind === 'addon')
  return (
    <section className="pb-28 pt-8 md:pb-40">
      <div className="shell">
        <ol className="border-t border-charcoal/15">
          {services.map((svc, i) => {
            const c = svc.content
            const flip = i % 2 === 1
            return (
              <li key={svc.id} className="grid gap-10 border-b border-charcoal/15 py-16 md:grid-cols-12 md:py-24">
                <div className={`md:col-span-5 ${flip ? 'md:order-2 md:col-start-8' : ''}`}>
                  <ImageReveal className="aspect-[4/5]">
                    <SmartImage media={c.media} sizes="(min-width: 768px) 40vw, 100vw" />
                  </ImageReveal>
                </div>
                <div className={`flex flex-col md:col-span-6 ${flip ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                  <span className="display text-2xl italic text-olive">{String(i + 1).padStart(2, '0')}</span>
                  <MaskedText text={c.name} as="h2" className="display display-md mt-4 text-olive-deep" />
                  {c.featured && <p className="mt-4 self-start bg-olive-deep px-3 py-1 text-xs text-ivory">Most requested</p>}
                  <Reveal delay={0.15} className="mt-8 space-y-5">
                    <p className="text-[1.125rem] leading-relaxed text-charcoal">{c.summary}</p>
                    <Paragraphs text={c.description} className="lede" />
                  </Reveal>
                  {c.deliverables.length > 0 && (
                    <Reveal delay={0.25} className="mt-10">
                      <p className="mb-3 text-sm font-medium text-olive-deep">What you receive</p>
                      <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
                        {c.deliverables.map((d, k) => <li key={k} className="py-3 text-[0.9375rem]">{d}</li>)}
                      </ul>
                    </Reveal>
                  )}
                  <Reveal delay={0.3} className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-12">
                    <p>
                      {c.showPrice && c.price ? (
                        <>
                          <span className="display block text-3xl text-olive-deep">{c.price}</span>
                          {c.priceNote && <span className="meta">{c.priceNote}</span>}
                        </>
                      ) : (
                        <span className="meta">Contact for pricing</span>
                      )}
                    </p>
                    <SiteLink href="/contact" className="text-link text-olive-deep">Ask about this</SiteLink>
                  </Reveal>
                </div>
              </li>
            )
          })}
        </ol>
        {addons.length > 0 && (
          <div className="mt-24 grid gap-10 md:grid-cols-12">
            <h2 className="display display-sm text-olive-deep md:col-span-4">{s.addonsHeadline}</h2>
            <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10 md:col-span-7 md:col-start-6">
              {addons.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-4 py-5">
                  <span>
                    <span className="block font-medium">{a.content.name}</span>
                    {a.content.summary && <span className="text-[0.9375rem] text-ink-soft">{a.content.summary}</span>}
                  </span>
                  <span className="meta">{a.content.showPrice && a.content.price ? a.content.price : 'Contact for pricing'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {s.footnote && <p className="lede mt-16">{s.footnote}</p>}
      </div>
    </section>
  )
}

export function RichTextBlock({ s, first }: { s: RichTextSection; first: boolean }) {
  const Heading = first ? 'h1' : 'h2'
  return (
    <section className={first ? 'pb-28 pt-36 md:pb-40 md:pt-48' : 'section-y'}>
      <div className="shell grid gap-12 md:grid-cols-12">
        <Heading className="display display-lg text-olive-deep md:col-span-4"><Rich text={s.headline} /></Heading>
        <div className="md:col-span-7 md:col-start-6">
          <LongText text={s.body} />
        </div>
      </div>
    </section>
  )
}

export function Quote({ s }: { s: QuoteSection }) {
  if (!s.text) return null
  return (
    <section className="on-dark section-y bg-olive-deep text-ivory">
      <div className="shell">
        <MaskedText as="p" text={`*${s.text.replace(/\*/g, '')}*`} className="display display-lg mx-auto max-w-[20ch] text-center" />
      </div>
    </section>
  )
}
