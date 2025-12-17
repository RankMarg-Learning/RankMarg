import { PDFService } from "../pdf.service";
import { PDFType } from "../types";
import { pdfJobStorage, PDFJob, PDFJobStatus, PDFJobPriority } from "./pdf-job-storage";
import { Logger } from "@/lib/logger";

const logger = new Logger("PDFWorkerPool");

// Removed duplicate interface

export interface WorkerStats {
  active: number;
  queued: number;
  completed: number;
  failed: number;
  processingTime: number;
}

export type WorkerPoolConfig = {
  maxConcurrentWorkers: number;
  maxRetries: number;
  retryDelay: number;
  processingTimeout: number;
  enableAutoScaling: boolean;
  minWorkers: number;
  maxWorkers: number;
};

export class PDFWorkerPool {
  private pdfService: PDFService;
  private config: WorkerPoolConfig;
  private activeWorkers: Map<string, Promise<void>> = new Map();
  private isRunning: boolean = false;
  private workerInterval: NodeJS.Timeout | null = null;
  private stats: WorkerStats = {
    active: 0,
    queued: 0,
    completed: 0,
    failed: 0,
    processingTime: 0,
  };

  constructor(config?: Partial<WorkerPoolConfig>) {
    this.pdfService = new PDFService();
    this.config = {
      maxConcurrentWorkers: parseInt(process.env.PDF_MAX_WORKERS || "3", 10),
      maxRetries: 3,
      retryDelay: 5000,
      processingTimeout: 30 * 60 * 1000, // 30 minutes
      enableAutoScaling: process.env.PDF_AUTO_SCALE === "true",
      minWorkers: 1,
      maxWorkers: parseInt(process.env.PDF_MAX_WORKERS || "5", 10),
      ...config,
    };

    logger.info(`PDF Worker Pool initialized with config:`, this.config);
  }

  /**
   * Start the worker pool
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Worker pool is already running");
      return;
    }

    this.isRunning = true;
    logger.info("Starting PDF worker pool...");

    // Cleanup stuck jobs on startup
    const cleaned = await pdfJobStorage.cleanupStuckJobs();
    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} stuck jobs on startup`);
    }

    // Start worker loop
    this.workerInterval = setInterval(() => {
      this.processJobs().catch((error) => {
        logger.error("Error in worker loop:", error);
      });
    }, 1000); // Check for jobs every second

    // Process immediately
    await this.processJobs();
  }

  /**
   * Stop the worker pool
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info("Stopping PDF worker pool...");

    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }

    // Wait for active workers to complete (with timeout)
    const maxWaitTime = 60000; // 1 minute
    const startTime = Date.now();

    while (this.activeWorkers.size > 0 && Date.now() - startTime < maxWaitTime) {
      logger.info(`Waiting for ${this.activeWorkers.size} active workers to complete...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (this.activeWorkers.size > 0) {
      logger.warn(`Force stopping with ${this.activeWorkers.size} active workers`);
      this.activeWorkers.clear();
    }

    logger.info("PDF worker pool stopped");
  }

  /**
   * Process jobs from queue
   */
  private async processJobs(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Check if we can start more workers
    const availableSlots = this.config.maxConcurrentWorkers - this.activeWorkers.size;
    
    if (availableSlots <= 0) {
      return; // All workers busy
    }

    // Start workers for available slots
    for (let i = 0; i < availableSlots; i++) {
      const jobId = await pdfJobStorage.getNextJob();
      
      if (!jobId) {
        break; // No jobs in queue
      }

      // Start worker for this job
      const workerPromise = this.processJob(jobId);
      this.activeWorkers.set(jobId, workerPromise);

      // Remove from active workers when done
      workerPromise.finally(() => {
        this.activeWorkers.delete(jobId);
      });
    }
  }

  /**
   * Process a single job
   */
  private async processJob(jobId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const job = await pdfJobStorage.getJob(jobId);
      
      if (!job) {
        logger.warn(`Job ${jobId} not found`);
        return;
      }

      if (job.status === PDFJobStatus.CANCELLED) {
        logger.info(`Job ${jobId} was cancelled, skipping`);
        return;
      }

      // Update status to processing
      await pdfJobStorage.updateJobStatus(jobId, PDFJobStatus.PROCESSING);

      logger.info(`Processing PDF job ${jobId} (type: ${job.type})`);

      // Generate PDF with timeout
      const pdfBuffer = await Promise.race([
        this.generatePDF(job),
        new Promise<Buffer>((_, reject) =>
          setTimeout(() => reject(new Error("PDF generation timeout")), this.config.processingTimeout)
        ),
      ]);

      // Store PDF to S3
      const fileName = job.metadata?.title || `pdf_${jobId.substring(0, 8)}`;
      const { uploadPDFToS3 } = await import("./pdf-s3-storage");
      
      // Extract identifier from data (e.g., testId for test PDFs)
      let identifier: string | undefined;
      if (job.type === "test" && job.data?.testId) {
        identifier = job.data.testId;
      } else if (job.type === "dpp" && job.data?.dppId) {
        identifier = job.data.dppId;
      } else if (job.type === "test_analysis" && job.data?.analysisId) {
        identifier = job.data.analysisId;
      }
      
      const uploadResult = await uploadPDFToS3(
        pdfBuffer,
        fileName,
        "pdfs",
        identifier,
        job.type
      );

      // Update job with S3 URL
      await pdfJobStorage.updateJobStatus(jobId, PDFJobStatus.COMPLETED, undefined, {
        completedAt: new Date().toISOString(),
        downloadUrl: uploadResult.url,
        s3Key: uploadResult.key,
      });

      const processingTime = Date.now() - startTime;
      this.stats.completed++;
      this.stats.processingTime = 
        (this.stats.processingTime * (this.stats.completed - 1) + processingTime) / this.stats.completed;

      logger.info(`PDF job ${jobId} completed in ${processingTime}ms and uploaded to S3: ${uploadResult.url}`);

    } catch (error) {
      const job = await pdfJobStorage.getJob(jobId);
      const retryCount = (job?.metadata?.retryCount || 0) + 1;

      logger.error(`Error processing PDF job ${jobId} (attempt ${retryCount}):`, error);

      if (retryCount < this.config.maxRetries) {
        // Retry job
        logger.info(`Retrying job ${jobId} (${retryCount}/${this.config.maxRetries})`);
        
        await pdfJobStorage.updateJobStatus(
          jobId,
          PDFJobStatus.PENDING,
          error instanceof Error ? error.message : String(error),
          { retryCount }
        );

        // Add back to queue with slightly lower priority
        const priority = Math.max(PDFJobPriority.LOW, (job?.priority || PDFJobPriority.NORMAL) - 1);
        await pdfJobStorage.createJob(job?.type || "test", job?.data || {}, priority, job?.userId);
      } else {
        // Max retries reached, mark as failed
        await pdfJobStorage.updateJobStatus(
          jobId,
          PDFJobStatus.FAILED,
          error instanceof Error ? error.message : String(error),
          { retryCount, completedAt: new Date().toISOString() }
        );
      }

      this.stats.failed++;
    }
  }

  /**
   * Generate PDF based on job type
   */
  private async generatePDF(job: PDFJob): Promise<Buffer> {
    const typeMap: Record<string, PDFType> = {
      test: PDFType.TEST,
      dpp: PDFType.DPP,
      test_analysis: PDFType.TEST_ANALYSIS,
    };

    const pdfType = typeMap[job.type.toLowerCase()];
    if (!pdfType) {
      throw new Error(`Unknown PDF type: ${job.type}`);
    }

    return await this.pdfService.generatePDF(pdfType, job.data);
  }

  /**
   * Get worker statistics
   */
  getStats(): WorkerStats & { config: WorkerPoolConfig } {
    return {
      ...this.stats,
      active: this.activeWorkers.size,
      config: this.config,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return await pdfJobStorage.getStats();
  }

  /**
   * Adjust worker configuration
   */
  updateConfig(config: Partial<WorkerPoolConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info(`Worker pool config updated:`, this.config);
  }
}

// Singleton instance
let workerPoolInstance: PDFWorkerPool | null = null;

export function getPDFWorkerPool(): PDFWorkerPool {
  if (!workerPoolInstance) {
    workerPoolInstance = new PDFWorkerPool();
  }
  return workerPoolInstance;
}