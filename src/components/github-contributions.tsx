import type { Contributions } from '@/lib/get-cached-contributions'

const LEVEL_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] as const
const CELL = 11
const GAP = 3

export function GitHubContributionsFallback() {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="h-[91px] w-full animate-pulse rounded-[2px] bg-[#ebedf0]" />
      <div className="flex justify-between text-[11px]">
        <span className="text-transparent bg-[#ebedf0] rounded">000 contributions</span>
        <span className="text-[#8c8c8c]">Last 12 months</span>
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
  const totalW = w * CELL + (w - 1) * GAP
  const totalH = 7 * CELL + 6 * GAP

  return (
    <a
      href={githubProfileUrl}
      target="_blank"
      rel="noreferrer"
      className="block w-full group"
      aria-label="View GitHub profile"
    >
      <div className="flex flex-col gap-1.5 w-full">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="auto"
          aria-hidden="true"
          className="block transition-opacity group-hover:opacity-80"
        >
          {contributions.weeks.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * (CELL + GAP)}
                y={di * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                ry={2}
                fill={LEVEL_COLORS[day.level]}
              />
            )),
          )}
        </svg>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#231f20]">
            {contributions.total.toLocaleString()} contributions
          </span>
          <span className="text-[#8c8c8c]">Last 12 months</span>
        </div>
      </div>
    </a>
  )
}
