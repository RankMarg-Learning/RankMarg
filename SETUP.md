# RankMarg Setup Guide

This guide walks you through preparing a local RankMarg environment, configuring shared services, and running the individual applications that live inside the monorepo.

---

## 1. Repository Overview

- **Package manager**: `npm@10.8.2` with [Turborepo](https://turbo.build) orchestrating workspace tasks (`apps/*`, `packages/*`).
- **Applications**:
  - `apps/backend`: Express API, cron jobs, OAuth callbacks, webhooks.
  - `apps/frontend`: Student-facing Next.js app.
  - `apps/admin`: Admin/ops Next.js app.
- **Shared packages**:
  - `packages/db`: Prisma schema + generated client exposed as `@repo/db`.
  - `packages/common-ui`, `packages/common-utils`, `packages/curriculum`, `packages/suggest-engine`, `packages/eslint-config`, `packages/typescript-config`.
- **External services**: PostgreSQL, Redis/Upstash, Firebase (client SDK), Cloudinary, AWS S3, Razorpay, Google OAuth, Resend, OpenAI.

Keep the repository at `/Users/aniket/Downloads/RankMarg1/RankMarg` as referenced in this guide, or adjust commands accordingly.

---

## 2. Prerequisites

| Requirement | Recommended Version | Notes |
|-------------|---------------------|-------|
| Node.js     | v18.19 or newer     | Matches `"engines": { "node": ">=18" }` in `package.json`. |
| npm         | v10.8.2             | Installed automatically with Node 20+, but pin via `corepack enable` if needed. |
| Git         | Latest stable       | Required for cloning + submodules (none currently). |
| PostgreSQL  | 14+                 | Prisma datasource uses `postgresql` (`DATABASE_URL`). |
| Redis       | 6+                  | Used for sessions, caching, cron jobs (`REDIS_URL`, `REDIS_URL_FRONTEND`). |
| Docker (optional) | 24+          | For container builds using `apps/*/Dockerfile` or `docker/base/*`. |
| OpenSSL 1.1/3 runtime |           | Needed because Prisma client is generated for `debian-openssl-1.1.x` and `3.0.x`. |

Optional but recommended:

- Upstash or self-hosted Redis for production-like environments (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
- Cloud provider accounts (Cloudinary, AWS S3, Razorpay, Resend, Firebase, Google OAuth, OpenAI) if you want to exercise every feature locally.

---

## 3. Bootstrap the Workspace

1. **Clone the repo**
   ```bash
   git clone git@github.com:RankMarg/RankMarg.git /Users/aniket/Downloads/RankMarg1/RankMarg
   cd /Users/aniket/Downloads/RankMarg1/RankMarg
   ```

2. **Create the shared `.env` before installing dependencies**

   `npm install` triggers the root `postinstall` script, which runs `npm run db:generate` (Prisma). That command requires a reachable `DATABASE_URL`. Create the `.env` file described in section 4 first (at least `DATABASE_URL` pointing to a running PostgreSQL instance) to avoid install failures.

3. **Install dependencies**
   ```bash
   npm install
   ```

   Turborepo will build packages as needed. Expect the initial install to take longer because Prisma needs to download platform-specific binaries.

4. **Verify installation**
   ```bash
   npm run lint           # orkflow smoke check
   npm run depcheck       # optional dependency audit
   ```

---

## 4. Environment Configuration

### 4.1 Root `.env`

The backend loads `/Users/aniket/Downloads/RankMarg1/RankMarg/.env` via `dotenv` (`apps/backend/src/config/server.config.ts`). Use the following template as a starting point; adjust values per environment:

```bash
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
COOKIE_DOMAIN=localhost

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rankmarg

# Redis / Upstash
REDIS_URL=redis://localhost:6379
REDIS_URL_FRONTEND=redis://localhost:6380
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Auth & security
JWT_SECRET=super-secret-jwt
ADMIN_API_KEY=dev-admin-key

# Email
RESEND_API_KEY=
EMAIL_ADDRESS=no-reply@rankmarg.dev

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AWS S3 uploads (optional)
AWS_REGION=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# AI / LLM
OPENAI_API_KEY=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Domain hints (prod only)
BACKEND_DOMAIN=api.rankmarg.dev
FRONTEND_DOMAIN=rankmarg.dev
```

> **Tip:** For Google OAuth-specific steps, refer to `docs/oauth-setup.md`.

### 4.2 Frontend `.env.local`

Create `/Users/aniket/Downloads/RankMarg1/RankMarg/apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080       # Point to your websocket gateway if enabled
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Firebase (client SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret
NEXTAUTH_JWT_SECRET=dev-nextauth-secret
```

### 4.3 Admin `.env.local`

Create `/Users/aniket/Downloads/RankMarg1/RankMarg/apps/admin/.env.local`. Most values mirror the frontend, but use the admin host for `NEXT_PUBLIC_WEBSITE_URL` if you serve it separately:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=dev-nextauth-secret
NEXTAUTH_JWT_SECRET=dev-nextauth-secret
```

### 4.4 Other service-specific files

- **Firebase service account**: If you need privileged server access, keep credentials outside the repo and load them via `GOOGLE_APPLICATION_CREDENTIALS`.
- **Docker builds**: Pass the same env vars as build arguments defined in `apps/*/Dockerfile` (`NEXT_PUBLIC_WS_URL`, `NEXTAUTH_JWT_SECRET`, etc.).

---

## 5. Database & Prisma

1. **Create the database**
   ```bash
   createdb rankmarg          # or use psql / GUI
   ```

2. **Run migrations + generate Prisma client**
   ```bash
   npm run db:push            # Push schema to dev DB
   npm run db:migrate         # Apply migrations and regenerate client
   npm run db:generate        # Safe to run any time you change schema
   ```

   These scripts call into `packages/db`, which contains the Prisma schema (`packages/db/prisma/schema.prisma`) and exposes the generated client for every workspace.

3. **Inspect data**
   ```bash
   npm run db:studio
   ```

4. **Seed data / bulk import (optional)**
   - Use scripts in `apps/backend/scripts/*.ts` (`importQuestions.ts`, `generateAttemptData.ts`, etc.).
   - Consult `docs/BULK_UPLOAD_SETUP.md` for CSV/JSON expectations before running imports.

---

## 6. Running the Stack Locally

### 6.1 Start backing services

```bash
# PostgreSQL (example via Docker)
docker run --name rankmarg-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Redis
docker run --name rankmarg-redis -p 6379:6379 -d redis:7
```

Update your `.env` if you map different ports or use managed services.

### 6.2 Start application processes

You can either run everything through Turborepo or manage processes individually:

| Command | Purpose | Default Port |
|---------|---------|--------------|
| `npm run backend:dev` | Starts Express API with cron jobs (`apps/backend`). | `3001` |
| `npm run frontend:dev -- --port 3000` | Next.js student app (`apps/frontend`). | `3000` |
| `npm run admin:dev -- --port 3002` | Next.js admin app (`apps/admin`). | `3000` unless overridden |
| `npm run dev` | Runs `turbo dev`, spawning all `dev` scripts concurrently. | Respect individual defaults |

> **Port collisions:** When running both Next.js apps, pass explicit `--port` flags so they do not compete for `3000`.

### 6.3 Validate the environment

- API health: `curl http://localhost:3001/health`
- Redis health: `curl http://localhost:3001/health/redis/health`
- Frontend: open `http://localhost:3000`
- Admin: open `http://localhost:3002`
- Google OAuth callback: confirm `http://localhost:3001/api/auth/google/callback` is reachable after following `docs/oauth-setup.md`.

Cron jobs automatically start when the backend boots. Use `curl http://localhost:3001/api/cron/status` to confirm schedules.

---

## 7. Additional Services

- **Websocket Gateway**: Both Next.js apps expect `NEXT_PUBLIC_WS_URL` (defaults to `ws://localhost:8080`). Point it to your websocket service if you run one; otherwise features relying on live updates fall back gracefully.
- **Redis cache tools**: Backend exposes `/cache/*` and `/upstash/*` endpoints for cache inspection and warming (see `apps/backend/src/index.ts` routing).
- **Email (Resend)**: Set `RESEND_API_KEY` and `EMAIL_ADDRESS`. Without them, email workflows should be stubbed or disabled.
- **Payments (Razorpay)**: You need both public (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) and secret keys plus webhook secret in the backend `.env`.
- **AI features (OpenAI)**: Provide `OPENAI_API_KEY` so AI question generation endpoints work.

---

## 8. Quality Gates

| Command | Description |
|---------|-------------|
| `npm run lint` | Runs ESLint across all workspaces (`turbo lint`). |
| `npm run build` | Runs `turbo build` (build + Prisma prerequisites). |
| `npm run depcheck` | Detects unused dependencies per workspace. |
| `npm run format` | Formats code/markdown via Prettier. |

Use these locally before opening pull requests.

---

## 9. Container Builds & Deployment Hints

- Each app includes its own `Dockerfile` (Next.js builds rely on the `docker/base/Dockerfile.turbo` base image). Build commands:
  ```bash
  # Backend
  docker build -t rankmarg-backend ./apps/backend

  # Frontend / Admin (supply required build args)
  docker build \
    --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.rankmarg.dev \
    --build-arg NEXT_PUBLIC_WS_URL=wss://ws.rankmarg.dev \
    --build-arg NEXTAUTH_JWT_SECRET=prod-secret \
    --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx \
    -t rankmarg-frontend ./apps/frontend
  ```
- Provide runtime env vars through your orchestrator (Kubernetes, Render, Vercel, etc.) to match those defined in sections 4.1–4.3.
- For production Prisma migrations, run `npm run db:migrate --workspace=packages/db` before rolling out API containers.

---

## 10. Troubleshooting

| Symptom | Checks |
|---------|--------|
| `npm install` fails during `postinstall` | Ensure `.env` contains a valid `DATABASE_URL` and the database is reachable before installing. |
| Backend cannot connect to Redis | Verify `REDIS_URL` or Upstash token, or run `npm run test:redis --workspace=apps/backend`. |
| OAuth redirect errors | Double-check callback URLs in Google Cloud console and `.env` (`GOOGLE_CALLBACK_URL`). See `docs/oauth-setup.md`. |
| Missing assets / uploads | Confirm Cloudinary credentials or S3 bucket permissions. |
| Payments failing | Confirm Razorpay keys in both backend `.env` and Next `.env.local`. |
| Prisma errors after schema changes | Re-run `npm run db:generate` and restart dev servers. |
| Cron jobs not firing | Inspect `console` output from `npm run backend:dev` and hit `/api/cron/status` to verify schedules. |

---

## 11. Next Steps

- Review feature-specific docs under `docs/` (AI questions, adaptive learning, bulk upload, subscription systems) for domain workflows once your environment is up.
- Keep secrets out of version control. Use `.env.local` files locally and secret stores (Doppler, 1Password, AWS Secrets Manager, etc.) in deployed environments.

Happy hacking!

