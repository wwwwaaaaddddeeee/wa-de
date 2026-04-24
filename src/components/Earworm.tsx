import { useEffect, useState, useMemo, useRef, useCallback } from "react";

interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  playedAt: string;
  progressMs: number;
  durationMs: number;
}

function formatTime(ms: number) {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function Waveform({ progress }: { progress: number }) {
  // Generate deterministic bar heights
  const bars = useMemo(() => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => {
      const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return 0.15 + (seed - Math.floor(seed)) * 0.85;
    });
  }, []);

  const progressIndex = Math.floor(progress * bars.length);

  return (
    <div className="flex items-center gap-[1.5px]" style={{ height: 24 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 2,
            height: `${h * 100}%`,
            borderRadius: 1,
            background: i <= progressIndex ? "#000" : "#CACACA",
            transition: "background 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

function SpotifyLogo({ color = "#999" }: { color?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.305a.748.748 0 0 1-1.03.249c-2.82-1.723-6.37-2.113-10.553-1.158a.75.75 0 0 1-.334-1.462c4.573-1.045 8.497-.595 11.668 1.34a.75.75 0 0 1 .25 1.031zm1.47-3.267a.937.937 0 0 1-1.287.31c-3.228-1.984-8.15-2.56-11.966-1.4a.938.938 0 0 1-.543-1.796c4.36-1.324 9.778-.682 13.486 1.598a.937.937 0 0 1 .31 1.288zm.127-3.403C15.95 8.603 9.27 8.39 5.4 9.56a1.125 1.125 0 0 1-.652-2.153C9.2 6.072 16.56 6.32 20.436 8.97a1.125 1.125 0 0 1-1.337 1.665z"
        fill={color}
      />
    </svg>
  );
}

function ScrollingText({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  const checkOverflow = useCallback(() => {
    if (containerRef.current && textRef.current) {
      const containerW = containerRef.current.offsetWidth;
      const textW = textRef.current.scrollWidth;
      setShouldScroll(textW > containerW);
      setTextWidth(textW);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
  }, [children, checkOverflow]);

  return (
    <div ref={containerRef} style={{ overflow: "hidden", flexShrink: 1, minWidth: 0 }}>
      <div
        ref={textRef}
        style={{
          display: "inline-flex",
          gap: 4,
          whiteSpace: "nowrap",
          fontSize: 11,
          ...(shouldScroll ? {
            animation: `marquee ${Math.max(textWidth / 25, 5)}s linear infinite`,
          } : {}),
        }}
      >
        {children}
        {shouldScroll && (
          <>
            <span style={{ padding: "0 24px", opacity: 0.3 }}>·</span>
            {children}
          </>
        )}
      </div>
    </div>
  );
}

export default function Earworm() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const fetchTrack = async () => {
    try {
      const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setError(false);
      if (data.title) {
        setTrack(data);
        setLocalProgress(data.progressMs ?? 0);
      } else {
        setTrack({
          isPlaying: false,
          title: "",
          artist: "",
          album: "",
          albumImageUrl: "",
          songUrl: "",
          playedAt: "",
          progressMs: 0,
          durationMs: 0,
        });
      }
    } catch {
      setError(true);
      setTrack({
        isPlaying: false,
        title: "",
        artist: "",
        album: "",
        albumImageUrl: "",
        songUrl: "",
        playedAt: "",
        progressMs: 0,
        durationMs: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Poll API
  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 10_000);
    return () => clearInterval(interval);
  }, []);

  // Tick local progress every second when playing
  useEffect(() => {
    if (!track?.isPlaying) return;
    const interval = setInterval(() => {
      setLocalProgress((p) => Math.min(p + 1000, track.durationMs));
    }, 1000);
    return () => clearInterval(interval);
  }, [track?.isPlaying, track?.durationMs]);

  if (loading || !track) {
    return (
      <div
        className="flex flex-col items-center gap-1.5"
        style={{ fontSize: "14px", opacity: 0.7 }}
      >
        <div
          className="inline-flex items-center gap-1 rounded-full animate-pulse"
          style={{
            border: "0.5px solid rgba(0,0,0,0.06)",
            padding: "2px 7px",
            height: 22,
            width: 108,
            background: "rgba(0,0,0,0.04)",
          }}
        />
        <div
          className="inline-flex items-center gap-2 rounded-full animate-pulse"
          style={{
            border: "0.5px solid rgba(0,0,0,0.08)",
            padding: "5px 10px",
            height: 30,
            width: "min(240px, 70vw)",
            maxWidth: "min(240px, 70vw)",
            background: "var(--faint)",
          }}
        />
      </div>
    );
  }

  const hasTrack = Boolean(track.title?.trim());
  const isPlaying = track.isPlaying && hasTrack;
  const statusMuted = !isPlaying;
  /** Empty placeholder is dimmest; last listen is muted; live playback is full strength. */
  const songPillOpacity = !hasTrack ? 0.5 : isPlaying ? 1 : 0.82;

  const body = (
    <>
      {/* Song pill */}
      <div
        className="inline-flex items-center justify-center gap-2"
        style={{
          background: "var(--faint)",
          border: "0.5px solid rgba(0,0,0,0.12)",
          borderRadius: 999,
          padding: "5px 10px",
          height: 30,
          maxWidth: "min(240px, 70vw)",
          overflow: "hidden",
          opacity: songPillOpacity,
          transition: "opacity 0.3s ease",
        }}
      >
        {hasTrack && track.albumImageUrl ? (
          <img
            src={track.albumImageUrl}
            alt={track.album || ""}
            width={20}
            height={20}
            className="shrink-0"
            style={{
              borderRadius: 4,
              opacity: isPlaying ? 1 : 0.72,
              filter: isPlaying ? undefined : "grayscale(0.35)",
              transition: "opacity 0.3s ease, filter 0.3s ease",
            }}
          />
        ) : (
          <div
            className="shrink-0"
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: "rgba(0,0,0,0.06)",
            }}
          />
        )}
        {hasTrack ? (
          <ScrollingText>
            <span
              style={{
                color: isPlaying ? "var(--track-title)" : "var(--muted)",
                opacity: isPlaying ? 1 : 0.92,
              }}
            >
              {track.title}
            </span>
            <span
              className="font-semibold"
              style={{
                color: isPlaying ? "var(--track-artist)" : "var(--muted)",
                opacity: isPlaying ? 1 : 0.88,
              }}
            >
              {track.artist}
            </span>
          </ScrollingText>
        ) : (
          <span
            style={{
              fontSize: 11,
              color: "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            {error ? "Couldn't load playback" : "Nothing playing recently"}
          </span>
        )}
      </div>

      {/* Status pill */}
      <div
        className="inline-flex items-center gap-1"
        style={{
          background: isPlaying ? "rgba(117, 255, 79, 0.05)" : "transparent",
          border: isPlaying ? "0.5px solid rgba(117, 255, 79, 0.3)" : "0.5px solid rgba(0,0,0,0.06)",
          borderRadius: 999,
          padding: "2px 7px",
          whiteSpace: "nowrap",
          transition: "background 0.3s ease, border 0.3s ease, opacity 0.3s ease",
          opacity: statusMuted ? 0.55 : 1,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            lineHeight: 0,
            transform: "scale(0.7)",
            transformOrigin: "center",
            opacity: statusMuted ? 0.5 : 1,
          }}
        >
          <SpotifyLogo color={statusMuted ? "var(--muted)" : "#DADADA"} />
        </span>
        <span
          style={{
            fontSize: 7,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: isPlaying ? "#75FF4F" : "var(--muted)",
            fontFamily: "'Geist Pixel', monospace",
            textShadow: isPlaying ? "0 0 8px rgba(117, 255, 79, 0.6), 0 0 20px rgba(117, 255, 79, 0.3)" : "none",
            transition: "color 0.3s ease, text-shadow 0.3s ease",
          }}
        >
          {isPlaying ? "LISTENING NOW" : "LAST LISTEN"}
        </span>
      </div>
    </>
  );

  const interactive = hasTrack && Boolean(track.songUrl);

  if (interactive) {
    return (
      <a
        href={track.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1.5 no-underline transition-all duration-300 ease-out hover:scale-[1.005]"
        style={{
          background: "transparent",
          border: "none",
          color: "inherit",
          fontSize: "14px",
        }}
      >
        {body}
      </a>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      style={{
        color: "inherit",
        fontSize: "14px",
      }}
    >
      {body}
    </div>
  );
}
