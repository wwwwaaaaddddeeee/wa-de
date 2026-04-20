import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const res = await fetch(
      "https://api.github.com/repos/wwwwaaaaddddeeee/brianawade/commits?per_page=20",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "brianawade-site",
        },
      }
    );

    if (!res.ok) throw new Error();

    const commits = await res.json();
    const log = commits.map((c: any) => ({
      message: c.commit.message,
      date: c.commit.author.date,
      sha: c.sha.slice(0, 7),
      url: c.html_url,
    }));

    return new Response(JSON.stringify(log), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
