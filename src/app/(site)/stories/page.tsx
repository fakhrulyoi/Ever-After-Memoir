import { PageView, pageMetadata } from '@/lib/views'

export const revalidate = 300

export function generateMetadata() {
  return pageMetadata('stories')
}

export default function Page() {
  return <PageView slug="stories" source="published" />
}
