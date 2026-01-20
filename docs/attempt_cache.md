# Cache Attempt Day Support Job

## Overview

This support job runs daily at **11:50 PM (23:50 IST)** to cache the day's attempt data for all active users in Redis. This cached data powers the next-day suggestion generation and provides fast analytics retrieval.

## Purpose

### Business Value
- **Enables Fast Analytics**: Pre-cached data eliminates heavy DB queries for dashboards
- **Powers Personalization**: Provides recent activity patterns for the suggestion engine
- **Supports Daily Coaching**: Feeds data to the midnight suggestion job (runs at 12:00 AM)

### Technical Benefits
- **Reduces DB Load**: Shifts analytics queries from DB to Redis cache
- **Improves Response Times**: Redis cache TTL of 2 hours ensures fast data retrieval
- **Scalable Design**: Batch processing prevents memory overflow with large user bases

## Schedule

- **Cron Expression**: `50 23 * * *`
- **Timezone**: Asia/Kolkata (IST)
- **Frequency**: Daily at 11:50 PM
- **Data Range**: Captures attempts from 12:00 AM to 11:50 PM of the current day

## Data Flow

```
┌─────────────────────┐
│   11:50 PM Job      │
│  Cache Attempt Day  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fetch Active Users │
│   (Batch of 50)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Fetch Day Attempts  │
│  (12 AM - 11:50 PM) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Transform Data     │
│ + Subject/Topic Info│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cache in Redis     │
│   TTL: 2 hours      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  12:00 AM Next Day  │
│ Suggestion Job Runs │
│  Uses Cached Data   │
└─────────────────────┘
```

## Key Design Decisions

### 1. **Timing (11:50 PM)**
- Runs 10 minutes before midnight to capture the full day's data
- Allows suggestion job (12:00 AM) to use fresh cached data
- TTL of 2 hours ensures data is available for morning analytics

### 2. **Batch Processing**
- Processes 50 users at a time to prevent memory issues
- Continues processing even if some batches fail
- Partial success is acceptable (better than total failure)

### 3. **Data Transformation**
- Enriches attempts with subject, topic, and subtopic information
- Transforms to `AttemptsDayData[]` format for consistency
- Includes question difficulty and categories for coaching logic

### 4. **Error Handling**
- Per-user error handling prevents one failure from blocking others
- Detailed logging for each batch and user
- Summary report at job completion

### 5. **Cache Strategy**
- Key format: `date:user:{YYYY-MM-DD}:{userId}`
- TTL: 2 hours (7200 seconds) - balances freshness and availability
- Auto-expiration prevents stale data accumulation

## Cached Data Structure

```typescript
interface AttemptsDayData {
  id: string;
  questionId: string;
  type: AttemptType;
  answer: string;
  mistake: string;
  timing: number;
  reactionTime: number;
  status: SubmitStatus;
  hintsUsed: boolean;
  solvedAt: Date;
  subject: {
    id: string;
    name: string;
  };
  topic: {
    id: string;
    name: string;
  };
  subtopic: {
    id: string;
    name: string;
  }[];
  difficulty: number;
  category: string[];
}
```

## Performance Characteristics

### Database Queries
- 1 query to count active users
- N/BATCH_SIZE queries to fetch user batches (BATCH_SIZE = 50)
- 1 query per user to fetch their day's attempts with joins

### Expected Performance
- **100 users**: ~2-3 seconds
- **1,000 users**: ~15-20 seconds
- **10,000 users**: ~2-3 minutes

### Memory Usage
- Batch processing limits peak memory
- Each batch processes in sequence
- Garbage collection between batches

## Monitoring & Observability

### Logs
- Job start/completion with duration
- Batch progress (X/Y batches)
- Per-user success/failure
- Summary statistics

### Metrics to Track
- Total users processed
- Success rate (successful / total)
- Job execution time
- Cache hit rate (next day)
- Error rate by user

### Alerts (Recommended)
- Job failure (all users failed)
- Success rate < 90%
- Job duration > 10 minutes
- Redis connection failures

## Integration Points

### Consumed By
1. **Suggestion Engine** (`createSuggestion` job at 12:00 AM)
   - Uses cached data to generate daily coaching messages
   - Analyzes mistakes, timing, and unsolved questions
   
2. **Analytics Dashboard** (API endpoints)
   - Fast retrieval of today's activity
   - Avoids heavy DB queries for real-time dashboards

3. **Performance Metrics** (Background jobs)
   - Feeds into performance calculation jobs
   - Supports mastery updates

### Dependencies
- **Prisma DB**: Source of truth for attempt data
- **Redis Cache Service**: Caching layer
- **Logger**: Structured logging
- **Cron Manager**: Job scheduling

## Testing

### Manual Testing
```bash
# Run the job immediately (don't wait for 11:50 PM)
curl -X POST http://localhost:3001/api/cron/run/cacheAttemptDay
```

### Verify Cache
```bash
# Check if data is cached for a specific user and date
curl http://localhost:3001/cache/attempt-day/:userId/:date
```

### Expected Output
```
🔄 Running cron job: cacheAttemptDay
Starting Cache Attempt Day Job
Caching attempts from 2026-01-19T00:00:00.000Z to 2026-01-19T23:50:00.000Z
Date key: 2026-01-19
Found 150 active users to process
Processing batch 1/3 (1-50)
Cached 12 attempts for user John Doe
Cached 8 attempts for user Jane Smith
...
Batch 1 completed: 50 successful, 0 failed
Processing batch 2/3 (51-100)
...
============================================================
Cache Attempt Day Job Summary
============================================================
Total users processed: 150
Successful: 150
Failed: 0
Job duration: 12450ms (12.45s)
============================================================
✅ Cron job cacheAttemptDay completed in 12450ms
```

## Error Scenarios & Handling

### Scenario 1: User Has No Attempts Today
- **Behavior**: Still counts as success
- **Log**: "No attempts found for user {name}"
- **Cache**: No cache entry created (saves space)

### Scenario 2: Database Connection Error
- **Behavior**: Job fails, throws error
- **Sentry**: Captures error with context
- **Retry**: Waits for next scheduled run (next day 11:50 PM)

### Scenario 3: Redis Connection Error
- **Behavior**: User marked as failed
- **Impact**: Specific user's data not cached, others continue
- **Fallback**: Suggestion job will query DB directly for that user

### Scenario 4: Partial Batch Failure
- **Behavior**: Job continues with remaining batches
- **Result**: Partial success (some users cached, others not)
- **Logging**: Summary shows success/failure counts

### Scenario 5: All Users Fail
- **Behavior**: Job throws error after completion
- **Alert**: Should trigger monitoring alert
- **Action Required**: Check Redis connection and DB access

## Maintenance

### Regular Checks
- Monitor job execution logs weekly
- Review success rate (should be > 95%)
- Check cache hit rate for suggestion job
- Ensure Redis memory usage is stable

### Scaling Considerations
- **10K+ users**: Consider increasing BATCH_SIZE to 100
- **High failure rate**: Investigate DB connection pooling
- **Slow execution**: Add parallel batch processing
- **Memory issues**: Reduce BATCH_SIZE to 25

### Future Enhancements
1. **Parallel Batch Processing**: Process multiple batches concurrently
2. **Incremental Caching**: Cache attempts as they're created
3. **Smart TTL**: Adjust TTL based on user activity patterns
4. **Compression**: Compress large attempt arrays before caching
5. **Metrics Dashboard**: Track job health over time

## Related Jobs

- **`createSuggestion`** (12:00 AM): Consumes cached data
- **`updatePerformance`** (12:00 AM): May benefit from cached data
- **`updateMastery`** (Weekly): Uses historical attempt patterns

## Files

- **Job**: `apps/backend/src/jobs/support/cacheAttemptDay.job.ts`
- **Cron Config**: `apps/backend/src/config/cron.config.ts`
- **Cache Service**: `apps/backend/src/services/redisCache.service.ts`
- **Types**: `apps/backend/src/types/attemptConfig.type.ts`

## Owner

RankMarg Core Engineering Team

---

**Last Updated**: 2026-01-19  
**Version**: 1.0.0
