import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { pdfQueueService } from "@/services/pdf/queue";
import { PDFJobPriority } from "@/services/pdf/queue";

export class PDFController {
  /**
   * Queue a PDF generation job
   */
  queuePDF = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type, data, priority } = req.body;
      const userId = req.user?.id;

      if (!type || !data) {
        ResponseUtil.error(res, "Type and data are required", 400);
        return;
      }

      const jobPriority = priority ? parseInt(priority, 10) : PDFJobPriority.NORMAL;
      const job = await pdfQueueService.queuePDF(type, data, jobPriority, userId);

      ResponseUtil.success(
        res,
        { jobId: job.id, status: job.status },
        "PDF generation job queued successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get job status
   */
  getJobStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { jobId } = req.params;

      const job = await pdfQueueService.getJobStatus(jobId);

      if (!job) {
        ResponseUtil.error(res, "Job not found", 404);
        return;
      }

      ResponseUtil.success(res, job, "Job status retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel a job
   */
  cancelJob = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { jobId } = req.params;

      await pdfQueueService.cancelJob(jobId);

      ResponseUtil.success(res, null, "Job cancelled successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's PDF jobs
   */
  getUserJobs = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const jobs = await pdfQueueService.getUserJobs(userId);

      ResponseUtil.success(res, jobs, "User jobs retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get queue statistics
   */
  getQueueStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await pdfQueueService.getQueueStats();

      ResponseUtil.success(res, stats, "Queue statistics retrieved successfully");
    } catch (error) {
      next(error);
    }
  };
}