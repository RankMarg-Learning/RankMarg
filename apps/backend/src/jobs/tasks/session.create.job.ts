import { Logger } from "@/lib/logger";
import { PracticeService } from "@/jobs/services/session.service";

export const createSessionJob = async () => {
  const logger = new Logger("Create Session");
  try {
    logger.info("Running practice creation for users with registered exams");

    const session = new PracticeService();
    await session.processAllUsers();

    logger.info("Practice creation completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
