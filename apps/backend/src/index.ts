import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import session from "./routes/session";
import mastery from "./routes/mastery";
import performance from "./routes/performance";
import reviews from "./routes/reviews";
import { logger } from "./lib/logger";
import { PerformanceService } from "./services/auto/performance.service";
import { ReviewScheduleService } from "./services/auto/reviewSchedule.service";
import { MasteryService } from "./services/auto/mastery.service";
import { PracticeService } from "./services/auto/session.service";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();

app.use(cors());
app.use(express.json());

cron.schedule("*/5 * * * *", async () => {
  try {
    logger.info("Running performance update for JEE/NEET students");

    const performanceService = new PerformanceService();
    await performanceService.processAllUsers();

    logger.info("Performance update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

//Update Review (Weekly)
cron.schedule("0 0 * * 0", async () => {
  try {
    logger.info("Running review update for JEE/NEET students");

    const review = new ReviewScheduleService();
    await review.processAllUsers();

    logger.info("Review update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

//Update Mastery (Weekly)
cron.schedule("0 0 * * 0", async () => {
  try {
    logger.info("Running mastery update for JEE/NEET students");

    const masteryService = new MasteryService();
    await masteryService.processAllUsers();

    logger.info("Mastery update completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

//Create Practice (Daily)
cron.schedule("0 0 * * *", async () => {
  try {
    logger.info("Running practice creation for JEE/NEET students");

    const session = new PracticeService();
    await session.processAllUsers();

    logger.info("Practice creation completed successfully");
  } catch (error) {
    logger.error(
      `Error in cron job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
});

app.use("/api/create-practice", session);
app.use("/api/update-mastery", mastery);
app.use("/api/update-performance", performance);
app.use("/api/update-review", reviews);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
