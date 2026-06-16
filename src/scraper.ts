import { ScrappedImage } from "./types.js";

const BING_URL = "https://www.bing.com/images/search";
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
  "https://www.bing.com/images/search?q=demo",
  "https://www.google.com/",
];

interface BingData {
  murl?: string;
  turl?: string;
  desc?: string;
  tit?: string;
  purl?: string;
  w?: number;
  h?: number;
}

function parseBingData(raw: string): BingData | null {
  try {
    const decoded = raw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractFromIusc(html: string, query: string, limit: number): ScrappedImage[] {
  const images: ScrappedImage[] = [];
  const seen = new Set<string>();
  const regex = /<a[^>]+class="[^"]*iusc[^"]*"[^>]*m="([^"]+)"[^>]*>/g;
  let match;

  while ((match = regex.exec(html)) !== null && images.length < limit) {
    const data = parseBingData(match[1]);
    if (!data || !data.murl || seen.has(data.murl)) continue;
    seen.add(data.murl);
    images.push({
      title: data.desc || data.tit || query,
      link: data.murl,
      thumbnail: data.turl || data.murl,
      source: data.purl || "",
      width: data.w,
      height: data.h,
    });
  }

  return images;
}

function randomCvid(): string {
  const chars = "ABCDEF0123456789";
  let id = "";
  for (let i = 0; i < 32; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function fetchBing(
  query: string,
  ua: string,
  referer: string
): Promise<string> {
  const params = new URLSearchParams({
    q: query,
    qs: "n",
    form: "QBIDMH",
    sp: "-1",
    pq: query,
    sc: `10-${query.length}`,
    cvid: randomCvid(),
    ghsh: "0",
    ghacc: "0",
    first: "1",
  });
  const url = `${BING_URL}?${params}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": ua,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Referer: referer,
      DNT: "1",
    },
  });

  if (!response.ok) {
    throw new Error(`Bing returned status ${response.status}`);
  }

  return await response.text();
}

export async function scrapeImages(
  query: string,
  limit: number = 20
): Promise<ScrappedImage[]> {
  let best: ScrappedImage[] = [];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const ua = USER_AGENTS[attempt % USER_AGENTS.length];
    const ref = REFERERS[attempt % REFERERS.length];

    try {
      const html = await fetchBing(query, ua, ref);
      const images = extractFromIusc(html, query, limit);

      if (images.length > best.length) {
        best = images;
      }

      if (images.length >= Math.min(limit, 5)) {
        return images.slice(0, limit);
      }
    } catch {
      // continue to next attempt
    }

    await new Promise((r) => setTimeout(r, attempt * 200 + 500));
  }

  return best.slice(0, limit);
}

export async function scrapeMultiple(
  queries: string[],
  limit: number = 20
): Promise<{ query: string; images: ScrappedImage[]; error?: string }[]> {
  const results: { query: string; images: ScrappedImage[]; error?: string }[] = [];

  for (const query of queries) {
    try {
      const images = await scrapeImages(query, limit);
      results.push({ query, images });
    } catch (err) {
      results.push({
        query,
        images: [],
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}
