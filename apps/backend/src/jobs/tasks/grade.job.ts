import { Logger } from "@/lib/logger";
import { GradeService } from "../services/grade.service";

const logger = new Logger("Update Grade");

export const updateGradeJob = async () => {
  try {
    logger.info("Update Grade Job Started......");

    const grade = new GradeService();
    await grade.processAllUsers();

    logger.info("Grade update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
