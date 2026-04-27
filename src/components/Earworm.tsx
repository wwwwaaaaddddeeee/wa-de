import { useCallback, useEffect, useRef, useState } from 'react'

import { StatusIndicator } from '@/components/kibo-ui/status'

interface SpotifyTrack {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumImageUrl: string
  songUrl: string
  playedAt: string
  progressMs: number
  durationMs: number
}

const STORAGE_KEY = 'earworm:last-track'
const POLL_MS = 10_000

function readCachedTrack(): SpotifyTrack | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SpotifyTrack
    if (!parsed?.title) return null
    return { ...parsed, isPlaying: false, progressMs: 0 }
  } catch {
    return null
  }
}

function writeCachedTrack(track: SpotifyTrack) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...track, isPlaying: false, progressMs: 0 }),
    )
  } catch {
    // ignore
  }
}

const PILL_CLASS =
  'inline-flex w-[var(--email-pill-w,180px)] items-center gap-1.5 rounded-[5px] bg-black/[0.04] px-2 py-1 text-[11px] tracking-tight text-[#9a9a9a] transition-colors hover:bg-black/[0.06] dark:bg-white/5 dark:text-[#777] dark:hover:bg-white/[0.07]'

function Marquee({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [duration, setDuration] = useState(10)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return
    // measure single copy width via the first child
    const first = track.firstElementChild as HTMLElement | null
    const copyWidth = first?.offsetWidth ?? 0
    const overflows = copyWidth > container.offsetWidth
    setShouldScroll(overflows)
    if (overflows) {
      setDuration(Math.max(copyWidth / 18, 9))
    }
  }, [children])

  return (
    <div ref={containerRef} className="min-w-0 flex-1 overflow-hidden">
      <div
        ref={trackRef}
        className="inline-flex whitespace-nowrap"
        style={shouldScroll ? { animation: `marquee ${duration}s linear infinite` } : undefined}
      >
        <span className="inline-flex shrink-0">{children}</span>
        {shouldScroll ? (
          <>
            <span className="inline-block w-8 shrink-0" aria-hidden />
            <span className="inline-flex shrink-0" aria-hidden>
              {children}
            </span>
            <span className="inline-block w-8 shrink-0" aria-hidden />
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function Earworm() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTrack = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as SpotifyTrack
      if (data.title) {
        setTrack(data)
        writeCachedTrack(data)
      }
    } catch {
      // keep previous state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = readCachedTrack()
    if (cached) {
      setTrack(cached)
      setLoading(false)
    }
    fetchTrack()
    const interval = setInterval(fetchTrack, POLL_MS)
    return () => clearInterval(interval)
  }, [fetchTrack])

  if (loading && !track) {
    return (
      <div className={PILL_CLASS} aria-label="Loading recent track">
        <SpotifyIcon />
        <span className="truncate">Loading…</span>
      </div>
    )
  }

  if (!track || !track.title) {
    return (
      <div className={PILL_CLASS}>
        <SpotifyIcon />
        <span className="truncate">No recent track</span>
      </div>
    )
  }

  const content = (
    <>
      {track.isPlaying ? (
        <span className="group online mr-1 shrink-0" aria-label="Now playing">
          <StatusIndicator />
        </span>
      ) : null}
      {track.albumImageUrl ? (
        <img
          src={track.albumImageUrl}
          alt=""
          width={14}
          height={14}
          className="rounded-[2px] shrink-0"
        />
      ) : (
        <SpotifyIcon />
      )}
      <Marquee>
        <span className="text-[#1f1f1f] dark:text-[#ededed]">{track.title}</span>
        <span className="text-[#9a9a9a] dark:text-[#777]"> — {track.artist}</span>
      </Marquee>
    </>
  )

  if (track.songUrl) {
    return (
      <a href={track.songUrl} target="_blank" rel="noreferrer" className={PILL_CLASS}>
        {content}
      </a>
    )
  }
  return <div className={PILL_CLASS}>{content}</div>
}

function SpotifyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0 text-[#1f1f1f] dark:text-[#ededed]"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.305a.748.748 0 0 1-1.03.249c-2.82-1.723-6.37-2.113-10.553-1.158a.75.75 0 0 1-.334-1.462c4.573-1.045 8.497-.595 11.668 1.34a.75.75 0 0 1 .25 1.031zm1.47-3.267a.937.937 0 0 1-1.287.31c-3.228-1.984-8.15-2.56-11.966-1.4a.938.938 0 0 1-.543-1.796c4.36-1.324 9.778-.682 13.486 1.598a.937.937 0 0 1 .31 1.288zm.127-3.403C15.95 8.603 9.27 8.39 5.4 9.56a1.125 1.125 0 0 1-.652-2.153C9.2 6.072 16.56 6.32 20.436 8.97a1.125 1.125 0 0 1-1.337 1.665z" />
    </svg>
  )
}
