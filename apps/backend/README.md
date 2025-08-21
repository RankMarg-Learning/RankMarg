# Backend Server

A Node.js/Express server with cron jobs and APIs for the RankMarg application.

## Features

- **Cron Jobs**: Automated scheduled tasks for data processing
- **API Routes**: RESTful endpoints for various operations
- **Redis Integration**: Caching and session management
- **Database Integration**: Prisma ORM with PostgreSQL
- **Health Monitoring**: Health checks and monitoring endpoints

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rankmarg

# Redis
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Security
JWT_SECRET=your-jwt-secret

# Logging
LOG_LEVEL=info
```

### Server Configuration

The server configuration is centralized in `src/config/server.config.ts`:

- **Port**: Server port (default: 3001)
- **CORS**: Cross-origin resource sharing settings
- **Cron Schedules**: All scheduled job timings
- **API Routes**: Centralized route definitions
- **Performance**: Request timeouts and payload limits

## Cron Jobs

### Daily Jobs (Midnight UTC)

- **resetStreak**: Reset user streaks
- **updatePerformance**: Update user performance metrics
- **createSuggestion**: Create study suggestions

### Weekly Jobs (Sunday UTC)

- **updateReview**: Update review schedules (Sunday midnight)
- **updateMastery**: Update mastery levels (Sunday midnight)
- **updateLearningProgress**: Update learning progress (Sunday 1 AM)

### Frequent Jobs

- **createSession**: Create practice sessions (every 3 minutes)

### Managing Cron Jobs

Use the cron management API endpoints:

```bash
# Get all cron job statuses
GET /api/cron/status

# Stop a specific job
POST /api/cron/stop/:jobName

# Start a specific job
POST /api/cron/start/:jobName

# Stop all jobs
POST /api/cron/stop-all

# Run a job immediately
POST /api/cron/run/:jobName
```

## API Routes

### Health & Monitoring

- `GET /healthz` - Basic health check
- `GET /api/health/redis` - Redis health check
- `GET /api/cache/stats` - Cache statistics

### Cache Management

- `POST /api/cache/clear` - Clear cache
- `POST /api/upstash/warm-cache` - Warm cache for specific user/subject

### Upstash Redis

- `GET /api/upstash/stats` - Detailed Upstash statistics
- `GET /api/upstash/test` - Test Upstash connection

### Core APIs

- `POST /api/create-practice` - Create practice sessions
- `POST /api/update-mastery` - Update mastery levels
- `POST /api/update-performance` - Update performance metrics
- `POST /api/update-review` - Update review schedules

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start:prod

# Database
npm run generate    # Generate Prisma client
npm run migrate     # Run database migrations

# Testing
npm run test:redis  # Test Redis connection
npm run health      # Check server health
npm run cron:status # Check cron job status
```

## Development

### Project Structure

```
src/
├── config/           # Configuration files
│   ├── server.config.ts
│   └── cron.config.ts
├── routes/           # API route handlers
│   ├── session.ts
│   ├── mastery.ts
│   ├── performance.ts
│   ├── reviews.ts
│   └── cron.routes.ts
├── jobs/             # Cron job implementations
├── services/         # Business logic
├── lib/              # Utilities and libraries
└── index.ts          # Main server file
```

### Adding New Cron Jobs

1. Create the job function in `src/jobs/`
2. Add job configuration to `src/config/cron.config.ts`
3. The job will be automatically scheduled on server startup

### Adding New API Routes

1. Create route handler in `src/routes/`
2. Add route definition to `src/config/server.config.ts`
3. Register route in `src/index.ts`

## Deployment

### Docker

```bash
# Development (brings up Postgres, Redis, Backend)
docker compose -f ../../docker-compose.dev.yml up --build

# Production
docker compose -f ../../docker-compose.prod.yml up --build -d
```

### Environment-Specific Configurations

- **Development**: Hot reloading, detailed logging
- **Production**: Optimized performance, minimal logging
- **Testing**: Mocked external services

## Monitoring

### Health Checks

- Basic health: `GET /healthz`
- Redis health: `GET /api/health/redis`
- Cron job status: `GET /api/cron/status`

### Logging

- Development: Console logging with colors
- Production: JSON structured logging
- Log levels: error, warn, info, debug

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**

   - Check Redis URL and credentials
   - Verify network connectivity

2. **Cron Jobs Not Running**

   - Check job status: `GET /api/cron/status`
   - Verify timezone settings (UTC)
   - Check server logs for errors

3. **Database Connection Issues**
   - Verify DATABASE_URL
   - Run migrations: `npm run migrate`
   - Generate Prisma client: `npm run generate`

### Debug Mode

Set `NODE_ENV=development` and `LOG_LEVEL=debug` for detailed logging.
