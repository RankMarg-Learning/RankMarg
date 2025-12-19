FROM node:20-alpine AS base

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

FROM base AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/suggest-engine/package*.json ./packages/suggest-engine/

COPY packages/pdf-templates ./packages/pdf-templates

COPY packages/db/prisma ./packages/db/prisma

RUN npm ci

COPY packages/db ./packages/db
COPY packages/suggest-engine ./packages/suggest-engine

RUN npm run build --workspace=packages/db
RUN npm run build --workspace=@repo/suggest

RUN npm run db:generate --workspace=packages/db

COPY apps/backend ./apps/backend

RUN npm run build --workspace=backend

FROM base AS deps

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    && rm -rf /var/cache/apk/*

FROM deps AS runtime

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/suggest-engine/package*.json ./packages/suggest-engine/

COPY packages/db/prisma ./packages/db/prisma

RUN npm ci --omit=dev

RUN npm run db:generate --workspace=packages/db

COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/suggest-engine/dist ./packages/suggest-engine/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

COPY --from=builder /app/packages/pdf-templates ./packages/pdf-templates

ENV NODE_ENV=production
ENV PORT=3001
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

EXPOSE 3001

WORKDIR /app/apps/backend

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/src/index.js"]
