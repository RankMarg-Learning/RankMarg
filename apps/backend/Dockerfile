########## Multi-stage production Dockerfile for backend ##########

# ---------- Stage 1: Builder ----------
FROM node:20 AS builder

# Work at monorepo root
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/suggest-engine/package.json ./packages/suggest-engine/package.json

# Copy Prisma schema
COPY packages/db/prisma ./packages/db/prisma

# Install dependencies
RUN npm ci
RUN npm install --workspace=apps/backend

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/db && npm run db:generate

# Build packages
RUN npm run build --workspace=packages/suggest-engine
RUN npm run backend:build

# ---------- Stage 2: Runner ----------
FROM node:20-alpine AS runner

# Install required system packages
RUN apk add --no-cache openssl curl

ENV NODE_ENV=production

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/docker-entrypoint.sh ./docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./docker-entrypoint.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT:-3001}/healthz || exit 1

# Run entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]


