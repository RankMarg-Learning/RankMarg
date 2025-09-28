import { Logger } from "@/lib/logger";
import { PerformanceService } from "@/jobs/services/performance.service";

export const updatePerformanceJob = async () => {
  const logger = new Logger("update Performance");
  try {
    logger.info("Running performance update for users with registered exams");

    const performanceService = new PerformanceService();
    await performanceService.processAllUsers();

    logger.info("Performance update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
