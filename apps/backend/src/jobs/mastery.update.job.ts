import { logger } from "@/lib/logger";
import { LearningProgressService } from "@/services/learning/LearningProgressService";

export const updateMasteryJob = async () => {
  try {
    logger.info("Update Mastery Job Started......");

    const learning = new LearningProgressService();
    await learning.processAllUsers();

    logger.info(
      "Learning progress (mastery + review) update completed successfully"
    );
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
