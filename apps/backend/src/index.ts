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
import redisRoutes from "./routes/redis.routes";
import { ServerConfig } from "./config/server.config";
import { cronManager } from "./config/cron.config";
import redisService from "./lib/redis";
import { RedisCacheService } from "./services/redisCache.service";
import { errorHandler } from "./middleware/error.middleware";
import { routes } from "./routes";

const app = express();

app.use(cors(ServerConfig.cors));
app.use(express.json({ limit: ServerConfig.performance.maxPayloadSize }));
app.use(cookieParser(ServerConfig.security.session.secret));

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

// Initialize cron jobs
cronManager.initialize();

// API routes
app.use(`${ServerConfig.api.routes.session}`, sessionRoutes);
app.use(`${ServerConfig.api.routes.mastery}`, mastery);
app.use(`${ServerConfig.api.routes.performance}`, performance);
app.use(`${ServerConfig.api.routes.reviews}`, reviews);

// Redis and cache management routes
app.use("/health/redis", redisRoutes);
app.use("/cache", redisRoutes);
app.use("/upstash", redisRoutes);

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
app.use(`${ServerConfig.api.prefix}/m`, routes.misc);
app.use(`${ServerConfig.api.prefix}/payment`, routes.payment);
app.use(`${ServerConfig.api.prefix}/exams`, routes.exam);
app.use(`${ServerConfig.api.prefix}/plans`, routes.plan);
app.use(`${ServerConfig.api.prefix}/promocodes`, routes.promoCode);
app.use(`${ServerConfig.api.prefix}/bulk-upload`, routes.bulkUpload);

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
    console.log(`📊 Redis health check available at /health/redis/health`);
    console.log(`🗑️  Cache management available at /cache/*`);
    console.log(`☁️  Upstash specific endpoints available at /upstash/*`);
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
