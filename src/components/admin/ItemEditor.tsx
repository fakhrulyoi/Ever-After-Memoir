'use client'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { FieldDef } from '@/lib/content/fields'
import { SERVICE_FIELDS, SETTINGS_FIELDS, SOCIAL_FIELDS, STORY_FIELDS, TESTIMONIAL_FIELDS } from '@/lib/content/fields'
import type { ContentStatus, ContentTable, StoryContent } from '@/lib/content/types'
import { slugify } from '@/lib/text'
import { EditorShell } from './EditorShell'
import { FormContextProvider, SchemaForm } from './FormFields'

type ItemTable = Exclude<ContentTable, 'pages'>

const SETUP: Record<ItemTable, { fields: FieldDef[]; back?: string; backLabel?: string; title: (d: any) => string; preview?: (d: any) => string | null; collection: boolean }> = {
  stories: { fields: STORY_FIELDS, back: '/admin/stories', backLabel: 'All stories', title: (d) => d.title || 'Untitled story', preview: (d) => (d.slug ? `/preview/stories/${d.slug}` : null), collection: true },
  services: { fields: SERVICE_FIELDS, back: '/admin/services', backLabel: 'Services & packages', title: (d) => d.name || 'Untitled', preview: () => '/preview/services', collection: true },
  testimonials: { fields: TESTIMONIAL_FIELDS, back: '/admin/testimonials', backLabel: 'Testimonials', title: (d) => d.displayName || 'Testimonial', preview: () => '/preview', collection: true },
  social_items: { fields: SOCIAL_FIELDS, back: '/admin/social', backLabel: 'Social', title: (d) => d.caption || 'Social tile', preview: () => '/preview', collection: true },
  site_settings: { fields: SETTINGS_FIELDS, title: () => 'Website settings', preview: () => '/preview', collection: false },
}

export function ItemEditor({
  table,
  row,
  stories = [],
}: {
  table: ItemTable
  row: { id: string; draft: unknown; status: ContentStatus; hasChanges: boolean; published_at: string | null; updated_at: string }
  stories?: { id: string; title: string; status: string }[]
}) {
  const s = SETUP[table]
  return (
    <FormContextProvider value={{ stories }}>
      <EditorShell<Record<string, unknown>>
        table={table}
        id={row.id}
        title={s.title(row.draft)}
        initialDraft={row.draft as Record<string, unknown>}
        status={row.status}
        hasChanges={row.hasChanges}
        publishedAt={row.published_at}
        updatedAt={row.updated_at}
        previewHref={s.preview}
        backHref={s.back}
        backLabel={s.backLabel}
        canArchive={s.collection}
        canDelete={s.collection}
        canUnpublish={s.collection}
      >
        {(draft, setDraft) => (
          <div className="max-w-3xl">
            {table === 'stories' ? (
              <StoryForm draft={draft as unknown as StoryContent} setDraft={(d) => setDraft(d as unknown as Record<string, unknown>)} fields={s.fields} />
            ) : (
              <SchemaForm fields={s.fields} value={draft} onChange={setDraft} idPrefix={table} />
            )}
          </div>
        )}
      </EditorShell>
    </FormContextProvider>
  )
}

/** Story form: suggests a web address from the title until the owner edits it. */
function StoryForm({ draft, setDraft, fields }: { draft: StoryContent; setDraft: (d: StoryContent) => void; fields: FieldDef[] }) {
  const auto = useRef(/^untitled-story-/.test(draft.slug) || draft.slug === '')
  const prevGallery = useRef(draft.gallery.length)
  useEffect(() => {
    const added = draft.gallery.length - prevGallery.current
    if (added > 0) toast.success(added === 1 ? 'Added to the gallery' : `${added} items added to the gallery`)
    prevGallery.current = draft.gallery.length
  }, [draft.gallery.length])
  return (
    <SchemaForm
      fields={fields}
      value={draft as unknown as Record<string, unknown>}
      idPrefix="story"
      onChange={(v) => {
        const next = v as unknown as StoryContent
        if (next.slug !== draft.slug) auto.current = false
        if (auto.current && next.title !== draft.title) next.slug = slugify(next.title)
        setDraft(next)
      }}
    />
  )
}
