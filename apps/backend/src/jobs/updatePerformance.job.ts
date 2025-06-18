import { logger } from "@/lib/logger";
import { PerformanceService } from "@/services/auto/performance.service";

export const updatePerformanceJob = async () => {
  try {
    logger.info("Running performance update for JEE/NEET students");

    const performanceService = new PerformanceService();
    await performanceService.processAllUsers();

    logger.info("Performance update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
