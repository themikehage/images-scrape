import { VideoResult } from "../types.js";
import { scrapeWithRetry, scrapeMultiple, BingParams } from "../bing-client.js";

const BING_URL = "https://www.bing.com/videos/search";

const VIDEO_PARAMS: BingParams = {
  baseUrl: BING_URL,
  form: "QBVR",
  referers: [
    "https://www.bing.com/",
    "https://www.bing.com/videos/search?q=demo",
    "https://www.google.com/",
  ],
};

function extractVideos(html: string, _query: string, limit: number): VideoResult[] {
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
    const title = titleMatch ? titleMatch[1] : _query;

    const thumbMatch = block.match(/data-src-hq="([^"]+)"/);
    const thumbnail = thumbMatch ? thumbMatch[1].replace(/&amp;/g, "&") : "";

    const durationMatch = block.match(/<div[^>]+class="mc_bc_rc items[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const duration = durationMatch ? durationMatch[1].trim() : "";

    const sourceMatch = block.match(/<span[^>]+class="[^"]*srcttl[^"]*"[^>]*>([\s\S]*?)<\/span>/);
    const source = sourceMatch ? sourceMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    const channelMatch = block.match(/mc_vtvc_meta_row_channel[^>]*>([\s\S]*?)<\/span>/);
    const channel = channelMatch ? channelMatch[1].replace(/<[^>]+>/g, "").trim() : "";

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
  return scrapeWithRetry(
    query,
    { ...VIDEO_PARAMS, region },
    (html) => extractVideos(html, query, limit),
    limit
  );
}

export async function scrapeVideoMultiple(
  queries: string[],
  limit: number = 10,
  region?: string
): Promise<{ query: string; results: VideoResult[]; error?: string }[]> {
  return scrapeMultiple(
    queries,
    { ...VIDEO_PARAMS, region },
    (html) => extractVideos(html, "", limit),
    limit
  );
}
