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

const DEFAULT_REGION = process.env.BING_REGION || "us";
const DEFAULT_LANG = process.env.BING_LANG || "en";

function randomCvid(): string {
  const chars = "ABCDEF0123456789";
  let id = "";
  for (let i = 0; i < 32; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

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

export interface BingParams {
  baseUrl: string;
  form: string;
  region?: string;
  extraParams?: Record<string, string>;
  referers?: string[];
}

export async function scrapeWithRetry<T>(
  query: string,
  params: BingParams,
  extractFn: (html: string) => T[],
  limit: number = 10
): Promise<T[]> {
  let best: T[] = [];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const ua = USER_AGENTS[attempt % USER_AGENTS.length];
    const refs = params.referers || REFERERS;
    const referer = refs[attempt % refs.length];
    const loc = params.region ? regionLang(params.region) : null;

    try {
      const sp = new URLSearchParams({
        q: query,
        qs: "n",
        form: params.form,
        sp: "-1",
        pq: query,
        sc: `10-${query.length}`,
        cvid: randomCvid(),
      });

      if (loc) {
        sp.set("cc", loc.cc);
        sp.set("setlang", loc.lang);
      }

      if (params.extraParams) {
        for (const [k, v] of Object.entries(params.extraParams)) {
          sp.set(k, v);
        }
      }

      const url = `${params.baseUrl}?${sp}`;

      const acceptLanguage = loc
        ? `${loc.lang},${loc.lang.split("-")[0]};q=0.5`
        : "en-US,en;q=0.5";

      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": acceptLanguage,
          Referer: referer,
          DNT: "1",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) throw new Error(`Bing returned status ${res.status}`);

      const html = await res.text();
      const results = extractFn(html);

      if (results.length > best.length) best = results;

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

export async function scrapeMultiple<T>(
  queries: string[],
  params: BingParams,
  extractFn: (html: string) => T[],
  limit: number = 10
): Promise<{ query: string; results: T[]; error?: string }[]> {
  const results: { query: string; results: T[]; error?: string }[] = [];

  for (const query of queries) {
    try {
      const items = await scrapeWithRetry(query, params, extractFn, limit);
      results.push({ query, results: items });
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
