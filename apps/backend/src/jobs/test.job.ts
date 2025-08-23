import { logger } from "@/lib/logger";

export const testJob = async () => {
  try {
    logger.info("Running test job");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
