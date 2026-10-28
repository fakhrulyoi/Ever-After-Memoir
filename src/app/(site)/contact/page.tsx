import { PageView, pageMetadata } from '@/lib/views'

export const revalidate = 300

export function generateMetadata() {
  return pageMetadata('contact')
}

export default function Page() {
  return <PageView slug="contact" source="published" />
}
