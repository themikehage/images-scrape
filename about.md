# images-scrape

**Type:** HOBBY

**Description:** Image search tool that scrapes Bing Image Search with a professional, responsive UI. Features lightbox preview, search history, skeleton loading, and dark overlay hover effects.

**Stack:** Express 5, TypeScript, Bing scraping, Docker, Coolify

---

## Deployment (Coolify)

| Field | Value |
|-------|-------|
| **URL** | `https://image-scraper.pages.therry.dev` |
| **App UUID** | `a123fo7f3u9ijqnkkqzt72kj` |
| **GitHub** | `https://github.com/themikehage/images-scrape` |
| **Branch** | `master` |
| **Build pack** | `nixpacks` (auto-detects Node.js) |
| **Port** | `3000` (configurable via `PORT` env var) |
| **Health check** | `GET /api/health` → expects 200 |

### Build & Start

| | Command |
|---|---|
| **Install** | `npm ci` (auto, dev deps included for build) |
| **Build** | `npm run build` → compiles `src/` → `dist/` via `tsc` |
| **Start** | `node dist/server.js` |

The server serves the frontend via `express.static` from `dist/web/` (Vite output). For development, the frontend lives in `public/index.html` (standalone HTML/CSS/JS - no framework).

### Environment Variables

| Var | Default | Notes |
|-----|---------|-------|
| `PORT` | `3000` | Server listen port |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (`{"status":"ok"}`) |
| `POST` | `/api/scrape` | Bing image search |

**`POST /api/scrape`** request body:
```json
{
  "queries": ["roma", "paris"],
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "query": "roma",
      "images": [
        {
          "title": "Colosseum",
          "link": "https://...",
          "thumbnail": "https://ts4.mm.bing.net/...",
          "source": "https://..."
        }
      ],
      "error": null
    }
  ]
}
```

- `limit` per query, max 50
- `queries` array supports multiple terms (each gets its own result group)

### Redeploy

```bash
COOLIFY_URL="https://pages.therry.dev/api/v1"
COOLIFY_TOKEN="<token>"
curl -s -X POST "$COOLIFY_URL/applications/a123fo7f3u9ijqnkkqzt72kj/start" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"
```

---

## Local Development

```bash
# Install
npm install --include=dev

# Dev server (auto-reload with tsx)
npm run dev:server

# Build
npm run build

# Run compiled version
node dist/server.js
```

## Image Search Skill

A CLI skill (`image-search`) is installed at:
```
~/.config/opencode/skills/image-search/
```

It wraps this API for searching images directly from the terminal:
```bash
image-search search "very specific query" --limit=5 --format=markdown
```
