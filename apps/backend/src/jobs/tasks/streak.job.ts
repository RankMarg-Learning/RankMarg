import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Logger } from "@/lib/logger";
import { addDays, setHours, setMinutes, setSeconds } from "date-fns";

export const streakJob = async () => {
  const logger = new Logger("Streak");
  try {
    logger.info("Running Reset Streak Job");

    const IST_OFFSET_MS: number = 5.5 * 60 * 60 * 1000;
    const now: Date = new Date();
    const istNow: Date = new Date(now.getTime() + IST_OFFSET_MS);

    let ist1150PM: Date = setSeconds(setMinutes(setHours(istNow, 23), 50), 0);

    if (
      istNow.getHours() < 23 ||
      (istNow.getHours() === 23 && istNow.getMinutes() < 50)
    ) {
      ist1150PM = addDays(ist1150PM, -1);
    }

    const from: Date = new Date(ist1150PM.getTime() - IST_OFFSET_MS);
    const to: Date = new Date(from.getTime() + 24 * 60 * 60 * 1000);

    logger.info(
      `Streak job processing date range: ${from.toISOString()} to ${to.toISOString()}`
    );

    const userActivityController = new UserActivityController();

    const mockReq = {
      body: { from, to },
    } as any;
    const mockRes = {
      status: (code: number) => mockRes,
      json: (data: any) => {
        logger.info(`Streak completed: ${data.message}`);
        logger.info(
          `Streaks incremented: ${data.data?.streaksIncremented}, Streaks reset: ${data.data?.streaksReset}`
        );
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
