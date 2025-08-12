# Redis Integration for Practice Session Generation

This document outlines the Redis integration implemented to improve the performance of the practice session generation system.

## Overview

Redis has been integrated into the practice session generation system to cache frequently accessed data, reducing database queries and improving response times.

## Features

### 1. Caching Strategy

The system implements a multi-layered caching strategy:

- **User Performance Data**: Cached for 30 minutes
- **Session Configurations**: Cached for 2 hours
- **Question Sets**: Cached for 1 hour
- **Current Topics**: Cached for 30 minutes
- **Weak Concepts**: Cached for 1 hour
- **Revision Topics**: Cached for 1 hour
- **Practice Sessions**: Cached for 24 hours

### 2. Cache Keys Structure

```
questions:subject:{subjectId}:{category}
user:performance:{userId}
session:config:{stream}:{grade}
weak:concepts:{userId}:{subjectId}
current:topics:{userId}:{subjectId}
revision:topics:{userId}:{subjectId}
subject:questions:{subjectId}:{category}:{difficulty}
practice:session:{userId}:{sessionId}
```

### 3. Performance Improvements

- **Reduced Database Queries**: Frequently accessed data is served from cache
- **Faster Session Generation**: Pre-computed question sets are cached
- **Improved User Experience**: Faster response times for session creation
- **Scalability**: Redis handles high concurrent loads efficiently

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
REDIS_URL=redis://localhost:6379
```

### 2. Docker Setup

The Redis service is already configured in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 3. Installation

Install Redis dependencies:

```bash
cd apps/backend
npm install redis@^4.6.13
```

## Usage

### 1. Health Check

Check Redis health:

```bash
curl http://localhost:8080/api/health/redis
```

Response:

```json
{
  "status": "healthy",
  "redis": {
    "connected": true,
    "ping": "PONG",
    "stats": {
      "totalKeys": 150,
      "memoryUsage": "2.5MB",
      "hitRate": 0
    }
  }
}
```

### 2. Cache Management

Clear cache for a specific user:

```bash
curl -X POST http://localhost:8080/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

Clear cache for a specific subject:

```bash
curl -X POST http://localhost:8080/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"subjectId": "subject456"}'
```

### 3. Cache Statistics

Get cache statistics:

```bash
curl http://localhost:8080/api/cache/stats
```

## Implementation Details

### 1. Redis Service (`src/lib/redis.ts`)

- Singleton Redis client with connection management
- Automatic reconnection strategy
- Error handling and logging
- Support for JSON serialization/deserialization

### 2. Cache Service (`src/services/session/RedisCacheService.ts`)

- Specialized caching methods for different data types
- TTL management for different cache categories
- Batch operations for improved performance
- Cache invalidation strategies

### 3. Integration Points

#### QuestionSelector

- Caches current topics, weak concepts, and revision topics
- Reduces database queries for topic selection

#### PracticeSessionGenerator

- Caches session configurations
- Stores generated practice sessions
- Improves session generation performance

#### Session Service

- Caches user performance data
- Reduces user data lookup time

## Monitoring and Maintenance

### 1. Cache Hit Rate

Monitor cache effectiveness through the health check endpoint.

### 2. Memory Usage

Track Redis memory usage to ensure optimal performance.

### 3. Cache Invalidation

Implement strategic cache invalidation when data changes:

```typescript
// Invalidate user cache when performance updates
await RedisCacheService.invalidateUserCache(userId);

// Invalidate subject cache when questions are updated
await RedisCacheService.invalidateSubjectCache(subjectId);
```

## Best Practices

### 1. Cache Key Naming

Use consistent, descriptive cache keys:

- Include entity type and ID
- Use colons as separators
- Keep keys under 250 characters

### 2. TTL Management

- Set appropriate TTL based on data volatility
- Use shorter TTL for frequently changing data
- Use longer TTL for static data

### 3. Error Handling

- Always handle Redis connection failures gracefully
- Implement fallback to database queries
- Log cache errors for monitoring

### 4. Performance Optimization

- Use batch operations for multiple cache operations
- Implement cache warming for critical data
- Monitor cache hit rates and adjust TTL accordingly

## Troubleshooting

### 1. Connection Issues

Check Redis connection:

```bash
docker exec -it <redis-container> redis-cli ping
```

### 2. Memory Issues

Monitor Redis memory usage:

```bash
docker exec -it <redis-container> redis-cli info memory
```

### 3. Cache Misses

If cache hit rate is low:

- Review TTL settings
- Check cache invalidation logic
- Verify cache key consistency

## Future Enhancements

1. **Cache Warming**: Pre-populate cache with frequently accessed data
2. **Distributed Caching**: Implement Redis cluster for high availability
3. **Cache Analytics**: Add detailed cache performance metrics
4. **Smart Invalidation**: Implement intelligent cache invalidation based on data relationships
5. **Cache Compression**: Compress large cached objects to reduce memory usage

## Performance Benchmarks

Expected performance improvements:

- **Session Generation**: 60-80% faster
- **Question Selection**: 70-90% faster
- **User Data Lookup**: 80-95% faster
- **Overall Response Time**: 50-70% improvement

These improvements are achieved by reducing database queries and serving frequently accessed data from memory.
