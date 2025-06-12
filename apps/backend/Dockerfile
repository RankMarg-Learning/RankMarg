# Alternative Dockerfile - Simpler approach
FROM node:20

# Set workdir at monorepo root
WORKDIR /app

# Copy everything first
COPY . .

# Install dependencies
RUN npm install

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build backend
RUN cd apps/backend && npm run build

# Set working directory to backend
WORKDIR /app/apps/backend

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
# # ---------- Stage 1: Build ----------
#     FROM node:20 AS builder

#     # Set workdir at monorepo root
#     WORKDIR /app
    
#     # Copy package files first for better caching
#     COPY package*.json turbo.json ./
#     COPY apps/backend/package.json ./apps/backend/
#     COPY packages/db/package.json ./packages/db/
    
#     # Install dependencies
#     RUN npm install
    
#     # Copy the entire monorepo source code
#     COPY . .
    
#     # Verify schema file exists (debugging step)
#     RUN ls -la packages/db/prisma/
    
#     # Generate Prisma client from the db package
#     WORKDIR /app/packages/db
#     RUN npx prisma generate
    
#     # Build the backend application
#     WORKDIR /app/apps/backend
#     RUN npm run build
    
#     # ---------- Stage 2: Runtime ----------
#     FROM node:20-alpine AS runner
    
#     # Install necessary packages for Prisma
#     RUN apk add --no-cache openssl

#     # Create non-root user
#     RUN addgroup --system --gid 1001 nodejs
#     RUN adduser --system --uid 1001 backend
    
#     # Set working directory
#     WORKDIR /app
    
#     # Copy package files
#     COPY --from=builder /app/package*.json ./
#     COPY --from=builder /app/apps/backend/package.json ./apps/backend/
#     COPY --from=builder /app/packages/db/package.json ./packages/db/
    
#     # Copy built application and dependencies
#     COPY --from=builder /app/node_modules ./node_modules
#     COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
#     COPY --from=builder /app/apps/backend/package.json ./apps/backend/
#     COPY --from=builder /app/packages ./packages
    
#     # Set backend as working directory
#     WORKDIR /app/apps/backend
    
#     # Expose the backend port
#     EXPOSE 3001
    
#     # Start backend server
#     CMD ["npm", "run", "start"]