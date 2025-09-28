import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Logger } from "@/lib/logger";

/**
 * Cron job to update user activity status
 * Runs daily at 3 AM to mark users as inactive if they haven't solved questions in 14+ days
 */

const logger = new Logger("Update activity");

export const updateUserActivityJob = async () => {
  try {
    logger.info("Running user activity update job");

    const userActivityController = new UserActivityController();

    const mockReq = {} as any;
    const mockRes = {
      status: (code: number) => mockRes,
      json: (data: any) => {
        logger.info(`User activity update completed: ${data.message}`);
        if (data.data?.inactiveUsersCount > 0) {
          logger.info(
            `Marked ${data.data.inactiveUsersCount} users as inactive`
          );
        }
        return mockRes;
      },
    } as any;

    await userActivityController.updateIsActive(mockReq, mockRes);

    logger.info("User activity update job completed successfully");
  } catch (error) {
    logger.error(
      `Error in user activity cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const subscriptionExpiredJob = async () => {
  try {
    logger.info("Running subscription expired job");
    const userActivityController = new UserActivityController();
    const mockReq = {} as any;
    const mockRes = {
      status: (code: number) => mockRes,
      json: (data: any) => {
        logger.info(`Subscription expired completed: ${data.message}`);
      },
    } as any;
    await userActivityController.subscriptionExpired(mockReq, mockRes);
    logger.info("Subscription expired job completed successfully");
  } catch (error) {
    logger.error(
      `Error in subscription expired cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
