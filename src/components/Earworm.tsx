import { useEffect, useState, useMemo } from "react";

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

function SpotifyLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM12 14C13.7473 14 15.4224 14.3388 16.9502 14.9541L16.3896 16.3457C15.0375 15.8011 13.5526 15.5 12 15.5C10.4479 15.5 8.96749 15.8006 7.60938 16.3457L7.05078 14.9541C8.58261 14.3393 10.2522 14 12 14ZM12 11C14.0957 11 16.098 11.3982 17.9375 12.1162L17.3926 13.5137C15.7222 12.8617 13.9042 12.5 12 12.5C10.0945 12.5 8.27747 12.8569 6.60938 13.5127L6.06055 12.1172C7.90243 11.393 9.90551 11 12 11ZM12 8C14.4382 8.00003 16.7752 8.45299 18.9258 9.28613L18.6543 9.98535L18.3838 10.6846C16.4047 9.91788 14.2515 9.50003 12 9.5C9.74959 9.50003 7.59533 9.92191 5.61426 10.6846L5.0752 9.28516C7.22393 8.45792 9.56065 8.00003 12 8Z"
        fill="#999"
      />
    </svg>
  );
}

export default function Earworm() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const fetchTrack = async () => {
    try {
      const res = await fetch("/api/spotify/now-playing");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.title) {
        setTrack(data);
        setLocalProgress(data.progressMs);
        setError(false);
      } else {
        setTrack(null);
      }
    } catch {
      setError(true);
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

  if (loading) {
    return (
      <div
        className="inline-flex items-center gap-4 rounded-2xl px-5 py-1.5"
        style={{
          background: "rgba(245, 245, 245, 0.5)",
          border: "0.5px solid #E2E2E2",
          width: 420,
          height: 56,
        }}
      >
        <div className="w-3 h-3 rounded-2xl animate-pulse" style={{ background: "rgba(0,0,0,0.08)" }} />
        <div className="w-10 h-10 rounded-md animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
          <div className="h-2.5 w-16 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.04)" }} />
        </div>
      </div>
    );
  }

  if (error || !track) return null;

  const progress = track.durationMs > 0 ? localProgress / track.durationMs : 0;

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-4 rounded-2xl px-5 py-1.5 no-underline transition-all duration-300 ease-out hover:scale-[1.005]"
      style={{
        background: "rgba(245, 245, 245, 0.5)",
        border: "0.5px solid #E2E2E2",
        color: "inherit",
        fontFamily: "'Söhne', sans-serif",
        fontSize: "12px",
      }}
    >
      {/* Green dot with glow */}
      <span className="relative flex items-center justify-center shrink-0" style={{ width: 28, height: 28 }}>
        {track.isPlaying && (
          <span
            className="absolute rounded-2xl"
            style={{
              width: 28,
              height: 28,
              background: "rgba(4, 242, 118, 0.2)",
            }}
          />
        )}
        <span
          className="relative inline-flex rounded-2xl"
          style={{
            width: 10,
            height: 10,
            background: track.isPlaying ? "#04F276" : "#CACACA",
          }}
        />
      </span>

      {/* Album art */}
      <img
        src={track.albumImageUrl}
        alt={track.album}
        width={40}
        height={40}
        className="shrink-0"
        style={{ borderRadius: 6 }}
      />

      {/* Track info */}
      <div className="flex flex-col items-start min-w-0 shrink-0">
        <span className="font-medium truncate" style={{ fontSize: 13, color: "#000", maxWidth: 130 }}>
          {track.title}
        </span>
        <span className="truncate" style={{ fontSize: 11, color: "#999", maxWidth: 130 }}>
          {track.artist}
        </span>
      </div>


      {/* Spotify logo */}
      <div className="shrink-0 ml-auto">
        <SpotifyLogo />
      </div>
    </a>
  );
}
