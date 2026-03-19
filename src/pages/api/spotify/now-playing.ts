import type { APIRoute } from "astro";

export const prerender = false;

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

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

export const GET: APIRoute = async () => {
  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Try currently playing
    const nowRes = await fetch(SPOTIFY_NOW_PLAYING_URL, { headers });

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.item) {
        return new Response(
          JSON.stringify({
            isPlaying: data.is_playing,
            title: data.item.name,
            artist: data.item.artists
              .map((a: { name: string }) => a.name)
              .join(", "),
            album: data.item.album.name,
            albumImageUrl: data.item.album.images[1]?.url ?? data.item.album.images[0]?.url,
            songUrl: data.item.external_urls.spotify,
            playedAt: new Date().toISOString(),
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control":
                "public, s-maxage=30, stale-while-revalidate=15",
            },
          }
        );
      }
    }

    // Fall back to recently played
    const recentRes = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, { headers });

    if (recentRes.status === 200) {
      const data = await recentRes.json();
      const item = data.items?.[0];
      if (item) {
        return new Response(
          JSON.stringify({
            isPlaying: false,
            title: item.track.name,
            artist: item.track.artists
              .map((a: { name: string }) => a.name)
              .join(", "),
            album: item.track.album.name,
            albumImageUrl:
              item.track.album.images[1]?.url ?? item.track.album.images[0]?.url,
            songUrl: item.track.external_urls.spotify,
            playedAt: item.played_at,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control":
                "public, s-maxage=30, stale-while-revalidate=15",
            },
          }
        );
      }
    }

    // Nothing found
    return new Response(JSON.stringify({ isPlaying: false }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ isPlaying: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
