import { Logger } from "@/lib/logger";
import { ReviewScheduleService } from "../services/reviewSchedule.service";

export const updateReviewJob = async () => {
  const logger = new Logger("Update Review");
  try {
    logger.info("Update Learning Progress Job Started......");

    const review = new ReviewScheduleService();
    await review.processAllUsers();

    logger.info("Learning progress update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
