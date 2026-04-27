import type { Contributions, Week } from '@/lib/get-cached-contributions'

const LEVEL_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] as const
const CELL = 11
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

export function GitHubContributionsFallback() {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white">
      <div className="px-2 py-2">
        <div className="h-[117px] w-full animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 text-[12px] text-zinc-500">
        <span>Loading contributions…</span>
        <span className="invisible">Less More</span>
      </div>
    </div>
  )
}

export function GitHubContributions({
  contributions,
  githubProfileUrl,
}: {
  contributions: Contributions
  githubProfileUrl: string
}) {
  const w = contributions.weeks.length
  if (w === 0) return <GitHubContributionsFallback />

  const totalW = w * STEP - GAP
  const totalH = HEADER + 7 * STEP - GAP
  const labels = monthLabels(contributions.weeks)

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white">
      <div
        className="max-w-full overflow-x-auto overflow-y-hidden p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="img"
        aria-label={`${contributions.total.toLocaleString()} GitHub contributions in the last year`}
      >
        <svg
          width={totalW}
          height={totalH}
          viewBox={`0 0 ${totalW} ${totalH}`}
          className="block overflow-visible"
        >
          <title>GitHub Contributions</title>
          <g className="fill-zinc-500" fontSize={10} fontFamily="inherit">
            {labels.map((l) => (
              <text key={l.x} x={l.x} y={0} dominantBaseline="hanging">
                {l.text}
              </text>
            ))}
          </g>
          <g>
            {contributions.weeks.map((week, wi) =>
              week.map((day, di) => (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * STEP}
                  y={HEADER + di * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  ry={2}
                  fill={LEVEL_COLORS[day.level]}
                  data-date={day.date || undefined}
                  data-level={day.date ? day.level : undefined}
                >
                  {day.date ? <title>{day.date}</title> : null}
                </rect>
              )),
            )}
          </g>
        </svg>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-3 py-2 text-[12px] text-zinc-600">
        <a
          href={githubProfileUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate hover:text-zinc-900"
        >
          {contributions.total.toLocaleString()} contributions in the last year on GitHub
        </a>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[11px] text-zinc-500">Less</span>
          <div className="flex items-center gap-[3px]">
            {LEVEL_COLORS.map((c, i) => (
              <span
                key={i}
                className="inline-block rounded-[2px]"
                style={{ width: CELL, height: CELL, background: c }}
                aria-hidden
              />
            ))}
          </div>
          <span className="text-[11px] text-zinc-500">More</span>
        </div>
      </div>
    </div>
  )
}
