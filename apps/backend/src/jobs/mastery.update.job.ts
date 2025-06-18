import { logger } from "@/lib/logger";
import { MasteryService } from "@/services/auto/mastery.service";

export const updateMasteryJob = async () => {
  try {
    logger.info("Update Mastery Job Started......");

    const masteryService = new MasteryService();
    await masteryService.processAllUsers();

    logger.info("Mastery update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
