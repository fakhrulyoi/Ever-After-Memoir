import { PageView, pageMetadata } from '@/lib/views'

export const revalidate = 300

export function generateMetadata() {
  return pageMetadata('home', 'ms')
}

export default function Page() {
  return <PageView slug="home" source="published" lang="ms" />
}
