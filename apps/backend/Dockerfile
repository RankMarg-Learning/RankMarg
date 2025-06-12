# ---------- Stage 1: Build ----------
    FROM node:20 AS builder

    # Set workdir at monorepo root
    WORKDIR /app
    
    # Copy root package files for dependency resolution
    COPY ../../package.json ../../package-lock.json ../../turbo.json ./
    COPY ../../apps/backend/package.json ./apps/backend/
    COPY ../../packages/db/package.json ./packages/db/
    
    # Install all dependencies (monorepo-aware)
    RUN npm install
    
    # Copy the entire monorepo
    COPY ../../ .
    
    # Generate Prisma client from shared schema
    RUN npm run generate --workspace=apps/backend
    
    # Compile TypeScript in backend
    RUN npm run build --workspace=apps/backend
    
    
    # ---------- Stage 2: Runtime ----------
    FROM node:20-alpine AS runner
    
    # Set working directory
    WORKDIR /app
    
    # Copy backend build and node_modules
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/apps/backend ./apps/backend
    COPY --from=builder /app/packages ./packages
    
    # Set backend as working directory
    WORKDIR /app/apps/backend
    
    # Expose the backend port
    EXPOSE 8080
    
    # Start backend server
    CMD ["npm", "run", "start"]
    