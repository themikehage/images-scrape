# Image Scraper - Agent Instructions

## Descripción

Cloudflare Worker que scrapea imágenes de Bing Image Search con interfaz web de prueba.

## Stack

- Cloudflare Workers (TypeScript)
- HTML/CSS simple (frontend estático)
- Regex-based HTML parsing

## Estructura

```
/
├── src/
│   ├── index.ts      # Worker entry point + routing
│   ├── scraper.ts    # Lógica de scraping de Bing
│   └── types.ts      # Tipos compartidos
├── public/
│   └── index.html    # Frontend de prueba
├── wrangler.toml     # Config Cloudflare
├── package.json
├── tsconfig.json
├── steps.md          # Pasos de deploy
└── agents.md         # Este archivo
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Frontend HTML |
| POST | `/api/scrape` | Scrapea imágenes (body: `{queries: string[], limit?: number}`) |
| GET | `/api/health` | Health check |

## Comandos

```bash
npm run dev       # Desarrollo local (puerto 5100)
npm run deploy    # Deploy a Cloudflare
npm run typecheck # TypeScript check
```

## Scraping

El scraper extrae imágenes de Bing Image Search en dos pasos:
1. **Primario**: Busca elementos `<a class="iusc">` con atributo `m` que contiene JSON con `murl` (URL full-size), `turl` (thumbnail), `desc` (título)
2. **Fallback**: Si no encuentra con el método primario, extrae de `<img class="mimg">` con atributo `src`

## Reglas

- No modificar la lógica de scraping sin probar contra Bing real
- Mantener compatibilidad con Cloudflare Workers (sin dependencias Node.js)
- El frontend debe funcionar sin frameworks
- No usar `axios` o `cheerio` (no funcionan en Workers)
