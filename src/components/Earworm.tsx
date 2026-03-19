import { useEffect, useState } from "react";

interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  playedAt: string;
}

export default function Earworm() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrack = async () => {
    try {
      const res = await fetch("/api/spotify/now-playing");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.title) {
        setTrack(data);
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

  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border px-3 py-2" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <div className="w-8 h-8 rounded-md animate-pulse shrink-0" style={{ background: "rgba(0,0,0,0.05)" }} />
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-24 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.05)" }} />
          <div className="h-2 w-16 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.04)" }} />
        </div>
      </div>
    );
  }

  if (error || !track) return null;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-full border px-3 py-2 no-underline transition-all duration-300 ease-out hover:scale-[1.01]"
      style={{
        borderColor: "rgba(0,0,0,0.08)",
        color: "inherit",
        fontFamily: "'Söhne', sans-serif",
        fontSize: "12px",
      }}
    >
      <img
        src={track.albumImageUrl}
        alt={track.album}
        width={32}
        height={32}
        className="w-8 h-8 rounded-md shrink-0"
      />
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[11px] font-normal truncate max-w-[160px]" style={{ color: "#000" }}>
          {track.title}
        </span>
        <span className="text-[10px] truncate max-w-[160px]" style={{ color: "#999" }}>
          {track.artist}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-1">
        {track.isPlaying ? (
          <>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "#1DB954" }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#1DB954" }} />
            </span>
          </>
        ) : (
          <span className="text-[9px]" style={{ color: "#BFBFBF" }}>
            {timeAgo(track.playedAt)}
          </span>
        )}
      </div>
    </a>
  );
}
