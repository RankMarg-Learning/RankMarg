import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Logger } from "@/lib/logger";

const logger = new Logger("Update Questions Per Day");


export const updateQuestionsPerDayJob = async () => {
  try {
    logger.info("Running update questions per day job");
    const userActivityController = new UserActivityController();
    const mockReq = {} as any;
    const mockRes = {
      status: (code: number) => mockRes,
      json: (data: any) => {
        logger.info(`Update questions per day completed: ${data.message}`);
        logger.info(`Users updated: ${data.data?.usersUpdated || 0}`);
      },
    } as any;
    await userActivityController.updateTotalQuestions(mockReq, mockRes);
    logger.info("Update questions per day job completed successfully");
  } catch (error) {
    logger.error(
      `Error in update questions per day cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

