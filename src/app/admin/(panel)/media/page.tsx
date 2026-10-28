import type { Metadata } from 'next'
import { MediaLibrary } from '@/components/admin/MediaLibrary'
import { PageHeader } from '@/components/admin/ui'
import { listMedia } from '@/lib/actions/media'

export const metadata: Metadata = { title: 'Media library' }

export default async function MediaPage() {
  const assets = await listMedia()
  return (
    <>
      <PageHeader
        title="Media library"
        description="Every photo and film you upload lives here and can be reused on any page. Add alt text so everyone — and Google — knows what each photo shows."
      />
      <MediaLibrary initial={assets} />
    </>
  )
}
