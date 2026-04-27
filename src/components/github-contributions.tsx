import type { Contributions, Week } from '@/lib/get-cached-contributions'

const LEVEL_VARS = [
  'var(--gh-l0)',
  'var(--gh-l1)',
  'var(--gh-l2)',
  'var(--gh-l3)',
  'var(--gh-l4)',
] as const
const CELL = 15
const GAP = 3
const STEP = CELL + GAP
const HEADER = 22

type Label = { x: number; text: string }

function monthLabels(weeks: Week[]): Label[] {
  const labels: Label[] = []
  let lastMonth = -1
  let lastX = -100
  weeks.forEach((week, wi) => {
    const valid = week.find((d) => d.date)
    if (!valid) return
    const date = new Date(valid.date + 'T00:00:00Z')
    const m = date.getUTCMonth()
    const x = wi * STEP
    if (m !== lastMonth && x - lastX >= STEP * 2) {
      labels.push({
        x,
        text: date.toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
      })
      lastMonth = m
      lastX = x
    }
  })
  return labels
}

export function GitHubContributionsFallback({ rows: _rows = 7 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-black/[0.04] bg-white p-3 dark:border-white/5 dark:bg-[#1b1b1b]">
      <div className="flex flex-col gap-1.5 px-1 pt-1">
        <div className="h-6 w-16 animate-pulse rounded bg-zinc-100 dark:bg-white/5" />
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-100 dark:bg-white/5" />
      </div>
      <div className="h-[145px] w-full animate-pulse rounded bg-zinc-100 dark:bg-white/5" />
    </div>
  )
}

export interface GitHubContributionsProps {
  contributions: Contributions
  githubProfileUrl: string
  /** Indices of days within each week to render, e.g. [1,2,3,4,5] for Mon-Fri. Defaults to all 7. */
  daysOfWeek?: number[]
  /** Footer label, e.g. "in 2026" or "in the last year". */
  rangeLabel?: string
}

export function GitHubContributions({
  contributions,
  githubProfileUrl,
  daysOfWeek = [0, 1, 2, 3, 4, 5, 6],
  rangeLabel = 'in the last year',
}: GitHubContributionsProps) {
  const w = contributions.weeks.length
  if (w === 0) return <GitHubContributionsFallback rows={daysOfWeek.length} />

  const totalW = w * STEP - GAP
  const totalH = HEADER + daysOfWeek.length * STEP - GAP
  const labels = monthLabels(contributions.weeks)

  return (
    <div className="flex w-full flex-col rounded-xl border border-black/[0.04] bg-white p-3 dark:border-white/5 dark:bg-[#1b1b1b]">
      <div className="flex flex-col gap-0.5 px-1 pt-1 pb-3">
        <span className="text-[22px] font-semibold leading-none tracking-tight text-[#1a1a1a] dark:text-[#ededed]">
          {contributions.total.toLocaleString()}
        </span>
        <a
          href={githubProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-[#9a9a9a] hover:text-[#1f1f1f] dark:text-[#777] dark:hover:text-[#ededed]"
        >
          contributions {rangeLabel} on GitHub →
        </a>
      </div>
      <div
        className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="img"
        aria-label={`${contributions.total.toLocaleString()} GitHub contributions ${rangeLabel}`}
        data-gh-scroll
      >
        <svg
          width={totalW}
          height={totalH}
          viewBox={`0 0 ${totalW} ${totalH}`}
          preserveAspectRatio="xMinYMid meet"
          className="block overflow-visible"
        >
          <title>GitHub Contributions</title>
          <g className="fill-zinc-500 dark:fill-zinc-400" fontSize={10} fontFamily="inherit">
            {labels.map((l) => (
              <text key={l.x} x={l.x} y={0} dominantBaseline="hanging">
                {l.text}
              </text>
            ))}
          </g>
          <g>
            {contributions.weeks.map((week, wi) =>
              daysOfWeek.map((di, row) => {
                const day = week[di]
                if (!day) return null
                return (
                  <rect
                    key={`${wi}-${di}`}
                    x={wi * STEP}
                    y={HEADER + row * STEP}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    ry={2}
                    fill={LEVEL_VARS[day.level]}
                    data-date={day.date || undefined}
                    data-level={day.date ? day.level : undefined}
                  >
                    {day.date ? (
                      <title>{`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}</title>
                    ) : null}
                  </rect>
                )
              }),
            )}
          </g>
        </svg>
      </div>
      <div className="flex items-center justify-end gap-1 px-1 pt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>Less</span>
        <div className="flex items-center gap-[3px]">
          {LEVEL_VARS.map((c, i) => (
            <span
              key={i}
              className="inline-block rounded-[2px]"
              style={{ width: CELL, height: CELL, background: c }}
              aria-hidden
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
