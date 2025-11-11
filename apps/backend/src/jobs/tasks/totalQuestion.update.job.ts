import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Logger } from "@/lib/logger";

const logger = new Logger("Update Total Questions");
export const updatePromocodeJob = async () => {
    try {
        logger.info("Running update total questions job");
        const userActivityController = new UserActivityController();
        const mockReq = {} as any;
        const mockRes = {
            status: (code: number) => mockRes,
            json: (data: any) => {
                logger.info(`Update total questions completed: ${data.message}`);
            },
        } as any;
        await userActivityController.updateTotalQuestions(mockReq, mockRes);
    logger.info("Update promo code job completed successfully");
  } catch (error) {
    logger.error(
      `Error in update total questions cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};