import { PDFType, TestPDFData, DPPPDFData, TestAnalysisPDFData } from "../types";
import { pdfJobStorage, PDFJob, PDFJobStatus, PDFJobPriority } from "./pdf-job-storage";
import { getPDFWorkerPool } from "./pdf-worker-pool";

/**
 * High-level service for queueing and managing PDF generation jobs
 */
export class PDFQueueService {
  /**
   * Queue a PDF generation job
   */
  async queuePDF(
    type: PDFType | string,
    data: TestPDFData | DPPPDFData | TestAnalysisPDFData,
    priority: PDFJobPriority = PDFJobPriority.NORMAL,
    userId?: string
  ): Promise<PDFJob> {
    // Convert enum to string if needed, or use string directly
    const typeString = typeof type === "string" ? type.toLowerCase() : String(type).toLowerCase();
    
    const job = await pdfJobStorage.createJob(typeString, data, priority, userId);
    
    // Ensure worker pool is running
    const workerPool = getPDFWorkerPool();
    if (!workerPool["isRunning"]) {
      await workerPool.start();
    }

    return job;
  }

  /**
   * Queue a test PDF job
   * Checks S3 first - if PDF exists, returns completed job immediately
   */
  async queueTestPDF(
    data: TestPDFData,
    priority: PDFJobPriority = PDFJobPriority.NORMAL,
    userId?: string
  ): Promise<PDFJob> {
    // Check if PDF already exists in S3
    if (data.testId) {
      const { checkPDFExistsInS3 } = await import("./pdf-s3-storage");
      const checkResult = await checkPDFExistsInS3(data.testId, "test", "pdfs");
      
      if (checkResult.exists && checkResult.url && checkResult.key) {
        // PDF exists - return completed job immediately
        const job = await pdfJobStorage.createJob("test", data, priority, userId);
        await pdfJobStorage.updateJobStatus(
          job.id,
          PDFJobStatus.COMPLETED,
          undefined,
          {
            downloadUrl: checkResult.url,
            s3Key: checkResult.key,
            completedAt: new Date().toISOString(),
          }
        );
        return (await pdfJobStorage.getJob(job.id))!;
      }
    }
    
    // PDF doesn't exist - queue for generation
    return this.queuePDF(PDFType.TEST, data, priority, userId);
  }

  /**
   * Queue a DPP PDF job
   * Checks S3 first - if PDF exists, returns completed job immediately
   */
  async queueDPPPDF(
    data: DPPPDFData,
    priority: PDFJobPriority = PDFJobPriority.NORMAL,
    userId?: string
  ): Promise<PDFJob> {
    if (data.dppId) {
      const { checkPDFExistsInS3 } = await import("./pdf-s3-storage");
      const checkResult = await checkPDFExistsInS3(data.dppId, "dpp", "pdfs");
      
      if (checkResult.exists && checkResult.url && checkResult.key) {
        const job = await pdfJobStorage.createJob("dpp", data, priority, userId);
        await pdfJobStorage.updateJobStatus(
          job.id,
          PDFJobStatus.COMPLETED,
          undefined,
          {
            downloadUrl: checkResult.url,
            s3Key: checkResult.key,
            completedAt: new Date().toISOString(),
          }
        );
        return (await pdfJobStorage.getJob(job.id))!;
      }
    }
    
    return this.queuePDF(PDFType.DPP, data, priority, userId);
  }

  /**
   * Queue a test analysis PDF job
   * Checks S3 first - if PDF exists, returns completed job immediately
   */
  async queueTestAnalysisPDF(
    data: TestAnalysisPDFData,
    priority: PDFJobPriority = PDFJobPriority.NORMAL,
    userId?: string
  ): Promise<PDFJob> {
    if (data.analysisId) {
      const { checkPDFExistsInS3 } = await import("./pdf-s3-storage");
      const checkResult = await checkPDFExistsInS3(data.analysisId, "test_analysis", "pdfs");
      
      if (checkResult.exists && checkResult.url && checkResult.key) {
        const job = await pdfJobStorage.createJob("test_analysis", data, priority, userId);
        await pdfJobStorage.updateJobStatus(
          job.id,
          PDFJobStatus.COMPLETED,
          undefined,
          {
            downloadUrl: checkResult.url,
            s3Key: checkResult.key,
            completedAt: new Date().toISOString(),
          }
        );
        return (await pdfJobStorage.getJob(job.id))!;
      }
    }
    
    return this.queuePDF(PDFType.TEST_ANALYSIS, data, priority, userId);
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<PDFJob | null> {
    return await pdfJobStorage.getJob(jobId);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    return await pdfJobStorage.cancelJob(jobId);
  }

  /**
   * Get user's jobs
   */
  async getUserJobs(userId: string): Promise<PDFJob[]> {
    return await pdfJobStorage.getUserJobs(userId);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const workerPool = getPDFWorkerPool();
    return {
      worker: workerPool.getStats(),
      queue: await workerPool.getQueueStats(),
    };
  }

  /**
   * Start the worker pool (usually called on server startup)
   */
  async startWorkers(): Promise<void> {
    const workerPool = getPDFWorkerPool();
    await workerPool.start();
  }

  /**
   * Stop the worker pool (usually called on server shutdown)
   */
  async stopWorkers(): Promise<void> {
    const workerPool = getPDFWorkerPool();
    await workerPool.stop();
  }
}

export const pdfQueueService = new PDFQueueService();