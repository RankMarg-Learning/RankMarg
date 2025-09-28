import { Logger } from "@/lib/logger";

export const testJob = async () => {
  const logger = new Logger("Test");
  try {
    logger.info("Running test job");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
