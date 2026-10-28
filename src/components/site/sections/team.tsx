'use client'
import type { TeamSection } from '@/lib/content/types'
import { Paragraphs } from '@/lib/text'
import { ImageReveal } from '../../motion/ImageReveal'
import { MaskedText } from '../../motion/MaskedText'
import { Reveal } from '../../motion/Reveal'
import { SmartImage } from '../Media'

/** The people behind the camera. A member appears once the owner adds their name. */
export function Team({ s }: { s: TeamSection }) {
  const members = s.members.filter((m) => m.name.trim())
  return (
    <section className="section-y bg-cream">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            {s.eyebrow && <Reveal><p className="kicker mb-5 md:mb-6">{s.eyebrow}</p></Reveal>}
            <MaskedText text={s.headline} className="display display-lg text-olive-deep" />
          </div>
          {s.body && (
            <Reveal delay={0.1} className="space-y-4 md:col-span-4 md:col-start-9">
              <Paragraphs text={s.body} className="lede" />
            </Reveal>
          )}
        </div>
        {members.length > 0 && (
          <ul className={`mt-12 grid gap-10 md:mt-20 ${members.length > 1 ? 'sm:grid-cols-2' : ''} ${members.length > 2 ? 'lg:grid-cols-3' : ''}`}>
            {members.map((p, i) => (
              <Reveal as="li" key={i} delay={i * 0.08} className={members.length === 2 && i === 1 ? 'sm:mt-24' : ''}>
                {p.photo && (
                  <ImageReveal className="mb-6 aspect-[4/5]">
                    <SmartImage media={p.photo} sizes="(min-width: 640px) 45vw, 100vw" />
                  </ImageReveal>
                )}
                <p className="display text-[clamp(1.9rem,3vw,2.6rem)] leading-tight text-olive-deep">{p.name}</p>
                {p.role && <p className="meta mt-1">{p.role}</p>}
                {p.bio && <Paragraphs text={p.bio} className="mt-4 max-w-md text-[1rem] leading-relaxed text-ink-soft" />}
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
