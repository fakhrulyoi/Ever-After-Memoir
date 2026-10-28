'use client'
import { createContext, useContext, type ReactNode } from 'react'
import type { FieldDef } from '@/lib/content/fields'
import type { Lang } from '@/lib/i18n'
import { inputClass } from './ui'

/** Which language the owner is editing. Set by the switch at the top of every editor. */
const EditLangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })
export const EditLangProvider = EditLangCtx.Provider
export const useEditLang = () => useContext(EditLangCtx)

export function LangToggle() {
  const { lang, setLang } = useEditLang()
  return (
    <div className="inline-flex rounded-[2px] border border-charcoal/15 bg-white/60 p-0.5 text-xs" role="group" aria-label="Language you are editing">
      {(['en', 'ms'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-h-8 rounded-[2px] px-3 font-medium transition-colors ${lang === l ? 'bg-olive-deep text-ivory' : 'text-ink-soft hover:text-olive-deep'}`}
        >
          {l === 'en' ? 'English' : 'Bahasa Melayu'}
        </button>
      ))}
    </div>
  )
}

/** Fields that stay the same in both languages (addresses, numbers, names of things). */
const SAME_IN_BOTH = new Set(['slug', 'url', 'contactEmail', 'whatsappNumber', 'instagramUrl', 'tiktokUrl', 'siteTitle', 'price'])

type Obj = Record<string, unknown>
interface Row {
  path: string
  label: string
  english: string
  long: boolean
}

function rowsFor(fields: FieldDef[], value: Obj): (Row | { heading: string; help?: string })[] {
  const out: (Row | { heading: string; help?: string })[] = []
  for (const f of fields) {
    if (f.kind === 'heading') {
      out.push({ heading: f.label, help: f.help })
      continue
    }
    if (SAME_IN_BOTH.has(f.key)) continue
    const v = value[f.key]
    if (f.kind === 'text' || f.kind === 'textarea' || f.kind === 'headline') {
      out.push({ path: f.key, label: f.label, english: String(v ?? ''), long: f.kind !== 'text' })
    } else if (f.kind === 'link') {
      const l = v as { label?: string } | undefined
      out.push({ path: `${f.key}.label`, label: `${f.label} — text`, english: l?.label ?? '', long: false })
    } else if (f.kind === 'list') {
      ;((v as string[]) ?? []).forEach((item, i) => out.push({ path: `${f.key}.${i}`, label: `${f.label} ${i + 1}`, english: item, long: false }))
    } else if (f.kind === 'reels' || f.kind === 'collage' || f.kind === 'gallery') {
      ;((v as { caption?: string; layout?: string }[]) ?? []).forEach((item, i) => {
        if (!item.caption) return
        const what = item.layout === 'chapter' ? 'Chapter title' : f.kind === 'reels' ? `Reel ${i + 1} caption` : `Caption ${i + 1}`
        out.push({ path: `${f.key}.${i}.caption`, label: what, english: item.caption, long: false })
      })
    } else if (f.kind === 'team') {
      ;((v as { name?: string; role?: string; bio?: string }[]) ?? []).forEach((p, i) => {
        if (p.role) out.push({ path: `${f.key}.${i}.role`, label: `Member ${i + 1} — role`, english: p.role, long: false })
        if (p.bio) out.push({ path: `${f.key}.${i}.bio`, label: `Member ${i + 1} — about`, english: p.bio, long: true })
      })
    }
  }
  return out
}

/** The Malay version of a form: each English text with a box for its Malay wording. */
export function TranslateForm({ fields, value, onChange, idPrefix }: { fields: FieldDef[]; value: Obj; onChange: (next: Obj) => void; idPrefix: string }): ReactNode {
  const ms = (value.ms as Record<string, string> | undefined) ?? {}
  const set = (path: string, text: string) => {
    const next = { ...ms }
    if (text) next[path] = text
    else delete next[path]
    onChange({ ...value, ms: next })
  }
  const rows = rowsFor(fields, value)
  const anyText = rows.some((r) => 'path' in r && r.english)
  if (!anyText) return <p className="text-sm text-ink-soft">Nothing to translate here — this part has no text.</p>
  return (
    <div className="space-y-6">
      <p className="border-l-2 border-sage bg-sage/15 px-3 py-2 text-xs text-ink-soft">
        Write the Bahasa Melayu version under each English text. Anything you leave empty shows in English on the Malay pages.
      </p>
      {rows.map((r, i) => {
        if ('heading' in r)
          return (
            <div key={`h${i}`} className={i > 0 ? 'border-t border-charcoal/10 pt-6' : ''}>
              <h3 className="display text-2xl text-olive-deep">{r.heading}</h3>
            </div>
          )
        if (!r.english) return null
        const id = `${idPrefix}-ms-${r.path}`
        const v = ms[r.path] ?? ''
        return (
          <div key={r.path} className="space-y-1.5">
            <label htmlFor={id} className="block text-[0.8125rem] font-semibold">
              {r.label} <span className="font-normal text-ink-soft">· Bahasa Melayu</span>
            </label>
            <p className="whitespace-pre-line border-l border-charcoal/15 pl-3 text-xs text-ink-soft" lang="en">{r.english}</p>
            {r.long ? (
              <textarea id={id} className={inputClass} rows={Math.min(10, Math.max(2, r.english.split('\n').length + 1))} value={v} placeholder="Leave empty to use the English" onChange={(e) => set(r.path, e.target.value)} lang="ms" />
            ) : (
              <input id={id} className={inputClass} value={v} placeholder="Leave empty to use the English" onChange={(e) => set(r.path, e.target.value)} lang="ms" />
            )}
          </div>
        )
      })}
    </div>
  )
}
