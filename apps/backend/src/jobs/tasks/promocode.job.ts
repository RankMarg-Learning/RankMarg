import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Logger } from "@/lib/logger";

const logger = new Logger("Update Promo Code");
export const updatePromocodeJob = async () => {
    try {
        logger.info("Running update promo code job");
        const userActivityController = new UserActivityController();
        const mockReq = {} as any;
        const mockRes = {
            status: (code: number) => mockRes,
            json: (data: any) => {
                logger.info(`Update promo code completed: ${data.message}`);
            },
        } as any;
        await userActivityController.updatePromoCode(mockReq, mockRes);
    logger.info("Update promo code job completed successfully");
  } catch (error) {
    logger.error(
      `Error in update promo code cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};