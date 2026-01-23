import "./alias"; // Must be the first import to register aliases

import { ServerConfig } from "./config/server.config";
import { cronManager } from "./config/cron.config";
import redisService from "./lib/redis";
import { RedisCacheService } from "./services/redisCache.service";
import app from "./app";

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

cronManager.initialize();

initializeRedis().then(async () => {
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
