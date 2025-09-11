import moduleAlias from "module-alias";
moduleAlias.addAliases({
  "@": __dirname,
});

import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import configurePassport from "./config/passport.config";
import sessionRoutes from "./routes/session";
import mastery from "./routes/mastery";
import performance from "./routes/performance";
import reviews from "./routes/reviews";
import cronRoutes from "./routes/cron.routes";
import { ServerConfig } from "./config/server.config";
import { cronManager } from "./config/cron.config";
import redisService from "./lib/redis";
import { RedisCacheService } from "./services/redisCache.service";
import { errorHandler } from "./middleware/error.middleware";

import { routes } from "./routes";
// import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors(ServerConfig.cors));
app.use(express.json({ limit: ServerConfig.performance.maxPayloadSize }));
app.use(cookieParser(ServerConfig.security.session.secret)); // Parse cookies with the same secret as sessions

// Configure session
app.use(expressSession(ServerConfig.security.session));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

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
app.use(`${ServerConfig.api.routes.session}`, sessionRoutes);
app.use(`${ServerConfig.api.routes.mastery}`, mastery);
app.use(`${ServerConfig.api.routes.performance}`, performance);
app.use(`${ServerConfig.api.routes.reviews}`, reviews);
app.use(`${ServerConfig.api.prefix}/cron`, cronRoutes);

// New v2 profile routes with proper structure
// app.use(`${ServerConfig.api.prefix}/v2/profile`, profileRoutes);

app.use(`${ServerConfig.api.prefix}/dashboard`, routes.dashboard);
app.use(`${ServerConfig.api.prefix}/attempts`, routes.attempt);
app.use(`${ServerConfig.api.prefix}/current-topic`, routes.currentTopic);
app.use(`${ServerConfig.api.prefix}/onboarding`, routes.onboarding);
app.use(`${ServerConfig.api.prefix}/mastery`, routes.mastery);
app.use(`${ServerConfig.api.prefix}/mistake-tracker`, routes.mistakeTracker);
app.use(`${ServerConfig.api.prefix}/practice-sessions`, routes.practiceSession);
app.use(`${ServerConfig.api.prefix}/test`, routes.test);
app.use(`${ServerConfig.api.prefix}/analytics`, routes.analytics);
app.use(`${ServerConfig.api.prefix}/topics`, routes.topics);
app.use(`${ServerConfig.api.prefix}/subjects`, routes.subjects);
app.use(`${ServerConfig.api.prefix}/subtopics`, routes.subtopics);
app.use(`${ServerConfig.api.prefix}/question`, routes.question);
app.use(`${ServerConfig.api.prefix}/suggestion`, routes.suggestion);
app.use(`${ServerConfig.api.prefix}/user`, routes.user);

// Authentication routes
app.use(`${ServerConfig.api.prefix}/auth`, routes.auth);

// Basic health endpoint for container orchestration
app.get(ServerConfig.api.routes.health, (_req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// Error handling middleware (must be last)
// app.use(notFoundHandler);
app.use(errorHandler);

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
