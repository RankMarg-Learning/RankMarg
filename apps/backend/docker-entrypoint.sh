#!/bin/sh
set -e

# Navigate to monorepo db package to run prisma migrations if DATABASE_URL is set
cd /app/packages/db

if [ -n "$DATABASE_URL" ]; then
  echo "Running Prisma migrations..."
  npx prisma migrate deploy || echo "Migrations failed or none to apply; continuing"
else
  echo "DATABASE_URL not set, skipping migrations"
fi

echo "Starting backend..."
cd /app/apps/backend
exec node dist/index.js


