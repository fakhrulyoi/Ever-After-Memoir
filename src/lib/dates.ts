/** Dates are handled as YYYY-MM-DD strings in Malaysia time. */
export const TIME_ZONE = 'Asia/Kuala_Lumpur'

export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function addMonths(iso: string, months: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}

/** First day of the month containing `iso` */
export function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`
}

export function daysInMonth(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** 0 = Monday … 6 = Sunday */
export function weekdayMon(iso: string) {
  return (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7
}

export function formatLong(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

/** e.g. "Khamis, 5 November 2026" */
export function formatLongMs(iso: string) {
  return new Intl.DateTimeFormat('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

export function formatMonth(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))
}
