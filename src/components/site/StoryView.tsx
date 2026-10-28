'use client'
import { m, useScroll, useTransform } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import type { GalleryItem, MediaRef, Published, StoryContent } from '@/lib/content/types'
import { Paragraphs, formatDate } from '@/lib/text'
import { EASE } from '../motion/MotionProvider'
import { ImageReveal } from '../motion/ImageReveal'
import { MaskedText } from '../motion/MaskedText'
import { Reveal } from '../motion/Reveal'
import { SiteLink } from './context'
import { Lightbox, type LightboxItem } from './Lightbox'
import { SmartImage, VideoPlayer } from './Media'

function Tile({ item, i, sizes, title, onOpen }: { item: GalleryItem; i: number; sizes: string; title: string; onOpen: (i: number) => void }) {
  const media = item.media!
  return (
    <figure>
      {media.type === 'video' ? (
        <Reveal y={30}>
          <VideoPlayer media={media} title={item.caption || `${title} film`} aspect={aspectOf(media)} />
        </Reveal>
      ) : (
        <button type="button" onClick={() => onOpen(i)} className="block w-full" data-cursor="View" aria-label={`Open image${item.caption ? `: ${item.caption}` : ''}`}>
          <ImageReveal className="w-full" style={{ aspectRatio: aspectOf(media) }}>
            <SmartImage media={media} sizes={sizes} />
          </ImageReveal>
        </button>
      )}
      {item.caption && <figcaption className="meta mt-3">{item.caption}</figcaption>}
    </figure>
  )
}

type Row = { kind: 'full' | 'offset'; item: GalleryItem; i: number } | { kind: 'pair'; items: { item: GalleryItem; i: number }[] }

/** Group consecutive "half" items into pairs. */
function rows(gallery: GalleryItem[]): Row[] {
  const out: Row[] = []
  let pair: { item: GalleryItem; i: number }[] = []
  gallery.forEach((item, i) => {
    if (!item.media) return
    if (item.layout === 'half') {
      pair.push({ item, i })
      if (pair.length === 2) { out.push({ kind: 'pair', items: pair }); pair = [] }
      return
    }
    if (pair.length) { out.push({ kind: 'pair', items: pair }); pair = [] }
    out.push({ kind: item.layout, item, i })
  })
  if (pair.length) out.push({ kind: 'pair', items: pair })
  return out
}

function aspectOf(m: MediaRef) {
  return m.width && m.height ? `${m.width} / ${m.height}` : m.type === 'video' ? '9 / 16' : '4 / 5'
}

export function StoryView({ story, next }: { story: Published<StoryContent>; next: Published<StoryContent> | null }) {
  const s = story.content
  const [open, setOpen] = useState<number | null>(null)
  const cover = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: cover, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])

  const images = useMemo(
    () => s.gallery.map((g, i) => ({ g, i })).filter(({ g }) => g.media?.type === 'image'),
    [s.gallery],
  )
  const lightbox: LightboxItem[] = images.map(({ g }) => ({ media: g.media!, caption: g.caption }))
  const openAt = (galleryIndex: number) => setOpen(images.findIndex((x) => x.i === galleryIndex))

  const meta = [
    s.weddingDate && formatDate(s.weddingDate),
    s.venue,
    s.location,
  ].filter(Boolean) as string[]

  return (
    <article>
      <header ref={cover} className="on-dark relative flex min-h-[88svh] items-end overflow-hidden bg-olive-deep text-ivory">
        <m.div className="absolute inset-0" style={{ y }}>
          <m.div className="absolute inset-0" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }}>
            <SmartImage media={s.cover} priority />
          </m.div>
        </m.div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-transparent" aria-hidden />
        <div className="shell relative z-10 pb-12 pt-40 md:pb-16">
          {s.isSample && <p className="mb-6 inline-block bg-ivory/85 px-2 py-1 text-xs text-olive-deep">Sample story</p>}
          <MaskedText as="h1" text={s.title} onMount delay={0.2} className="display display-xl max-w-[16ch]" />
          {meta.length > 0 && (
            <m.ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[0.9375rem] text-ivory/85" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}>
              {meta.map((x) => <li key={x}>{x}</li>)}
            </m.ul>
          )}
        </div>
      </header>

      <div className="shell grid gap-10 py-20 md:grid-cols-12 md:py-32">
        {s.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 self-start md:col-span-3">
            {s.tags.map((t) => <li key={t} className="border border-charcoal/15 px-3 py-1 text-xs text-ink-soft">{t}</li>)}
          </ul>
        )}
        <Reveal className="space-y-6 md:col-span-7 md:col-start-5">
          {s.excerpt && <p className="display display-sm text-olive-deep">{s.excerpt}</p>}
          <Paragraphs text={s.description} className="lede max-w-2xl" />
        </Reveal>
      </div>

      <div className="shell space-y-16 pb-28 md:space-y-32 md:pb-40">
        {rows(s.gallery).map((row, k) =>
          row.kind === 'pair' ? (
            <div key={k} className="grid gap-6 md:grid-cols-12 md:gap-8">
              {row.items.map(({ item, i }, j) => (
                <div key={i} className={j === 0 ? 'md:col-span-6' : 'md:col-span-5 md:col-start-8 md:mt-32'}>
                  <Tile title={s.title} onOpen={openAt} item={item} i={i} sizes="(min-width: 768px) 45vw, 100vw" />
                </div>
              ))}
            </div>
          ) : row.kind === 'offset' ? (
            <div key={k} className="grid md:grid-cols-12">
              <div className={k % 2 ? 'md:col-span-5 md:col-start-2' : 'md:col-span-5 md:col-start-7'}>
                <Tile title={s.title} onOpen={openAt} item={row.item} i={row.i} sizes="(min-width: 768px) 40vw, 100vw" />
              </div>
            </div>
          ) : (
            <div key={k}>
              <Tile title={s.title} onOpen={openAt} item={row.item} i={row.i} sizes="100vw" />
            </div>
          ),
        )}
      </div>

      {next && next.id !== story.id && (
        <SiteLink href={`/stories/${next.content.slug}`} className="on-dark group relative block overflow-hidden bg-olive-deep text-ivory">
          <div className="absolute inset-0 opacity-40 transition-opacity duration-1000 group-hover:opacity-60">
            <SmartImage media={next.content.cover} sizes="100vw" />
          </div>
          <div className="shell relative flex min-h-[60svh] flex-col justify-end py-16">
            <p className="kicker mb-6">Next story</p>
            <p className="display display-xl transition-transform duration-1000 ease-[var(--ease-film)] group-hover:translate-x-4">{next.content.title}</p>
          </div>
        </SiteLink>
      )}

      <Lightbox items={lightbox} index={open !== null && open >= 0 ? open : null} onChange={setOpen} onClose={() => setOpen(null)} />
    </article>
  )
}
