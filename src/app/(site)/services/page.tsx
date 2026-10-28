import { PageView, pageMetadata } from '@/lib/views'

export const revalidate = 300

export function generateMetadata() {
  return pageMetadata('services')
}

export default function Page() {
  return <PageView slug="services" source="published" />
}
