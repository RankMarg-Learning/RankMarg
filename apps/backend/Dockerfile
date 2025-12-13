# ============================================================================
# Stage 1: base - Minimal Node.js base
# ============================================================================
FROM node:20-alpine AS base

# Install minimal dependencies for native modules (no Chromium - not needed for build)
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# ============================================================================
# Stage 2: builder - TS builds, Prisma, turbo
# ============================================================================
FROM base AS builder

# Set working directory
WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/suggest-engine/package*.json ./packages/suggest-engine/

# Copy PDF templates package (no package.json needed, just templates)
COPY packages/pdf-templates ./packages/pdf-templates

# Copy Prisma schema first (needed for postinstall script)
COPY packages/db/prisma ./packages/db/prisma

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy remaining source code for packages
COPY packages/db ./packages/db
COPY packages/suggest-engine ./packages/suggest-engine

# Build packages first
RUN npm run build --workspace=packages/db
RUN npm run build --workspace=@repo/suggest

# Generate Prisma client
RUN npm run db:generate --workspace=packages/db

# Copy backend source code
COPY apps/backend ./apps/backend

# Build backend
RUN npm run build --workspace=backend

# ============================================================================
# Stage 3: deps - OS + system libs (Chromium for runtime only)
# ============================================================================
FROM base AS deps

# Install Chromium and dependencies for puppeteer-core (runtime only)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    && rm -rf /var/cache/apk/*

# ============================================================================
# Stage 4: runtime - minimal Node + deps + dist
# ============================================================================
FROM deps AS runtime

# Set working directory
WORKDIR /app

# Copy package files for production dependency installation
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/suggest-engine/package*.json ./packages/suggest-engine/

# Copy Prisma schema (needed for generation)
COPY packages/db/prisma ./packages/db/prisma

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma client in runtime (cleaner than copying node_modules)
RUN npm run db:generate --workspace=packages/db

# Copy built artifacts from builder stage
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/suggest-engine/dist ./packages/suggest-engine/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy PDF templates package
COPY --from=builder /app/packages/pdf-templates ./packages/pdf-templates

# ============================================================================
# Environment Variables (Centralized)
# ============================================================================
ENV NODE_ENV=production
ENV PORT=3001
# Puppeteer/Chromium configuration for Docker
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# Expose port
EXPOSE 3001

# Set working directory to backend
WORKDIR /app/apps/backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application (direct node execution for reduced overhead)
CMD ["node", "dist/src/index.js"]
