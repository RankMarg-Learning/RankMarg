########## Multi-stage production Dockerfile for backend ##########

# ---------- Stage 1: Builder ----------
FROM node:20 AS builder

# Work at monorepo root
WORKDIR /app

# Copy manifests first for better caching
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/suggest-engine/package.json ./packages/suggest-engine/package.json

# Install all workspace dependencies
RUN npm ci

# Copy the entire monorepo
COPY . .

# Generate Prisma client (targets include linux-musl)
RUN npm run db:generate

# Build internal packages needed at runtime
RUN npm run build --workspace=packages/suggest-engine

# Build backend (TypeScript -> dist)
RUN npm run backend:build

# Prune dev dependencies to shrink runtime layer
RUN npm prune --omit=dev


# ---------- Stage 2: Runner ----------
FROM node:20-alpine AS runner

# Prisma on Alpine requires openssl; curl for healthcheck
RUN apk add --no-cache openssl curl

ENV NODE_ENV=production

WORKDIR /app

# Copy only what we need for runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/packages ./packages
COPY apps/backend/docker-entrypoint.sh ./apps/backend/docker-entrypoint.sh

# Ensure entrypoint is executable
RUN chmod +x ./apps/backend/docker-entrypoint.sh

# Set backend working directory
WORKDIR /app/apps/backend

# Expose backend port (defaults to 3001 in code)
EXPOSE 3001

# Basic healthcheck (simple, does not depend on Redis)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT:-3001}/healthz || exit 1

# Run migrations then start server
ENTRYPOINT ["/app/apps/backend/docker-entrypoint.sh"]


