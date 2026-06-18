# Extensible Search Verticals

## Problem

Each Bing search vertical (images, web, videos) duplicates fetch logic, UA rotation, retry logic, and response types. Adding new verticals (news, shopping) would multiply this duplication.

## Solution

Extract shared HTTP client into `bing-client.ts`. Each vertical becomes a thin parser module under `parsers/`.

## Architecture

```
src/
├── bing-client.ts     Shared: fetch, retry loop, UA rotation, params builder
├── types.ts           All response types
├── parsers/
│   ├── images.ts      Image search parser (existing scraper.ts logic)
│   ├── web.ts         Web search parser (existing web-scraper.ts logic)
│   ├── videos.ts      Video search parser (existing video-scraper.ts logic)
│   ├── news.ts        NEW: Bing News parser
│   └── shopping.ts    NEW: Bing Shopping parser
├── server.ts          Endpoints (unchanged structure)
```

## bing-client.ts API

```typescript
// Fetch and retry with UA rotation
function scrapeWithRetry<T>(
  query: string,
  endpoint: string,        // e.g. "/images/search", "/news/search"
  buildParams: (q: string) => URLSearchParams,
  parse: (html: string, query: string, limit: number) => T[],
  limit?: number,
  region?: string
): Promise<T[]>
```

## Parser Interface

Each parser module exports:
- `buildParams(query: string): URLSearchParams` — query params for this vertical
- `parse(html: string, query: string, limit: number): ResultType[]` — HTML extraction
- `scrapeMultiple(queries, limit, region?)` — batch entry point (standardized)
- Typed interfaces (or reuses existing types)

## Changes

### Backend
- Extract `bing-client.ts` from scraper.ts patterns
- Convert web-scraper.ts → parsers/web.ts, video-scraper.ts → parsers/videos.ts
- Create parsers/news.ts and parsers/shopping.ts
- Keep old scraper.ts (images) for backward compat or convert it too
- Add `/api/news-search` and `/api/shopping-search` to server.ts

### Frontend
- Add "News" and "Shopping" mode buttons
- Add news results rendering (list with headline, source, date, snippet)
- Add shopping results rendering (grid with product image, price, merchant)

### Types (types.ts)
- Add `NewsResult`, `NewsSearchResult`, `NewsSearchResponse`
- Add `ShoppingResult`, `ShoppingSearchResult`, `ShoppingSearchResponse`
