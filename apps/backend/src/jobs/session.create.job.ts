import { logger } from "@/lib/logger";
import { PracticeService } from "@/services/auto/session.service";

export const createSessionJob = async () => {
  try {
    logger.info("Running practice creation for JEE/NEET students");

    const session = new PracticeService();
    await session.processAllUsers();

    logger.info("Practice creation completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
