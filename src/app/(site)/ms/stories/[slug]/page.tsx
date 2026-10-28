import { listStories } from '@/lib/data/site'
import { StoryPageView, storyMetadata } from '@/lib/views'

export const revalidate = 300

export async function generateStaticParams() {
  const stories = await listStories().catch(() => [])
  return stories.map((s) => ({ slug: s.content.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return storyMetadata((await params).slug, 'ms')
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <StoryPageView slug={slug} source="published" lang="ms" />
}
