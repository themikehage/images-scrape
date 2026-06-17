import { VideoResult } from "./types.js";

const BING_URL = "https://www.bing.com/videos/search";
const MAX_RETRIES = 12;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
];

const REFERERS = [
  "https://www.bing.com/",
  "https://www.bing.com/videos/search?q=demo",
  "https://www.google.com/",
];

function randomCvid(): string {
  const chars = "ABCDEF0123456789";
  let id = "";
  for (let i = 0; i < 32; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function fetchBing(query: string, ua: string, referer: string): Promise<string> {
  const params = new URLSearchParams({
    q: query,
    qs: "n",
    form: "QBVR",
    sp: "-1",
    pq: query,
    sc: `10-${query.length}`,
    cvid: randomCvid(),
  });
  const url = `${BING_URL}?${params}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": ua,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Referer: referer,
      DNT: "1",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Bing returned status ${response.status}`);
  }

  return await response.text();
}

function extractVideos(html: string, query: string, limit: number): VideoResult[] {
  const results: VideoResult[] = [];
  const seen = new Set<string>();

  const linkRegex = /<a[^>]+class="[^"]*mc_vtvc_link[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null && results.length < limit) {
    const block = match[1];

    const ourlMatch = block.match(/ourl="([^"]+)"/);
    if (!ourlMatch) continue;

    const url = ourlMatch[1];
    if (seen.has(url)) continue;
    seen.add(url);

    const titleMatch = block.match(/mc_vtvc_title[^>]*title="([^"]*)"/);
    const title = titleMatch ? titleMatch[1] : query;

    const thumbMatch = block.match(/data-src-hq="([^"]+)"/);
    const thumbnail = thumbMatch ? thumbMatch[1].replace(/&amp;/g, "&") : "";

    const durationMatch = block.match(/<div[^>]+class="mc_bc_rc items[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const duration = durationMatch ? durationMatch[1].trim() : "";

    const sourceMatch = block.match(/<span[^>]+class="[^"]*srcttl[^"]*"[^>]*>([\s\S]*?)<\/span>/);
    const source = sourceMatch
      ? sourceMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    const channelMatch = block.match(/mc_vtvc_meta_row_channel[^>]*>([\s\S]*?)<\/span>/);
    const channel = channelMatch
      ? channelMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    const viewsMatch = block.match(/meta_vc_content[^>]*>([\s\S]*?)</);
    const views = viewsMatch ? viewsMatch[1].trim() : "";

    results.push({ title, url, thumbnail, duration, source, channel, views });
  }

  return results;
}

export async function scrapeVideos(
  query: string,
  limit: number = 10,
  region?: string
): Promise<VideoResult[]> {
  let best: VideoResult[] = [];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const ua = USER_AGENTS[attempt % USER_AGENTS.length];
    const ref = REFERERS[attempt % REFERERS.length];

    try {
      const html = await fetchBing(query, ua, ref);
      const videos = extractVideos(html, query, limit);

      if (videos.length > best.length) {
        best = videos;
      }

      if (videos.length >= Math.min(limit, 5)) {
        return videos.slice(0, limit);
      }
    } catch {
      // continue
    }

    await new Promise((r) => setTimeout(r, attempt * 200 + 500));
  }

  return best.slice(0, limit);
}

export async function scrapeVideoMultiple(
  queries: string[],
  limit: number = 10,
  region?: string
): Promise<{ query: string; results: VideoResult[]; error?: string }[]> {
  const results: { query: string; results: VideoResult[]; error?: string }[] = [];

  for (const query of queries) {
    try {
      const videos = await scrapeVideos(query, limit, region);
      results.push({ query, results: videos });
    } catch (err) {
      results.push({
        query,
        results: [],
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}
