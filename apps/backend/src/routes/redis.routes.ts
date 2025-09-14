import { Router, Request, Response } from "express";
import { RedisCacheService } from "../services/redisCache.service";
import redisService from "../lib/redis";

const router = Router();

/**
 * Redis health check endpoint
 * GET /health/redis
 */
router.get("/health", async (_req: Request, res: Response) => {
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

/**
 * Get detailed Upstash statistics
 * GET /upstash/stats
 */
router.get("/upstash/stats", async (_req: Request, res: Response) => {
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

/**
 * Test Upstash connection
 * GET /upstash/test
 */
router.get("/upstash/test", async (_req: Request, res: Response) => {
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

/**
 * Warm cache for specific user and subject
 * POST /upstash/warm-cache
 */
router.post("/upstash/warm-cache", async (req: Request, res: Response) => {
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

/**
 * Clear cache for user and/or subject
 * POST /cache/clear
 */
router.post("/cache/clear", async (req: Request, res: Response) => {
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

/**
 * Get cache statistics
 * GET /cache/stats
 */
router.get("/cache/stats", async (_req: Request, res: Response) => {
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

export default router;
