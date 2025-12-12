# PDF Generation Queue System

A scalable, load-controlled PDF generation system that allows multiple PDFs to be built concurrently without overwhelming the system resources.

## Features

- ✅ **Queue-based Processing**: Jobs are queued in Redis with priority support
- ✅ **Worker Pool**: Controlled concurrent PDF generation with configurable limits
- ✅ **Priority System**: Support for URGENT, HIGH, NORMAL, and LOW priorities
- ✅ **Retry Logic**: Automatic retry on failure with exponential backoff
- ✅ **Job Tracking**: Real-time job status updates via Redis pub/sub
- ✅ **Load Control**: Maximum concurrent workers limit prevents resource exhaustion
- ✅ **Automatic Cleanup**: Stuck job detection and cleanup
- ✅ **Statistics**: Queue and worker statistics for monitoring

## Architecture

```
┌─────────────┐
│  API Layer  │
│ (Controller)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Queue Service│
│  (Redis)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Worker Pool │
│ (Concurrent)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PDF Service │
│ (Generation)│
└─────────────┘
```

## Configuration

### Environment Variables

```env
# Maximum concurrent PDF workers
PDF_MAX_WORKERS=3

# Enable auto-scaling (future feature)
PDF_AUTO_SCALE=false

# Use queue by default for PDF generation
PDF_USE_QUEUE=false
```

### Worker Pool Config

```typescript
{
  maxConcurrentWorkers: 3,        // Max simultaneous PDF generations
  maxRetries: 3,                  // Retry attempts on failure
  retryDelay: 5000,               // Delay between retries (ms)
  processingTimeout: 1800000,     // Max processing time (30 min)
  enableAutoScaling: false,       // Auto-scale workers (future)
  minWorkers: 1,                  // Minimum workers
  maxWorkers: 5,                  // Maximum workers
}
```

## Usage

### Queue a PDF Job

```typescript
import { pdfQueueService } from "@/services/pdf/queue";
import { PDFJobPriority } from "@/services/pdf/queue";

// Queue a test PDF
const job = await pdfQueueService.queueTestPDF(
  testData,
  PDFJobPriority.NORMAL,
  userId
);

// Check job status
const status = await pdfQueueService.getJobStatus(job.id);
```

### API Endpoints

```bash
# Queue a PDF job
POST /api/pdf/queue
Body: {
  "type": "test",
  "data": { ... },
  "priority": 2
}

# Get job status
GET /api/pdf/job/:jobId

# Cancel a job
DELETE /api/pdf/job/:jobId

# Get user's jobs
GET /api/pdf/jobs

# Get queue statistics
GET /api/pdf/stats
```

### Using Queue in Test Controller

Add `?useQueue=true` to use the queue system:

```bash
GET /api/test/:testId/generate-pdf?useQueue=true
```

Or set `PDF_USE_QUEUE=true` to use queue by default.

## Priority Levels

- **URGENT (4)**: Critical PDFs needed immediately
- **HIGH (3)**: Important PDFs with short deadline
- **NORMAL (2)**: Standard PDF generation (default)
- **LOW (1)**: Background/batch PDFs

## Job Status Flow

```
PENDING → QUEUED → PROCESSING → COMPLETED
                              ↓
                           FAILED (with retries)
```

## Monitoring

### Get Queue Statistics

```typescript
const stats = await pdfQueueService.getQueueStats();
// Returns:
// {
//   worker: {
//     active: 2,
//     queued: 5,
//     completed: 100,
//     failed: 3,
//     processingTime: 45000
//   },
//   queue: {
//     pending: 5,
//     processing: 2,
//     byPriority: { 1: 2, 2: 3, 3: 0, 4: 0 }
//   }
// }
```

## Error Handling

- Jobs automatically retry up to 3 times on failure
- Failed jobs after max retries are marked as FAILED
- Stuck jobs (processing > 30 minutes) are automatically cleaned up
- Error messages are stored in job metadata

## Scaling

The system is designed to scale horizontally:

1. **Multiple Instances**: Each instance can run workers independently
2. **Redis Queue**: Centralized job queue shared across instances
3. **No Conflicts**: Redis atomic operations prevent duplicate processing

## Performance Considerations

- **Concurrent Workers**: Adjust `PDF_MAX_WORKERS` based on:
  - Available CPU cores
  - Memory capacity
  - Expected PDF complexity
  
- **Typical Recommendations**:
  - CPU: 1 worker per 2 cores
  - Memory: ~200-500MB per worker
  - Start with 2-3 workers, scale based on load

## Future Enhancements

- [ ] Auto-scaling based on queue length
- [ ] PDF result storage (S3/File system)
- [ ] Webhook notifications on completion
- [ ] Job batching for efficiency
- [ ] Progress tracking for large PDFs