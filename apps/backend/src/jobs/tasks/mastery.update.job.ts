import { Logger } from "@/lib/logger";
import { MasteryService } from "../services/mastery.service";

const logger = new Logger("Update Mastery");

export const updateMasteryJob = async () => {
  try {
    logger.info("Update Mastery Job Started......");

    const mastery = new MasteryService();
    await mastery.processAllUsers();

    logger.info(
      "Learning progress (mastery + review) update completed successfully"
    );
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
