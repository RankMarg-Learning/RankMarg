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
import { updateLearningProgressJob } from "./jobs/learning.update.job";
import { createSessionJob } from "./jobs/session.create.job";
import { createSuggestion } from "./jobs/suggest.create.job";
import redisService from "./lib/redis";
import { RedisCacheService } from "./services/session/RedisCacheService";

// Load environment variables from .env file if it exists, otherwise use system environment variables
try {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
} catch (error) {
  console.log("No .env file found, using system environment variables");
}

const app = express();

app.use(cors());
app.use(express.json());

async function initializeRedis() {
  try {
    await redisService.connect();
    console.log("✅ Redis connected successfully");

    const connectionTest = await RedisCacheService.testConnection();
    if (connectionTest.connected) {
      console.log(
        `✅ Upstash Redis connection test passed (latency: ${connectionTest.latency}ms)`
      );
    } else {
      console.warn(
        "⚠️ Upstash Redis connection test failed:",
        connectionTest.error
      );
    }
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
  }
}

app.get("/api/health/redis", async (req, res) => {
  try {
    const isHealthy = await RedisCacheService.healthCheck();
    const stats = await RedisCacheService.getCacheStats();
    const connectionTest = await RedisCacheService.testConnection();

    res.json({
      status: isHealthy ? "healthy" : "unhealthy",
      redis: {
        connected: redisService.isClientConnected(),
        ping: await RedisCacheService.ping(),
        stats,
        upstash: {
          connectionTest,
          isUpstash:
            process.env.REDIS_URL?.includes("upstash.io") ||
            process.env.UPSTASH_REDIS_REST_URL?.includes("upstash.io"),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Redis health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/upstash/stats", async (req, res) => {
  try {
    const detailedStats = await RedisCacheService.getDetailedStats();
    res.json(detailedStats);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get Upstash stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/upstash/test", async (req, res) => {
  try {
    const connectionTest = await RedisCacheService.testConnection();
    res.json(connectionTest);
  } catch (error) {
    res.status(500).json({
      error: "Failed to test Upstash connection",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/upstash/warm-cache", async (req, res) => {
  try {
    const { userId, subjectId } = req.body;

    if (!userId || !subjectId) {
      res.status(400).json({
        error: "Missing required parameters: userId and subjectId",
      });
      return;
    }

    await RedisCacheService.warmCache(userId, subjectId);
    res.json({
      success: true,
      message: `Cache warming initiated for user ${userId} and subject ${subjectId}`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to warm cache",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/cache/clear", async (req, res) => {
  try {
    const { userId, subjectId } = req.body;

    if (userId) {
      await RedisCacheService.invalidateUserCache(userId);
    }

    if (subjectId) {
      await RedisCacheService.invalidateSubjectCache(subjectId);
    }

    res.json({ success: true, message: "Cache cleared successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/cache/stats", async (req, res) => {
  try {
    const stats = await RedisCacheService.getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get cache stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

cron.schedule("0 0 * * *", resetStreakJob); //(Daily at Midnight)
cron.schedule("0 0 * * *", updatePerformanceJob); // (Every 5 minutes)
cron.schedule("*/3 * * * *", createSessionJob); // (Daily at Midnight)
cron.schedule("0 0 * * *", createSuggestion); // (Daily at Midnight)
cron.schedule("0 0 * * 0", updateReviewJob);
cron.schedule("0 0 * * 0", updateMasteryJob);
cron.schedule("0 1  * * 0", updateLearningProgressJob); // unified (1 AM Sunday)

app.use("/api/create-practice", session);
app.use("/api/update-mastery", mastery);
app.use("/api/update-performance", performance);
app.use("/api/update-review", reviews);

const PORT = process.env.PORT || 3001;

// Basic health endpoint for container orchestration
app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

initializeRedis().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);
    console.log(`📊 Redis health check available at /api/health/redis`);
    console.log(`🗑️  Cache management available at /api/cache/*`);
    console.log(`☁️  Upstash specific endpoints available at /api/upstash/*`);
  });
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await redisService.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await redisService.disconnect();
  process.exit(0);
});
