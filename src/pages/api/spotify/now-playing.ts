import type { APIRoute } from "astro";

export const prerender = false;

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=50";

async function getAccessToken(): Promise<string> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  return data.access_token;
}

type TrackPayload = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  playedAt: string;
  progressMs: number;
  durationMs: number;
};

/** Track or episode from player / recently-played (shapes differ). */
type SpotifyPlaybackItem = {
  name?: string;
  type?: string;
  artists?: { name?: string }[];
  album?: { name?: string; images?: { url?: string }[] };
  show?: { name?: string; images?: { url?: string }[] };
  images?: { url?: string }[];
  external_urls?: { spotify?: string };
  duration_ms?: number;
};

type SpotifyNowPlayingBody = {
  is_playing?: boolean;
  progress_ms?: number;
  item?: SpotifyPlaybackItem | null;
};

type SpotifyRecentEntry = {
  played_at?: string;
  track?: SpotifyPlaybackItem | null;
};

function albumCoverFrom(images: { url?: string }[] | undefined): string {
  if (!images?.length) return "";
  // Spotify returns widest first; prefer a mid-sized thumb for the widget
  return images[1]?.url ?? images[0]?.url ?? images.at(-1)?.url ?? "";
}

function artistLineFromItem(item: SpotifyPlaybackItem): string {
  const fromArtists = (item.artists ?? [])
    .map((a) => a.name)
    .filter(Boolean)
    .join(", ");
  if (fromArtists) return fromArtists;
  if (item.show?.name) return item.show.name;
  return "";
}

function imagesFromItem(item: SpotifyPlaybackItem): { url?: string }[] | undefined {
  if (item.album?.images?.length) return item.album.images;
  if (item.show?.images?.length) return item.show.images;
  if (item.images?.length) return item.images;
  return undefined;
}

function albumTitleFromItem(item: SpotifyPlaybackItem): string {
  return item.album?.name ?? item.show?.name ?? "";
}

function itemToPayload(
  item: SpotifyPlaybackItem,
  opts: { isPlaying: boolean; playedAt: string; progressMs: number }
): TrackPayload | null {
  const title = item.name?.trim();
  if (!title) return null;
  return {
    isPlaying: opts.isPlaying,
    title,
    artist: artistLineFromItem(item),
    album: albumTitleFromItem(item),
    albumImageUrl: albumCoverFrom(imagesFromItem(item)),
    songUrl: item.external_urls?.spotify ?? "",
    playedAt: opts.playedAt,
    progressMs: opts.progressMs,
    durationMs: item.duration_ms ?? 0,
  };
}

function mapCurrentlyPlaying(data: SpotifyNowPlayingBody): TrackPayload | null {
  const item = data.item;
  if (!item) return null;
  return itemToPayload(item, {
    isPlaying: Boolean(data.is_playing),
    playedAt: new Date().toISOString(),
    progressMs: data.progress_ms ?? 0,
  });
}

function mapRecentlyPlayedEntry(entry: SpotifyRecentEntry): TrackPayload | null {
  const track = entry.track;
  if (!track) return null;
  return itemToPayload(track, {
    isPlaying: false,
    playedAt: entry.played_at ?? "",
    progressMs: track.duration_ms ?? 0,
  });
}

function firstRecentPayload(raw: unknown): TrackPayload | null {
  if (!raw || typeof raw !== "object" || !("items" in raw)) return null;
  const items = (raw as { items?: SpotifyRecentEntry[] }).items;
  if (!items?.length) return null;
  for (const row of items) {
    const mapped = mapRecentlyPlayedEntry(row);
    if (mapped) return mapped;
  }
  return null;
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async () => {
  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Fetch both so we always have a "last played" candidate when nothing is live
    const [nowRes, recentRes] = await Promise.all([
      fetch(SPOTIFY_NOW_PLAYING_URL, { headers }),
      fetch(SPOTIFY_RECENTLY_PLAYED_URL, { headers }),
    ]);

    let nowPayload: TrackPayload | null = null;
    if (nowRes.status === 200) {
      const raw = await safeJson(nowRes);
      if (raw && typeof raw === "object" && "item" in raw) {
        nowPayload = mapCurrentlyPlaying(raw as SpotifyNowPlayingBody);
      }
    }

    let recentPayload: TrackPayload | null = null;
    if (recentRes.status === 200) {
      const raw = await safeJson(recentRes);
      recentPayload = firstRecentPayload(raw);
    }

    const jsonHeaders = {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
    } as const;

    if (nowPayload?.isPlaying) {
      return new Response(JSON.stringify(nowPayload), { headers: jsonHeaders });
    }

    // Paused / on-device queue: prefer the player item so the pill matches the app
    if (nowPayload && !nowPayload.isPlaying) {
      return new Response(JSON.stringify(nowPayload), { headers: jsonHeaders });
    }

    if (recentPayload) {
      return new Response(JSON.stringify(recentPayload), { headers: jsonHeaders });
    }

    // Nothing found — shape matches track responses so the client can always render
    return new Response(
      JSON.stringify({
        isPlaying: false,
        title: "",
        artist: "",
        album: "",
        albumImageUrl: "",
        songUrl: "",
        playedAt: "",
        progressMs: 0,
        durationMs: 0,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        isPlaying: false,
        title: "",
        artist: "",
        album: "",
        albumImageUrl: "",
        songUrl: "",
        playedAt: "",
        progressMs: 0,
        durationMs: 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
