# Use official Node.js base image
FROM node:20-alpine

# Set root working directory
WORKDIR /app

# Copy root-level dependencies (monorepo setup)
COPY ../../package.json ../../package-lock.json ./

# Copy all apps and packages (backend + shared code)
COPY ../../apps ./apps
COPY ../../packages ./packages

# Install all workspace dependencies
RUN npm install --legacy-peer-deps --workspaces --include-workspace-root

# Change working directory to backend
WORKDIR /app/apps/backend

# Build backend (assumes TypeScript)
RUN npm run build

# Expose backend port (if needed)
EXPOSE 3001

# Run the compiled JS file
CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]
