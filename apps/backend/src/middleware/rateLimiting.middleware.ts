import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { ApiError, ErrorCode, RATE_LIMITS } from "../types/common";
import redisService from "../lib/redis";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory fallback store
const memoryStore: RateLimitStore = {};

export const rateLimit = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        // For unauthenticated users, use IP-based rate limiting
        return next();
      }

      const userId = req.user.id;
      const userTier = req.user.plan.status;
      const rateLimitConfig = RATE_LIMITS[userTier];

      const key = `rate_limit:${userId}`;
      const windowStart =
        Math.floor(Date.now() / rateLimitConfig.windowMs) *
        rateLimitConfig.windowMs;
      const resetTime = windowStart + rateLimitConfig.windowMs;

      let currentCount = 0;

      try {
        // Try Redis first
        if (redisService.isClientConnected()) {
          const pipeline = redisService.getClient().multi();
          pipeline.incr(key);
          pipeline.expire(key, Math.ceil(rateLimitConfig.windowMs / 1000));
          const results = await pipeline.exec();

          if (results && results[0] && results[0][1]) {
            currentCount = results[0][1] as number;
          }
        } else {
          throw new Error("Redis not available");
        }
      } catch (redisError) {
        // Fallback to memory store
        console.warn("Redis unavailable, using memory store for rate limiting");

        if (!memoryStore[key] || memoryStore[key].resetTime <= Date.now()) {
          memoryStore[key] = { count: 1, resetTime };
          currentCount = 1;
        } else {
          memoryStore[key].count++;
          currentCount = memoryStore[key].count;
        }
      }

      // Add rate limit headers
      res.set({
        "X-RateLimit-Limit": rateLimitConfig.maxRequests.toString(),
        "X-RateLimit-Remaining": Math.max(
          0,
          rateLimitConfig.maxRequests - currentCount
        ).toString(),
        "X-RateLimit-Reset": new Date(resetTime).toISOString(),
        "X-RateLimit-Tier": userTier,
      });

      if (currentCount > rateLimitConfig.maxRequests) {
        throw new ApiError(
          ErrorCode.RATE_LIMITED,
          `Rate limit exceeded. Maximum ${rateLimitConfig.maxRequests} requests per ${rateLimitConfig.windowMs / 60000} minutes for ${userTier} tier.`,
          429
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
