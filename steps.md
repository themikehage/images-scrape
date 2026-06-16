# Steps - Image Scraper

## Requisitos

- Node.js 18+
- Cuenta de Cloudflare
- Token API de Cloudflare (`wrangler login` o `CLOUDFLARE_API_TOKEN`)

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
# Iniciar servidor dev (puerto 5100)
npm run dev

# Probar:
#   GET  http://localhost:5100/api/health
#   POST http://localhost:5100/api/scrape
#   GET  http://localhost:5100/ (frontend HTML)
```

## Verificación local

```bash
# Health check
curl http://localhost:5100/api/health

# Scrape test
curl -X POST http://localhost:5100/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"queries":["roma","tokio"],"limit":5}'
```

## Deploy a Cloudflare

```bash
# 1. Login (si no está autenticado)
npx wrangler login

# 2. Deploy
npm run deploy
```

## Uso del worker desplegado

```bash
# URL base (ejemplo)
WORKER_URL=https://image-scraper.<tu-subdominio>.workers.dev

# Health check
curl $WORKER_URL/api/health

# Scrape
curl -X POST $WORKER_URL/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"queries":["roma","parís","tokio"],"limit":12}'

# Frontend
abrir $WORKER_URL/ en el navegador
```

## Verificar logs

```bash
npx wrangler tail image-scraper
```

## Actualizar

```bash
# Después de cambios
npm run deploy
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `Missing bindings` | No es un error real, el worker no necesita bindings |
| `429 Too Many Requests` | Reducir `limit` o espaciar consultas |
| `Bing returned status 503` | Bing bloqueó el request; probar con diferente User-Agent |
| El frontend no carga | Verificar que `public/index.html` existe y wrangler.toml tiene `[assets]` |
