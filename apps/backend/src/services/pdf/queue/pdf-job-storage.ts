import redisService from "@/lib/redis";
import { Logger } from "@/lib/logger";

const logger = new Logger("PDFJobStorage");

export enum PDFJobStatus {
  PENDING = "pending",
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum PDFJobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
}

export interface PDFJob {
  id: string;
  type: string; // 'test' | 'dpp' | 'test_analysis'
  status: PDFJobStatus;
  priority: PDFJobPriority;
  data: any; // PDF-specific data
  userId?: string;
  metadata?: {
    title?: string;
    createdAt?: string;
    startedAt?: string;
    completedAt?: string;
    error?: string;
    retryCount?: number;
    estimatedTime?: number; // in seconds
    downloadUrl?: string;
    s3Key?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PDFJobResult {
  jobId: string;
  status: PDFJobStatus;
  buffer?: Buffer;
  downloadUrl?: string;
  error?: string;
  completedAt?: string;
}

class PDFJobStorage {
  private readonly JOB_PREFIX = "pdf_job:";
  private readonly QUEUE_PREFIX = "pdf_queue:";
  private readonly USER_JOBS_PREFIX = "pdf_user_jobs:";
  private readonly PROCESSING_PREFIX = "pdf_processing:";
  private readonly JOB_STATUS_CHANNEL = "pdf_job_status";
  private readonly JOB_TTL = 7 * 24 * 60 * 60; // 7 days
  private readonly PROCESSING_TTL = 30 * 60; // 30 minutes (max processing time)
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupProcess();
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupExpiredJobs();
    }, this.CLEANUP_INTERVAL);
  }

  private async cleanupExpiredJobs(): Promise<void> {
    try {
      logger.info("Starting PDF job cleanup...");
      // Cleanup logic would go here
    } catch (error) {
      logger.error("Error during job cleanup:", error);
    }
  }

  /**
   * Create a new PDF job
   */
  async createJob(
    type: string,
    data: any,
    priority: PDFJobPriority = PDFJobPriority.NORMAL,
    userId?: string
  ): Promise<PDFJob> {
    const jobId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const job: PDFJob = {
      id: jobId,
      type,
      status: PDFJobStatus.PENDING,
      priority,
      data,
      userId,
      metadata: {
        title: data.title || `${type} PDF`,
        createdAt: now,
        retryCount: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.setJob(job);
    await this.addToQueue(jobId, priority);

    logger.info(`Created PDF job ${jobId} with priority ${priority}`);
    return job;
  }

  /**
   * Store job in Redis
   */
  private async setJob(job: PDFJob): Promise<void> {
    const jobKey = `${this.JOB_PREFIX}${job.id}`;
    job.updatedAt = new Date().toISOString();

    await redisService.setJson(jobKey, job, this.JOB_TTL);

    if (job.userId) {
      try {
        const client = redisService.getClient();
        if (client) {
          await redisService.connect();
          const userJobsKey = `${this.USER_JOBS_PREFIX}${job.userId}`;
          await client.sAdd(userJobsKey, job.id);
          await redisService.expire(userJobsKey, this.JOB_TTL);
        }
      } catch (error) {
        logger.error(`Error adding job to user set:`, error);
      }
    }

    await this.publishStatusUpdate(job);
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<PDFJob | null> {
    const jobKey = `${this.JOB_PREFIX}${jobId}`;
    return await redisService.getJson<PDFJob>(jobKey);
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    jobId: string,
    status: PDFJobStatus,
    error?: string,
    metadata?: Partial<PDFJob["metadata"]>
  ): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = status;
    job.updatedAt = new Date().toISOString();

    if (error) {
      job.metadata = { ...job.metadata, error };
    }

    if (metadata) {
      job.metadata = { ...job.metadata, ...metadata };
    }

    if (status === PDFJobStatus.PROCESSING && !job.metadata.startedAt) {
      job.metadata.startedAt = new Date().toISOString();
    }

    if (status === PDFJobStatus.COMPLETED || status === PDFJobStatus.FAILED) {
      job.metadata.completedAt = new Date().toISOString();
      
      // Remove from processing set
      await redisService.del(`${this.PROCESSING_PREFIX}${jobId}`);
    }

    await this.setJob(job);
    await this.publishStatusUpdate(job);
  }

  /**
   * Add job to priority queue
   */
  private async addToQueue(jobId: string, priority: PDFJobPriority): Promise<void> {
    const queueKey = `${this.QUEUE_PREFIX}${priority}`;
    await redisService.lPush(queueKey, jobId);
    await redisService.expire(queueKey, this.JOB_TTL);
  }

  /**
   * Get next job from queue (high priority first)
   */
  async getNextJob(): Promise<string | null> {
    // Check queues in priority order (URGENT -> HIGH -> NORMAL -> LOW)
    const priorities = [
      PDFJobPriority.URGENT,
      PDFJobPriority.HIGH,
      PDFJobPriority.NORMAL,
      PDFJobPriority.LOW,
    ];

    for (const priority of priorities) {
      const queueKey = `${this.QUEUE_PREFIX}${priority}`;
      const jobId = await redisService.rPop(queueKey);
      
      if (jobId) {
        // Mark as processing
        await redisService.set(
          `${this.PROCESSING_PREFIX}${jobId}`,
          new Date().toISOString(),
          this.PROCESSING_TTL
        );
        return jobId;
      }
    }

    return null;
  }

  /**
   * Get queue length
   */
  async getQueueLength(priority?: PDFJobPriority): Promise<number> {
    if (priority !== undefined) {
      const queueKey = `${this.QUEUE_PREFIX}${priority}`;
      return await redisService.lLen(queueKey);
    }

    // Get total across all priorities
    const priorities = [
      PDFJobPriority.URGENT,
      PDFJobPriority.HIGH,
      PDFJobPriority.NORMAL,
      PDFJobPriority.LOW,
    ];

    let total = 0;
    for (const p of priorities) {
      const queueKey = `${this.QUEUE_PREFIX}${p}`;
      total += await redisService.lLen(queueKey);
    }

    return total;
  }

  /**
   * Get user's jobs
   */
  async getUserJobs(userId: string): Promise<PDFJob[]> {
    const userJobsKey = `${this.USER_JOBS_PREFIX}${userId}`;
    
    try {
      const client = redisService.getClient();
      if (!client) return [];

      await redisService.connect();
      const jobIds = await client.sMembers(userJobsKey);
      
      const jobs: PDFJob[] = [];
      for (const jobId of jobIds) {
        const job = await this.getJob(jobId);
        if (job) {
          jobs.push(job);
        }
      }

      return jobs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      logger.error(`Error getting user jobs for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === PDFJobStatus.COMPLETED) {
      throw new Error("Cannot cancel a completed job");
    }

    await this.updateJobStatus(jobId, PDFJobStatus.CANCELLED);
    
    // Remove from processing if it was processing
    await redisService.del(`${this.PROCESSING_PREFIX}${jobId}`);
  }

  /**
   * Publish status update to Redis channel
   */
  private async publishStatusUpdate(job: PDFJob): Promise<void> {
    try {
      const client = redisService.getClient();
      if (client) {
        await client.publish(
          this.JOB_STATUS_CHANNEL,
          JSON.stringify({ jobId: job.id, status: job.status, job })
        );
      }
    } catch (error) {
      logger.error(`Failed to publish status update for job ${job.id}:`, error);
    }
  }

  /**
   * Get processing jobs count
   */
  async getProcessingCount(): Promise<number> {
    try {
      const client = redisService.getClient();
      if (!client) return 0;

      const keys = await client.keys(`${this.PROCESSING_PREFIX}*`);
      return keys.length;
    } catch (error) {
      logger.error("Error getting processing count:", error);
      return 0;
    }
  }

  /**
   * Cleanup expired processing jobs (stuck jobs)
   */
  async cleanupStuckJobs(): Promise<number> {
    try {
      const client = redisService.getClient();
      if (!client) return 0;

      const keys = await client.keys(`${this.PROCESSING_PREFIX}*`);
      let cleaned = 0;

      for (const key of keys) {
        const jobId = key.replace(this.PROCESSING_PREFIX, "");
        const job = await this.getJob(jobId);

        if (job && job.status === PDFJobStatus.PROCESSING) {
          // Check if job is stuck (processing for more than 30 minutes)
          if (job.metadata?.startedAt) {
            const started = new Date(job.metadata.startedAt);
            const now = new Date();
            const diffMinutes = (now.getTime() - started.getTime()) / 1000 / 60;

            if (diffMinutes > 30) {
              // Mark as failed
              await this.updateJobStatus(
                jobId,
                PDFJobStatus.FAILED,
                "Job timeout - processing exceeded 30 minutes"
              );
              await redisService.del(key);
              cleaned++;
            }
          }
        }
      }

      return cleaned;
    } catch (error) {
      logger.error("Error cleaning up stuck jobs:", error);
      return 0;
    }
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byPriority: Record<number, number>;
  }> {
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      byPriority: {} as Record<number, number>,
    };

    try {
      // Get queue lengths by priority
      for (const priority of [
        PDFJobPriority.URGENT,
        PDFJobPriority.HIGH,
        PDFJobPriority.NORMAL,
        PDFJobPriority.LOW,
      ]) {
        const length = await this.getQueueLength(priority);
        stats.byPriority[priority] = length;
        stats.pending += length;
      }

      stats.processing = await this.getProcessingCount();

      // Note: Getting completed/failed counts would require scanning all jobs
      // For efficiency, you might want to maintain counters separately
    } catch (error) {
      logger.error("Error getting stats:", error);
    }

    return stats;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const pdfJobStorage = new PDFJobStorage();