import { redisClient } from './redis-client';

export interface FileProcessingStatus {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  questionId?: string;
  processedAt?: string;
}

export interface BulkUploadJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  files: FileProcessingStatus[];
  createdAt: string;
  completedAt?: string;
  subjectId: string;
  topicId?: string;
  userId: string;
  gptModel?: string;
  lastUpdated: string;
}

class RedisJobStorage {
  private readonly JOB_PREFIX = 'bulk_upload_job:';
  private readonly USER_JOBS_PREFIX = 'user_jobs:';
  private readonly JOB_STATUS_CHANNEL = 'job_status_updates';
  private readonly JOB_TTL = 24 * 60 * 60; // 24 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupProcess();
  }

  private startCleanupProcess(): void {
    // Start periodic cleanup of expired jobs
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupExpiredJobs();
    }, this.CLEANUP_INTERVAL);
  }

  private async cleanupExpiredJobs(): Promise<void> {
    try {
      console.log('Starting Redis job cleanup...');
      
      // Get all job keys
      const pattern = `${this.JOB_PREFIX}*`;
      const client = redisClient.getClient();
      if (!client) return;

      await redisClient.ensureConnection();
      const keys = await client.keys(pattern);
      
      let cleanedCount = 0;
      for (const key of keys) {
        const ttl = await client.ttl(key);
        if (ttl === -1) {
          // Key has no expiration, set it
          await redisClient.expire(key, this.JOB_TTL);
        } else if (ttl === -2) {
          // Key doesn't exist (already expired)
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired job keys`);
      }
    } catch (error) {
      console.error('Error during job cleanup:', error);
    }
  }

  async set(jobId: string, job: BulkUploadJob): Promise<void> {
    try {
      job.lastUpdated = new Date().toISOString();
      
      const jobKey = `${this.JOB_PREFIX}${jobId}`;
      const userJobsKey = `${this.USER_JOBS_PREFIX}${job.userId}`;
      
      // Store the job with TTL
      await redisClient.setEx(jobKey, this.JOB_TTL, JSON.stringify(job));
      
      // Add job ID to user's job set with TTL
      await redisClient.sAdd(userJobsKey, jobId);
      await redisClient.expire(userJobsKey, this.JOB_TTL);
      
      // Publish status update
      await this.publishStatusUpdate(jobId, job);
      
    } catch (error) {
      console.error(`Failed to set job ${jobId} in Redis:`, error);
      throw error;
    }
  }

  async get(jobId: string): Promise<BulkUploadJob | null> {
    try {
      const jobKey = `${this.JOB_PREFIX}${jobId}`;
      const jobData = await redisClient.get(jobKey);
      
      if (!jobData) {
        return null;
      }
      
      return JSON.parse(jobData) as BulkUploadJob;
    } catch (error) {
      console.error(`Failed to get job ${jobId} from Redis:`, error);
      throw error;
    }
  }

  async getUserJobs(userId: string): Promise<BulkUploadJob[]> {
    try {
      const userJobsKey = `${this.USER_JOBS_PREFIX}${userId}`;
      const jobIds = await redisClient.sMembers(userJobsKey);
      
      const jobs: BulkUploadJob[] = [];
      const expiredJobIds: string[] = [];
      
      for (const jobId of jobIds) {
        const job = await this.get(jobId);
        if (job) {
          jobs.push(job);
        } else {
          expiredJobIds.push(jobId);
        }
      }
      
      // Clean up expired job IDs from user's set
      if (expiredJobIds.length > 0) {
        for (const jobId of expiredJobIds) {
          await redisClient.sRem(userJobsKey, jobId);
        }
      }
      
      return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error(`Failed to get user jobs for ${userId} from Redis:`, error);
      throw error;
    }
  }

  async delete(jobId: string): Promise<void> {
    try {
      const job = await this.get(jobId);
      
      if (job) {
        const userJobsKey = `${this.USER_JOBS_PREFIX}${job.userId}`;
        await redisClient.sRem(userJobsKey, jobId);
      }
      
      const jobKey = `${this.JOB_PREFIX}${jobId}`;
      await redisClient.del(jobKey);
      
    } catch (error) {
      console.error(`Failed to delete job ${jobId} from Redis:`, error);
      throw error;
    }
  }

  async updateJobStatus(jobId: string, updates: Partial<BulkUploadJob>): Promise<void> {
    try {
      const job = await this.get(jobId);
      if (!job) {
        console.warn(`Job ${jobId} not found for update`);
        return;
      }

      const updatedJob = { 
        ...job, 
        ...updates, 
        lastUpdated: new Date().toISOString() 
      };
      
      await this.set(jobId, updatedJob);
      
    } catch (error) {
      console.error(`Failed to update job status for ${jobId}:`, error);
      throw error;
    }
  }

  async updateFileStatus(jobId: string, fileId: string, status: Partial<FileProcessingStatus>): Promise<void> {
    try {
      const job = await this.get(jobId);
      if (!job) {
        console.warn(`Job ${jobId} not found for file update`);
        return;
      }

      const fileIndex = job.files.findIndex(f => f.id === fileId);
      if (fileIndex === -1) {
        console.warn(`File ${fileId} not found in job ${jobId}`);
        return;
      }

      const oldStatus = job.files[fileIndex].status;
      job.files[fileIndex] = { ...job.files[fileIndex], ...status };
      
      // Update counters based on status changes
      if (status.status && oldStatus !== status.status) {
        switch (status.status) {
          case 'completed':
            job.successCount++;
            job.processedFiles++;
            break;
          case 'failed':
            job.errorCount++;
            job.processedFiles++;
            if (status.error) {
              job.errors.push(`${job.files[fileIndex].fileName}: ${status.error}`);
            }
            break;
          case 'processing':
            // No counter updates for processing state
            break;
        }
      }

      await this.set(jobId, job);
      
    } catch (error) {
      console.error(`Failed to update file status for job ${jobId}, file ${fileId}:`, error);
      throw error;
    }
  }

  async getJobWithMetadata(jobId: string): Promise<(BulkUploadJob & { 
    isExpired: boolean; 
    timeRemaining: number; 
    lastUpdatedAgo: number; 
    progressPercentage: number;
  }) | null> {
    try {
      const job = await this.get(jobId);
      if (!job) return null;

      const now = Date.now();
      const lastUpdatedTime = new Date(job.lastUpdated).getTime();
      
      // Check if job is expired by checking TTL
      const jobKey = `${this.JOB_PREFIX}${jobId}`;
      const ttl = await redisClient.getClient()?.ttl(jobKey);
      const isExpired = ttl === -2; // Key doesn't exist (expired)
      const timeRemaining = ttl && ttl > 0 ? ttl * 1000 : 0; // Convert to milliseconds
      
      return {
        ...job,
        isExpired,
        timeRemaining,
        lastUpdatedAgo: now - lastUpdatedTime,
        progressPercentage: job.totalFiles > 0 ? Math.round((job.processedFiles / job.totalFiles) * 100) : 0
      };
    } catch (error) {
      console.error(`Failed to get job metadata for ${jobId}:`, error);
      throw error;
    }
  }

  async publishStatusUpdate(jobId: string, job: BulkUploadJob): Promise<void> {
    try {
      const update = {
        jobId,
        status: job.status,
        processedFiles: job.processedFiles,
        totalFiles: job.totalFiles,
        successCount: job.successCount,
        errorCount: job.errorCount,
        timestamp: new Date().toISOString()
      };
      
      await redisClient.publish(this.JOB_STATUS_CHANNEL, JSON.stringify(update));
    } catch (error) {
      console.error(`Failed to publish status update for job ${jobId}:`, error);
      // Don't throw here as this is not critical
    }
  }

  async subscribeToStatusUpdates(callback: (update: any) => void): Promise<void> {
    try {
      await redisClient.subscribe(this.JOB_STATUS_CHANNEL, (message: string) => {
        try {
          const update = JSON.parse(message);
          callback(update);
        } catch (error) {
          console.error('Failed to parse status update message:', error);
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to status updates:', error);
      throw error;
    }
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalUsers: number;
  }> {
    try {
      const pattern = `${this.JOB_PREFIX}*`;
      const client = redisClient.getClient();
      if (!client) {
        throw new Error('Redis client not available');
      }

      await redisClient.ensureConnection();
      const jobKeys = await client.keys(pattern);
      
      let totalJobs = 0;
      let activeJobs = 0;
      let completedJobs = 0;
      let failedJobs = 0;
      const users = new Set<string>();

      for (const key of jobKeys) {
        const jobData = await redisClient.get(key);
        if (jobData) {
          const job: BulkUploadJob = JSON.parse(jobData);
          totalJobs++;
          users.add(job.userId);
          
          switch (job.status) {
            case 'pending':
            case 'processing':
              activeJobs++;
              break;
            case 'completed':
              completedJobs++;
              break;
            case 'failed':
              failedJobs++;
              break;
          }
        }
      }

      return {
        totalJobs,
        activeJobs,
        completedJobs,
        failedJobs,
        totalUsers: users.size
      };
    } catch (error) {
      console.error('Failed to get job stats:', error);
      throw error;
    }
  }

  async addJobToQueue(jobId: string, priority: number = 0): Promise<void> {
    try {
      const queueKey = 'job_processing_queue';
      const jobData = JSON.stringify({ jobId, priority, timestamp: Date.now() });
      await redisClient.lPush(queueKey, jobData);
    } catch (error) {
      console.error(`Failed to add job ${jobId} to queue:`, error);
      throw error;
    }
  }

  async getNextJobFromQueue(): Promise<{ jobId: string; priority: number; timestamp: number } | null> {
    try {
      const queueKey = 'job_processing_queue';
      const jobData = await redisClient.rPop(queueKey);
      
      if (!jobData) {
        return null;
      }
      
      return JSON.parse(jobData);
    } catch (error) {
      console.error('Failed to get next job from queue:', error);
      throw error;
    }
  }

  async getQueueLength(): Promise<number> {
    try {
      const queueKey = 'job_processing_queue';
      return await redisClient.lLen(queueKey);
    } catch (error) {
      console.error('Failed to get queue length:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  async healthCheck(): Promise<{
    connected: boolean;
    ping?: string;
    error?: string;
  }> {
    try {
      const ping = await redisClient.ping();
      return {
        connected: true,
        ping
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create singleton instance
export const jobStorage = new RedisJobStorage();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Graceful shutdown: cleaning up job storage...');
  await jobStorage.cleanup();
});

process.on('SIGINT', async () => {
  console.log('Graceful shutdown: cleaning up job storage...');
  await jobStorage.cleanup();
});

export default jobStorage;
