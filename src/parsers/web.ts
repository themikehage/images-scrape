import { WebResult } from "../types.js";
import { scrapeWithRetry, scrapeMultiple, BingParams } from "../bing-client.js";

const BING_URL = "https://www.bing.com/search";

const WEB_PARAMS: BingParams = {
  baseUrl: BING_URL,
  form: "QBLH",
};

function decodeBingUrl(href: string): string | null {
  const uMatch = href.match(/[?&]u=([^&]+)/);
  if (!uMatch) return null;
  try {
    const b64 = uMatch[1].slice(2);
    const pad = 4 - (b64.length % 4);
    const decoded = Buffer.from(b64 + (pad === 4 ? "" : "=".repeat(pad)), "base64").toString("utf-8");
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    }
  } catch {}
  return null;
}

function extractWebResults(html: string, _query: string, limit: number): WebResult[] {
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

    let url = decodeBingUrl(href);
    if (!url) {
      const citeMatch = li.match(/<cite[^>]*>([\s\S]*?)<\/cite>/);
      url = citeMatch
        ? citeMatch[1]
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .replace(/ \u203A /g, "/")
            .replace(/ \u00BB /g, "/")
            .replace(/ \u203A$/, "")
            .replace(/ \u00BB$/, "")
            .trim()
        : href;
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
          .replace(/&quot;/g, '"')
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
  const params = { ...WEB_PARAMS, region };
  return scrapeWithRetry(
    query,
    params,
    (html) => extractWebResults(html, query, limit),
    limit
  );
}

export async function scrapeWebMultiple(
  queries: string[],
  limit: number = 10,
  region?: string
): Promise<{ query: string; results: WebResult[]; error?: string }[]> {
  const params = { ...WEB_PARAMS, region };
  return scrapeMultiple(queries, params, (html) => extractWebResults(html, "", limit), limit);
}
