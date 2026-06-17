import { WebResult } from "./types.js";

const BING_URL = "https://www.bing.com/search";
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
  "https://www.bing.com/search?q=demo",
  "https://www.google.com/",
];

function randomCvid(): string {
  const chars = "ABCDEF0123456789";
  let id = "";
  for (let i = 0; i < 32; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const DEFAULT_REGION = process.env.BING_REGION || "us";
const DEFAULT_LANG = process.env.BING_LANG || "en";

function regionLang(region: string): { cc: string; lang: string } {
  const map: Record<string, { cc: string; lang: string }> = {
    us: { cc: "us", lang: "en" },
    es: { cc: "es", lang: "es" },
    mx: { cc: "mx", lang: "es" },
    ar: { cc: "ar", lang: "es" },
    uk: { cc: "gb", lang: "en-GB" },
    de: { cc: "de", lang: "de" },
    fr: { cc: "fr", lang: "fr" },
    it: { cc: "it", lang: "it" },
    br: { cc: "br", lang: "pt-BR" },
    jp: { cc: "jp", lang: "ja" },
  };
  return map[region.toLowerCase()] || { cc: DEFAULT_REGION, lang: DEFAULT_LANG };
}

async function fetchBing(query: string, ua: string, referer: string, region?: string): Promise<string> {
  const loc = regionLang(region || DEFAULT_REGION);
  const params = new URLSearchParams({
    q: query,
    qs: "n",
    form: "QBLH",
    sp: "-1",
    pq: query,
    sc: `10-${query.length}`,
    cvid: randomCvid(),
    cc: loc.cc,
    setlang: loc.lang,
  });
  const url = `${BING_URL}?${params}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": ua,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": `${loc.lang},${loc.lang.split("-")[0]};q=0.5`,
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

function cleanCiteUrl(cite: string): string {
  return cite
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .replace(/ \u203A /g, "/")
    .replace(/ \u00BB /g, "/")
    .replace(/ \u203A$/, "")
    .replace(/ \u00BB$/, "")
    .trim();
}

function extractWebResults(html: string, query: string, limit: number): WebResult[] {
  const results: WebResult[] = [];
  const seen = new Set<string>();

  const algoRegex = /<li[^>]+class="[^"]*b_algo[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let match;

  while ((match = algoRegex.exec(html)) !== null && results.length < limit) {
    const li = match[1];

    const h2Match = li.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (!h2Match) continue;

    const aMatch = h2Match[1].match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!aMatch) continue;

    const href = aMatch[1];
    const title = aMatch[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

    if (!title) continue;

    const citeMatch = li.match(/<cite[^>]*>([\s\S]*?)<\/cite>/);
    let url: string;
    if (citeMatch) {
      url = cleanCiteUrl(citeMatch[1]);
    } else {
      url = href;
    }

    if (!url || seen.has(url)) continue;
    seen.add(url);

    let snippet = "";
    const capMatch = li.match(/<div[^>]*class="[^"]*b_caption[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (capMatch) {
      const pMatch = capMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (pMatch) {
        snippet = pMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .replace(/&quot;/g, "\"")
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/&nbsp;/g, " ")
          .trim();
      }
    }

    results.push({ title, url, snippet });
  }

  return results;
}

export async function scrapeWeb(
  query: string,
  limit: number = 10,
  region?: string
): Promise<WebResult[]> {
  let best: WebResult[] = [];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const ua = USER_AGENTS[attempt % USER_AGENTS.length];
    const ref = REFERERS[attempt % REFERERS.length];

    try {
      const html = await fetchBing(query, ua, ref, region);
      const results = extractWebResults(html, query, limit);

      if (results.length > best.length) {
        best = results;
      }

      if (results.length >= Math.min(limit, 5)) {
        return results.slice(0, limit);
      }
    } catch {
      // continue to next attempt
    }

    await new Promise((r) => setTimeout(r, attempt * 200 + 500));
  }

  return best.slice(0, limit);
}

export async function scrapeWebMultiple(
  queries: string[],
  limit: number = 10,
  region?: string
): Promise<{ query: string; results: WebResult[]; error?: string }[]> {
  const results: { query: string; results: WebResult[]; error?: string }[] = [];

  for (const query of queries) {
    try {
      const webResults = await scrapeWeb(query, limit, region);
      results.push({ query, results: webResults });
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
