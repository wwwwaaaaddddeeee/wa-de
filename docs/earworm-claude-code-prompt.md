# Claude Code Prompt — Earworm + Minimal Portfolio

Copy everything below the line into Claude Code.

---

## Project: hellowade.dev — Minimal Portfolio + Earworm (Spotify Widget)

### Context

I'm building an extremely minimal personal portfolio site. The entire site is one centered page: a short bio, social icons, and a "now playing / last listened" Spotify widget I'm calling **Earworm**. That's it. Everything centered, small, tight. The visual design will be handled separately in Figma — right now I just need the functional skeleton wired up and working.

### Stack

- **Astro** (latest) with React integration for interactive components
- **Tailwind CSS** for utility styling
- **TypeScript**
- Deploy target: **Vercel** (via `@astrojs/vercel` adapter)
- Domain: `hellowade.dev`

### What to build

#### 1. Astro project scaffold

Initialize a new Astro project with:
- React integration (`@astrojs/react`)
- Tailwind CSS integration (`@astrojs/tailwind`)
- Vercel adapter (`@astrojs/vercel`) configured for hybrid rendering (static by default, server endpoints where needed)
- TypeScript strict mode

#### 2. Single page layout (`src/pages/index.astro`)

A single centered page with three sections stacked vertically and centered both horizontally and vertically (or near-center, slight upward bias is fine):

- **Name/bio area** — just a heading and a short paragraph. Placeholder text is fine, I'll fill it in. Use semantic HTML.
- **Social links** — a horizontal row of icon links. Include placeholders for: GitHub, X/Twitter, LinkedIn, Dribbble, and email (mailto). Use simple SVG icons or lucide icons. Each link opens in a new tab.
- **Earworm widget** — the Spotify component (React island, hydrated with `client:visible`)

Keep the layout dead simple. No nav, no footer, no header. Just the centered content block. Use Tailwind for layout (flexbox/grid centering, spacing). Don't over-design — I'll handle the visual polish in Figma and come back to refine.

#### 3. Earworm component (`src/components/Earworm.tsx`)

A React component that displays what I'm currently listening to (or last listened to) on Spotify.

**Data it should display:**
- Album art (image)
- Track name
- Artist name
- "Listening now" indicator (green dot or similar) when actively playing, or "Last played" with a relative timestamp when not
- The whole thing should link to the track on Spotify (opens in new tab)

**Behavior:**
- On mount, fetch from the local API endpoint `/api/spotify/now-playing`
- Poll every 30 seconds for updates
- Handle loading state (skeleton/shimmer or simple placeholder)
- Handle error/empty state gracefully (hide the widget or show a subtle fallback, don't show an ugly error)
- Clean up the polling interval on unmount

**Styling notes:**
- Use Tailwind classes
- Design it as a compact horizontal pill/card shape (album art on the left, text on the right)
- Dark background assumed for now (`bg-neutral-900` or similar)
- Monospace font for text (`font-mono`)
- Keep it minimal — no fancy animations yet, just functional

#### 4. Spotify API route (`src/pages/api/spotify/now-playing.ts`)

A server endpoint that handles the Spotify integration. This is the backend piece.

**Flow:**
1. Use a stored refresh token to request a fresh access token from Spotify's token endpoint
2. Try the "currently playing" endpoint first (`/v1/me/player/currently-playing`)
3. If nothing is playing (204 response), fall back to "recently played" (`/v1/me/player/recently-played?limit=1`)
4. Return a normalized JSON response

**Response shape:**
```typescript
interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  playedAt: string; // ISO timestamp
}
```

Return this JSON with appropriate cache headers (`Cache-Control: public, s-maxage=30, stale-while-revalidate=15`).

If both endpoints return nothing, return `{ isPlaying: false }` with a 200 status.

**Environment variables needed:**
```
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN
```

Read these from `import.meta.env` (Astro's env access pattern). Add a `.env.example` file documenting all three.

#### 5. Spotify OAuth setup helper

Create a file at `scripts/get-spotify-token.mjs` — a standalone Node script that walks me through the OAuth flow to get my refresh token. It should:

1. Read `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from a `.env` file (using dotenv or manual parsing)
2. Print the authorization URL I need to open in my browser (with scopes: `user-read-currently-playing` and `user-read-recently-played`, redirect URI: `http://localhost:3000/callback`)
3. Spin up a tiny HTTP server on port 3000 that catches the callback
4. Automatically exchange the authorization code for tokens
5. Print the refresh token to the console and tell me to add it to `.env`
6. Shut down the server

This way I don't have to manually curl anything. Just run `node scripts/get-spotify-token.mjs` and follow the prompts.

### File structure

```
hellowade.dev/
├── src/
│   ├── components/
│   │   └── Earworm.tsx
│   ├── layouts/
│   │   └── Layout.astro        # base HTML shell, meta tags, font imports
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       └── spotify/
│   │           └── now-playing.ts
│   └── styles/
│       └── global.css           # Tailwind directives + any base styles
├── scripts/
│   └── get-spotify-token.mjs
├── public/
│   └── favicon.svg              # placeholder
├── .env.example
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

### What NOT to do

- Don't over-design the UI. Placeholder-quality styling is fine. I'm handling visual design in Figma.
- Don't add pages beyond index. Single page only.
- Don't add a CMS, blog, or any content management.
- Don't add analytics, SEO optimization, or sitemap generation yet.
- Don't add dark/light mode toggle — it's dark mode only for now.
- Don't use any component libraries (no shadcn, no Radix). Pure Tailwind.
- Don't add page transitions or complex animations.
