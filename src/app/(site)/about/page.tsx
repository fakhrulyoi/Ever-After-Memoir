import { PageView, pageMetadata } from '@/lib/views'

export const revalidate = 300

export function generateMetadata() {
  return pageMetadata('about')
}

export default function Page() {
  return <PageView slug="about" source="published" />
}
