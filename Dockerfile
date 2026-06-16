FROM node:20-alpine AS web-builder
WORKDIR /app
COPY src/web/package*.json ./
RUN npm ci
COPY src/web/ ./
RUN npx vite build --outDir ../dist/web

FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=server-builder /app/dist ./dist
COPY --from=web-builder /app/dist/web ./dist/web
EXPOSE 3000
CMD ["node", "dist/server.js"]
