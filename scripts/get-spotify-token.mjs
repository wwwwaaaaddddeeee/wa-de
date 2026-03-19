import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env manually
const envPath = resolve(process.cwd(), ".env");
let clientId, clientSecret;

try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const [key, ...rest] = line.split("=");
    const val = rest.join("=").trim();
    if (key.trim() === "SPOTIFY_CLIENT_ID") clientId = val;
    if (key.trim() === "SPOTIFY_CLIENT_SECRET") clientSecret = val;
  }
} catch {
  console.error("Could not read .env file. Create one with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.");
  process.exit(1);
}

if (!clientId || !clientSecret) {
  console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
  process.exit(1);
}

const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const SCOPES = "user-read-currently-playing user-read-recently-played";

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  }).toString();

console.log("\n🎵 Spotify Token Helper\n");
console.log("Open this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback...\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3000");

  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing code parameter");
    return;
  }

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();

    if (data.refresh_token) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Done! Check your terminal.</h1><p>You can close this tab.</p>");

      console.log("✅ Got your refresh token!\n");
      console.log("Add this to your .env file:\n");
      console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
    } else {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>Error</h1><pre>" + JSON.stringify(data, null, 2) + "</pre>");
      console.error("Error from Spotify:", data);
    }
  } catch (err) {
    res.writeHead(500);
    res.end("Token exchange failed");
    console.error("Token exchange failed:", err);
  }

  setTimeout(() => {
    server.close();
    process.exit(0);
  }, 1000);
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000 for callback...");
});
