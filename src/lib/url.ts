import { SUPABASE_URL } from './env'
/** Links may be internal paths or http(s)/mailto/tel links. Blocks javascript: etc. */
export function isSafeHref(href: string) {
  const h = href.trim()
  if (!h) return true
  if (h.startsWith('/') && !h.startsWith('//')) return true
  if (h.startsWith('#')) return true
  return /^(https?:\/\/|mailto:|tel:)/i.test(h)
}

const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`

/** Media URLs: bundled files (/brand, /samples), https files, or files in your Supabase storage. */
export function isSafeMediaUrl(url: string) {
  return url.startsWith('/samples/') || url.startsWith('/brand/') || /^https:\/\//i.test(url) || (STORAGE_PREFIX.length > 30 && url.startsWith(STORAGE_PREFIX))
}

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/i.test(href)
