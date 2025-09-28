import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Logger } from "@/lib/logger";

export const streakJob = async () => {
  const logger = new Logger("Streak");
  try {
    logger.info("Running Reset Streak Job");

    const userActivityController = new UserActivityController();

    const mockReq = {} as any;
    const mockRes = {
      status: (code: number) => mockRes,
      json: (data: any) => {
        logger.info(`Streak completed: ${data.message}`);
      },
    } as any;

    await userActivityController.resetStreak(mockReq, mockRes);

    logger.info("Streak Job completed successfully");
  } catch (error) {
    logger.error(
      `Error in Streak Job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
