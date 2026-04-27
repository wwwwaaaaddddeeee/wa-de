import { useCallback, useEffect, useRef, useState } from 'react'

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
      <NowPlayingIndicator playing={track.isPlaying} />
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

const SPOTIFY_MASK_STYLE: React.CSSProperties = {
  maskImage: "url('/spotify-mark.png')",
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskImage: "url('/spotify-mark.png')",
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
}

function SpotifyIcon() {
  return (
    <span
      className="inline-block size-3 shrink-0 bg-[#1f1f1f] dark:bg-[#ededed]"
      style={SPOTIFY_MASK_STYLE}
      aria-hidden
    />
  )
}

function NowPlayingIndicator({ playing }: { playing: boolean }) {
  return (
    <span
      className="relative mr-1 inline-flex size-2.5 shrink-0 items-center justify-center"
      aria-label={playing ? 'Now playing' : 'Last listen'}
    >
      {playing ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
      ) : null}
      <span
        className={
          playing
            ? 'relative inline-block size-2.5 bg-emerald-500'
            : 'relative inline-block size-2.5 bg-[#9a9a9a] dark:bg-[#777]'
        }
        style={SPOTIFY_MASK_STYLE}
        aria-hidden
      />
    </span>
  )
}
