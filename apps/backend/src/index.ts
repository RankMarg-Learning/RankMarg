import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@": __dirname,
});

import express, { Request, Response } from "express";
import cors from "cors";
import session from "./routes/session";
import mastery from "./routes/mastery";
import performance from "./routes/performance";
import reviews from "./routes/reviews";
import cronRoutes from "./routes/cron.routes";
// import profileRoutes from "./routes/profile.routes";
import { ServerConfig } from "./config/server.config";
import { cronManager } from "./config/cron.config";
import redisService from "./lib/redis";
import { RedisCacheService } from "./services/session/RedisCacheService";
// import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors(ServerConfig.cors));
app.use(express.json({ limit: ServerConfig.performance.maxPayloadSize }));

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

app.get(`${ServerConfig.api.routes.redis}`, async (res: Response) => {
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

app.get(`${ServerConfig.api.routes.upstash}/stats`, async (res: Response) => {
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

app.get(`${ServerConfig.api.routes.upstash}/test`, async (res: Response) => {
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

app.post(
  `${ServerConfig.api.routes.upstash}/warm-cache`,
  async (req: Request, res: Response) => {
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
  }
);

app.post(
  `${ServerConfig.api.routes.cache}/clear`,
  async (req: Request, res: Response) => {
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
  }
);

app.get(`${ServerConfig.api.routes.cache}/stats`, async (res: Response) => {
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

// Initialize cron jobs
cronManager.initialize();

// API routes
app.use(`${ServerConfig.api.routes.session}`, session);
app.use(`${ServerConfig.api.routes.mastery}`, mastery);
app.use(`${ServerConfig.api.routes.performance}`, performance);
app.use(`${ServerConfig.api.routes.reviews}`, reviews);
app.use(`${ServerConfig.api.prefix}/cron`, cronRoutes);

// New v2 profile routes with proper structure
// app.use(`${ServerConfig.api.prefix}/v2/profile`, profileRoutes);

// Basic health endpoint for container orchestration
app.get(ServerConfig.api.routes.health, (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// Error handling middleware (must be last)
// app.use(notFoundHandler);
// app.use(errorHandler);

initializeRedis().then(() => {
  app.listen(ServerConfig.port, () => {
    console.log(`🚀 API running on port ${ServerConfig.port}`);
    console.log(
      `📊 Redis health check available at ${ServerConfig.api.routes.redis}`
    );
    console.log(
      `🗑️  Cache management available at ${ServerConfig.api.routes.cache}/*`
    );
    console.log(
      `☁️  Upstash specific endpoints available at ${ServerConfig.api.routes.upstash}/*`
    );
    console.log(
      `⏰ Cron job management available at ${ServerConfig.api.prefix}/cron/*`
    );
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
