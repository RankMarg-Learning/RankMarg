import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@": __dirname,
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import session from "./routes/session";
import mastery from "./routes/mastery";
import performance from "./routes/performance";
import reviews from "./routes/reviews";
import path from "path";
import { updatePerformanceJob } from "./jobs/updatePerformance.job";
import { resetStreakJob } from "./jobs/resetStreak.job";
import { updateReviewJob } from "./jobs/review.update.job";
import { updateMasteryJob } from "./jobs/mastery.update.job";
import { createSessionJob } from "./jobs/session.create.job";
import { createSuggestion } from "./jobs/suggest.create.job";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();

app.use(cors());
app.use(express.json());

cron.schedule("0 0 * * *", resetStreakJob); //(Daily at Midnight)
cron.schedule("*/5 * * * *", updatePerformanceJob); // (Every 5 minutes)
cron.schedule("0 0 * * 0", updateReviewJob); //(Every Sunday at Midnight)
cron.schedule("0 0 * * 0", updateMasteryJob); // (Every Sunday at Midnight)
cron.schedule("0 0 * * *", createSessionJob); // (Daily at Midnight)
cron.schedule("0 0 * * *", createSuggestion); // (Daily at Midnight)

app.use("/api/create-practice", session);
app.use("/api/update-mastery", mastery);
app.use("/api/update-performance", performance);
app.use("/api/update-review", reviews);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
