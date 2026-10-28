export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string }

/** Turn a database error into a sentence the owner can act on. */
export function friendlyDbError(message: string | undefined) {
  if (!message) return 'Something went wrong. Please try again.'
  if (/stories_published_slug_key|duplicate key/i.test(message))
    return 'Another published story already uses this web address. Change the slug and try again.'
  if (/not authorised|permission denied|row-level security/i.test(message))
    return 'Your session has expired or this account is not an admin. Please sign in again.'
  if (/fetch failed|network/i.test(message)) return 'Could not reach the database. Check your connection and try again.'
  return message
}
