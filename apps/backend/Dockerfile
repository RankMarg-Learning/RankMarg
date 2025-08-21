# Use the base turbo image for consistency
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/suggest-engine/package*.json ./packages/suggest-engine/

# Copy Prisma schema first (needed for postinstall script)
COPY packages/db/prisma ./packages/db/prisma

# Install dependencies
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

# Production stage
FROM node:20-alpine AS production

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/db/package*.json ./packages/db/
COPY packages/suggest-engine/package*.json ./packages/suggest-engine/

# Copy Prisma schema first (needed for postinstall script)
COPY packages/db/prisma ./packages/db/prisma

# Install only production dependencies
RUN npm ci --only=production

# Copy built packages from build stage
COPY --from=base /app/packages/db/dist ./packages/db/dist
COPY --from=base /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=base /app/packages/suggest-engine/dist ./packages/suggest-engine/dist

# Copy built backend
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy Prisma schema and generated client
COPY --from=base /app/packages/db/prisma ./packages/db/prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Set working directory to backend
WORKDIR /app/apps/backend

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
