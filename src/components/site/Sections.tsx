'use client'
import { useEffect, useMemo, useState } from 'react'
import { localize } from '@/lib/i18n'
import { useSite } from './context'
import { Team } from './sections/team'
import type { PageContent, Section } from '@/lib/content/types'
import type { SiteData } from '@/lib/data/site'
import { Cta, FeaturedStories, Films, Hero, Marquee, Philosophy, ServicesPreview, Social, Testimonials } from './sections/home'
import { Founder, PageIntro, Quote, RichTextBlock, ServicesList, StoriesGrid, TextImage } from './sections/pages'
import { InquiryForm } from './InquiryForm'
import { BookingCalendar } from './BookingCalendar'
import { Collage, ImageBreak } from './sections/editorial'

function SectionView({ s, data, first }: { s: Section; data: SiteData; first: boolean }) {
  switch (s.type) {
    case 'hero': return <Hero s={s} />
    case 'philosophy': return <Philosophy s={s} />
    case 'marquee': return <Marquee s={s} />
    case 'featured_stories': return <FeaturedStories s={s} data={data} />
    case 'films': return <Films s={s} />
    case 'services_preview': return <ServicesPreview s={s} data={data} />
    case 'testimonials': return <Testimonials s={s} data={data} />
    case 'social': return <Social s={s} data={data} />
    case 'cta': return <Cta s={s} />
    case 'page_intro': return <PageIntro s={s} first={first} />
    case 'text_image': return <TextImage s={s} />
    case 'founder': return <Founder s={s} />
    case 'stories_grid': return <StoriesGrid s={s} data={data} />
    case 'services_list': return <ServicesList s={s} data={data} />
    case 'inquiry': return <InquiryForm s={s} data={data} first={first} />
    case 'booking': return <BookingCalendar s={s} data={data} first={first} />
    case 'image_break': return <ImageBreak s={s} />
    case 'collage': return <Collage s={s} />
    case 'rich_text': return <RichTextBlock s={s} first={first} />
    case 'quote': return <Quote s={s} />
    case 'team': return <Team s={s} />
    default: return null
  }
}

/**
 * Renders a page's visible sections in order.
 * With `live`, the admin editor can stream unsaved changes into this preview.
 */
export function Sections({ page, data, live }: { page: PageContent; data: SiteData; live?: string }) {
  const [content, setContent] = useState(page)
  useEffect(() => setContent(page), [page])
  useEffect(() => {
    if (!live) return
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const msg = e.data as { type?: string; id?: string; content?: PageContent }
      if (msg?.type === 'eam:live-page' && msg.id === live && msg.content?.sections) setContent(msg.content)
    }
    window.addEventListener('message', onMessage)
    window.parent?.postMessage({ type: 'eam:preview-ready', id: live }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [live])
  const { lang } = useSite()
  const shown = useMemo(() => localize(content, lang), [content, lang])
  const visible = shown.sections.filter((s) => s.visible)
  return (
    <>
      {visible.map((s, i) => (
        <SectionView key={s.key} s={s} data={data} first={i === 0} />
      ))}
    </>
  )
}
