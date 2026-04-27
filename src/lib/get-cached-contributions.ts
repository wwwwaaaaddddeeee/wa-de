export type ContributionLevel = 0 | 1 | 2 | 3 | 4
export type Day = { date: string; level: ContributionLevel; count: number }
export type Week = Day[]
export type Contributions = { total: number; weeks: Week[] }

const TTL_MS = 60 * 60 * 1000
const cache = new Map<string, { data: Contributions; expires: number }>()

const EMPTY_DAY: Day = { date: '', level: 0, count: 0 }

export interface FetchOptions {
  /** Only include days on/after this ISO date (YYYY-MM-DD). */
  since?: string
  /**
   * Pad days through this ISO date (YYYY-MM-DD) with empty cells when
   * GitHub hasn't reported them yet. Use to render the rest of a year.
   */
  until?: string
}

export async function getCachedContributions(
  user: string,
  opts: FetchOptions = {},
): Promise<Contributions> {
  const cacheKey = `${user}|${opts.since ?? ''}|${opts.until ?? ''}`
  const now = Date.now()
  const hit = cache.get(cacheKey)
  if (hit && hit.expires > now) return hit.data

  const res = await fetch(`https://github.com/users/${user}/contributions`, {
    headers: { 'User-Agent': 'wa-de/2.0', Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  const html = await res.text()

  const counts = new Map<string, number>()
  const tooltipRe =
    /<tool-tip\b[^>]*\bfor="(contribution-day-component-\d+-\d+)"[^>]*>([^<]+)</g
  let tm: RegExpExecArray | null
  while ((tm = tooltipRe.exec(html)) !== null) {
    const id = tm[1]
    const text = tm[2].trim()
    if (/^no contribution/i.test(text)) {
      counts.set(id, 0)
    } else {
      const n = text.match(/^(\d+)\s+contribution/i)
      if (n) counts.set(id, Number(n[1]))
    }
  }

  const tdRe = /<td\b[^>]*\bclass="[^"]*ContributionCalendar-day[^>]*>/g
  let days: Day[] = []
  let m: RegExpExecArray | null
  while ((m = tdRe.exec(html)) !== null) {
    const tag = m[0]
    const date = tag.match(/\bdata-date="([^"]+)"/)?.[1]
    const lvl = tag.match(/\bdata-level="([0-4])"/)?.[1]
    const id = tag.match(/\bid="([^"]+)"/)?.[1]
    if (date && lvl) {
      const count = id ? counts.get(id) ?? 0 : 0
      days.push({ date, level: Number(lvl) as ContributionLevel, count })
    }
  }
  days.sort((a, b) => a.date.localeCompare(b.date))

  if (opts.since) {
    days = days.filter((d) => d.date >= opts.since!)
  }

  if (opts.since && opts.until) {
    const byDate = new Map<string, Day>()
    for (const d of days) byDate.set(d.date, d)
    const out: Day[] = []
    const start = new Date(opts.since + 'T00:00:00Z')
    const end = new Date(opts.until + 'T00:00:00Z')
    for (let cur = new Date(start); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
      const iso = cur.toISOString().slice(0, 10)
      out.push(byDate.get(iso) ?? { date: iso, level: 0, count: 0 })
    }
    days = out
  }

  let weeks: Week[] = []
  if (days.length > 0) {
    const firstDow = new Date(days[0].date + 'T00:00:00Z').getUTCDay()
    const padded: Day[] = Array.from({ length: firstDow }, () => EMPTY_DAY).concat(days)
    while (padded.length % 7 !== 0) padded.push(EMPTY_DAY)
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))
  }

  const total = days.reduce((acc, d) => acc + d.count, 0)
  const data: Contributions = { total, weeks }
  cache.set(cacheKey, { data, expires: now + TTL_MS })
  return data
}
