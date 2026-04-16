import type { APIRoute } from "astro";

export const prerender = false;

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=50";

/** Prefer non-empty values; Vercel sets `process.env` at runtime, Vite dev injects `.env` into `import.meta.env`. */
function pickEnv(key: string): string {
  const fromProcess =
    typeof process !== "undefined" ? process.env[key]?.trim() : undefined;
  if (fromProcess) return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key]?.trim();
  return fromMeta ?? "";
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  const pair = `${clientId}:${clientSecret}`;
  if (typeof Buffer !== "undefined") {
    return "Basic " + Buffer.from(pair, "utf8").toString("base64");
  }
  return "Basic " + btoa(pair);
}

async function getAccessToken(): Promise<string> {
  const clientId = pickEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = pickEnv("SPOTIFY_CLIENT_SECRET");
  const refreshToken = pickEnv("SPOTIFY_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("missing_spotify_env");
  }

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(clientId, clientSecret),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "token_refresh_failed");
  }
  return data.access_token;
}

async function spotifyGet(accessToken: string, url: string): Promise<Response> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  let res = await fetch(url, { headers });
  if (res.status === 429) {
    const sec = parseInt(res.headers.get("Retry-After") ?? "2", 10);
    await new Promise((r) => setTimeout(r, Math.min(Math.max(sec, 1) * 1000, 8000)));
    res = await fetch(url, { headers });
  }
  return res;
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
    progressMs: 0,
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

const jsonHeadersOk = {
  "Content-Type": "application/json",
  "Cache-Control": "private, max-age=15",
} as const;

const emptyPayload = {
  isPlaying: false,
  title: "",
  artist: "",
  album: "",
  albumImageUrl: "",
  songUrl: "",
  playedAt: "",
  progressMs: 0,
  durationMs: 0,
};

export const GET: APIRoute = async () => {
  try {
    const accessToken = await getAccessToken();

    // Currently playing first — avoids two parallel calls (helps with Spotify rate limits).
    const nowRes = await spotifyGet(accessToken, SPOTIFY_NOW_PLAYING_URL);

    let nowPayload: TrackPayload | null = null;
    if (nowRes.status === 200) {
      const raw = await safeJson(nowRes);
      if (raw && typeof raw === "object" && "item" in raw) {
        nowPayload = mapCurrentlyPlaying(raw as SpotifyNowPlayingBody);
      }
    }

    if (nowPayload?.isPlaying) {
      return new Response(JSON.stringify(nowPayload), { headers: jsonHeadersOk });
    }

    if (nowPayload && !nowPayload.isPlaying) {
      return new Response(JSON.stringify(nowPayload), { headers: jsonHeadersOk });
    }

    const recentRes = await spotifyGet(accessToken, SPOTIFY_RECENTLY_PLAYED_URL);

    let recentPayload: TrackPayload | null = null;
    if (recentRes.status === 200) {
      const raw = await safeJson(recentRes);
      recentPayload = firstRecentPayload(raw);
    }

    if (recentPayload) {
      return new Response(JSON.stringify(recentPayload), { headers: jsonHeadersOk });
    }

    return new Response(JSON.stringify(emptyPayload), {
      headers: jsonHeadersOk,
    });
  } catch {
    return new Response(JSON.stringify(emptyPayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
