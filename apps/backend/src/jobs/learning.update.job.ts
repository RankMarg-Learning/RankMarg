import { logger } from "@/lib/logger";
import { LearningProgressService } from "@/services/learning/LearningProgressService";

export const updateLearningProgressJob = async () => {
  try {
    logger.info("Update Learning Progress Job Started......");

    const learning = new LearningProgressService();
    await learning.processAllUsers();

    logger.info("Learning progress update completed successfully");
  } catch (error) {
    logger.error(
      `Error in learning progress cron: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
