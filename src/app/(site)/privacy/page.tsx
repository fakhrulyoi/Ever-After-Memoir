import { PageView, pageMetadata } from '@/lib/views'

export const revalidate = 300

export function generateMetadata() {
  return pageMetadata('privacy')
}

export default function Page() {
  return <PageView slug="privacy" source="published" />
}
