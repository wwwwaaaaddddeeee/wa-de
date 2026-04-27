export type ContributionLevel = 0 | 1 | 2 | 3 | 4
export type Day = { date: string; level: ContributionLevel; count: number }
export type Week = Day[]
export type Contributions = { total: number; weeks: Week[] }

const TTL_MS = 60 * 60 * 1000
const cache = new Map<string, { data: Contributions; expires: number }>()

const EMPTY_DAY: Day = { date: '', level: 0, count: 0 }

export async function getCachedContributions(user: string): Promise<Contributions> {
  const now = Date.now()
  const hit = cache.get(user)
  if (hit && hit.expires > now) return hit.data

  const res = await fetch(`https://github.com/users/${user}/contributions`, {
    headers: { 'User-Agent': 'wa-de/2.0', Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
  const html = await res.text()

  const tdRe = /<td\b[^>]*\bclass="[^"]*ContributionCalendar-day[^>]*>/g
  const days: Day[] = []
  let m: RegExpExecArray | null
  while ((m = tdRe.exec(html)) !== null) {
    const tag = m[0]
    const date = tag.match(/\bdata-date="([^"]+)"/)?.[1]
    const lvl = tag.match(/\bdata-level="([0-4])"/)?.[1]
    if (date && lvl) {
      days.push({ date, level: Number(lvl) as ContributionLevel, count: 0 })
    }
  }
  days.sort((a, b) => a.date.localeCompare(b.date))

  let weeks: Week[] = []
  if (days.length > 0) {
    const firstDow = new Date(days[0].date + 'T00:00:00Z').getUTCDay()
    const padded: Day[] = Array.from({ length: firstDow }, () => EMPTY_DAY).concat(days)
    while (padded.length % 7 !== 0) padded.push(EMPTY_DAY)
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))
  }

  const totalMatch = html.match(/(\d{1,3}(?:,\d{3})*)\s+contributions?\s+in\s+the\s+last\s+year/i)
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : days.length

  const data: Contributions = { total, weeks }
  cache.set(user, { data, expires: now + TTL_MS })
  return data
}
