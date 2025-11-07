# Production Dockerfile for apps/frontend (Next.js standalone)

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
# Leverage workspace-aware caching
COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/suggest-engine/package.json packages/suggest-engine/package.json
RUN npm ci --include=dev --ignore-scripts

FROM deps AS build
WORKDIR /app
COPY . .

# Build-time args for Next
ARG NEXT_PUBLIC_WS_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG JWT_SECRET
ARG NEXTAUTH_JWT_SECRET
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASSWORD
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET
ARG ADMIN_API_KEY
ARG RAZORPAY_KEY_ID
ARG RAZORPAY_KEY_SECRET
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG RAZORPAY_WEBHOOK_SECRET

ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    JWT_SECRET=$JWT_SECRET \
    NEXTAUTH_JWT_SECRET=$NEXTAUTH_JWT_SECRET \
    SMTP_HOST=$SMTP_HOST \
    SMTP_PORT=$SMTP_PORT \
    SMTP_USER=$SMTP_USER \
    SMTP_PASSWORD=$SMTP_PASSWORD \
    CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME \
    CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY \
    CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET \
    ADMIN_API_KEY=$ADMIN_API_KEY \
    RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID \
    RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    RAZORPAY_WEBHOOK_SECRET=$RAZORPAY_WEBHOOK_SECRET \
    NEXT_TELEMETRY_DISABLED=1

# Prisma client may be required by shared packages during Next build
ARG DATABASE_URL="postgresql://user:password@localhost:5432/app?schema=public"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

RUN npx turbo run build --filter=pre-dev...

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000

COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./.next/static
COPY --from=build /app/apps/frontend/public ./public

EXPOSE 3000
CMD ["node", "server.js"]


# Development stage for local dev (use with --target dev)
FROM node:20-alpine AS dev
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=development \
    PORT=3000 \
    WATCHPACK_POLLING=1 \
    CHOKIDAR_USEPOLLING=1
EXPOSE 3000
CMD sh -c "npm install --include=dev --ignore-scripts --no-audit --no-fund && npm run dev --workspace=apps/frontend"


