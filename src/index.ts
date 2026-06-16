import { ScrapeRequest, ScrapeResponse } from "./types";
import { scrapeMultiple } from "./scraper";

interface Env {}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_QUERIES = 10;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

async function handleScrape(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  let body: ScrapeRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (
    !body.queries ||
    !Array.isArray(body.queries) ||
    body.queries.length === 0
  ) {
    return errorResponse("queries must be a non-empty array of strings");
  }

  if (body.queries.length > MAX_QUERIES) {
    return errorResponse(`Maximum of ${MAX_QUERIES} queries allowed`);
  }

  for (const q of body.queries) {
    if (typeof q !== "string" || q.trim().length === 0) {
      return errorResponse("Each query must be a non-empty string");
    }
  }

  const limit = body.limit ?? DEFAULT_LIMIT;
  if (typeof limit !== "number" || limit < 1 || limit > MAX_LIMIT) {
    return errorResponse(`limit must be between 1 and ${MAX_LIMIT}`);
  }

  try {
    const results = await scrapeMultiple(body.queries, limit);
    const response: ScrapeResponse = { success: true, results };
    return jsonResponse(response);
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Scraping failed",
      500
    );
  }
}

function handleHealth(): Response {
  return jsonResponse({ status: "ok", timestamp: Date.now() });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case "/api/scrape":
          return await handleScrape(request);
        case "/api/health":
          return handleHealth();
        default:
          return new Response("Not Found", {
            status: 404,
            headers: CORS_HEADERS,
          });
      }
    } catch (err) {
      return errorResponse(
        err instanceof Error ? err.message : "Internal error",
        500
      );
    }
  },
};
