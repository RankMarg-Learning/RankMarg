import { Router, Request, Response } from "express";
import { cronManager } from "../config/cron.config";

const router = Router();

// Get all cron job statuses
router.get("/status", (_req: Request, res: Response) => {
  try {
    const jobStatuses = cronManager.getJobStatus();
    res.json({
      success: true,
      data: jobStatuses,
      total: jobStatuses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get cron job statuses",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Stop a specific cron job
router.post("/stop/:jobName", (req: Request, res: Response) => {
  try {
    const { jobName } = req.params;
    const stopped = cronManager.stopJob(jobName);

    if (stopped) {
      res.json({
        success: true,
        message: `Cron job ${jobName} stopped successfully`,
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Cron job ${jobName} not found or already stopped`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to stop cron job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start a specific cron job
router.post("/start/:jobName", (req: Request, res: Response) => {
  try {
    const { jobName } = req.params;
    const started = cronManager.startJob(jobName);

    if (started) {
      res.json({
        success: true,
        message: `Cron job ${jobName} started successfully`,
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Cron job ${jobName} not found or disabled`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to start cron job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Stop all cron jobs
router.post("/stop-all", (_req: Request, res: Response) => {
  try {
    cronManager.stopAllJobs();
    res.json({
      success: true,
      message: "All cron jobs stopped successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to stop all cron jobs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Run a cron job immediately
router.post("/run/:jobName", async (req: Request, res: Response) => {
  try {
    const { jobName } = req.params;
    await cronManager.runJobNow(jobName);

    res.json({
      success: true,
      message: `Cron job ${jobName} executed successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to run cron job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
