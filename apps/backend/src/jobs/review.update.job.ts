import { logger } from "@/lib/logger";
import { ReviewScheduleService } from "@/services/auto/reviewSchedule.service";

export const updateReviewJob = async () => {
  try {
    logger.info("Update Review Job Started......");

    const review = new ReviewScheduleService();
    await review.processAllUsers();

    logger.info("Review update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
