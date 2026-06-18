import { NewsResult } from "../types.js";
import { scrapeWithRetry, scrapeMultiple, BingParams } from "../bing-client.js";

const BING_URL = "https://www.bing.com/news/search";

const NEWS_PARAMS: BingParams = {
  baseUrl: BING_URL,
  form: "QBNH",
};

function extractNews(html: string, _query: string, limit: number): NewsResult[] {
  const results: NewsResult[] = [];
  const seen = new Set<string>();

  const cardRegex = /<div[^>]+class="news-card newsitem cardcommon"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  let match;

  while ((match = cardRegex.exec(html)) !== null && results.length < limit) {
    const full = match[0];

    const urlMatch = full.match(/data-url="([^"]+)"/);
    if (!urlMatch) continue;
    const url = urlMatch[1];
    if (seen.has(url)) continue;
    seen.add(url);

    const titleMatch = full.match(/data-title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!title) continue;

    const authorMatch = full.match(/data-author="([^"]*)"/);
    const source = authorMatch ? authorMatch[1] : "";

    const thumbMatch = full.match(/data-src-hq="([^"]+)"/);
    const thumbnail = thumbMatch ? "https:" + thumbMatch[1] : "";

    const snippetMatch = full.match(/<div[^>]*class="snippet[^"]*"[^>]*title="([^"]*)"/);
    const snippet = snippetMatch ? snippetMatch[1] : "";

    const dateMatch = full.match(/aria-label="([^"]*(?:day|hour|minute|week|month|year)[^"]*)"/);
    const date = dateMatch ? dateMatch[1] : "";

    results.push({ title, url, source, snippet, date, thumbnail });
  }

  return results;
}

export async function scrapeNews(
  query: string,
  limit: number = 10,
  region?: string
): Promise<NewsResult[]> {
  return scrapeWithRetry(
    query,
    { ...NEWS_PARAMS, region },
    (html) => extractNews(html, query, limit),
    limit
  );
}

export async function scrapeNewsMultiple(
  queries: string[],
  limit: number = 10,
  region?: string
): Promise<{ query: string; results: NewsResult[]; error?: string }[]> {
  return scrapeMultiple(
    queries,
    { ...NEWS_PARAMS, region },
    (html) => extractNews(html, "", limit),
    limit
  );
}
