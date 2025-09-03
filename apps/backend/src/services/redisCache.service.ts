import redisService from "../lib/redis";
import { GradeEnum, QCategory } from "@repo/db/enums";
import { SelectedQuestion, SessionConfig } from "../type/session.api.types";

interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
  connectedClients?: number;
  uptime?: number;
}

interface ConnectionTestResult {
  connected: boolean;
  latency: number;
  error?: string;
}

export class RedisCacheService {
  // Optimized TTL values based on data volatility
  private static readonly CACHE_TTL = {
    QUESTIONS: 7200, // 2 hours - questions don't change frequently
    USER_PERFORMANCE: 1800, // 30 minutes - performance data changes regularly
    SESSION_CONFIG: 14400, // 4 hours - configs are relatively stable
    WEAK_CONCEPTS: 3600, // 1 hour - concepts can change based on practice
    CURRENT_TOPICS: 1800, // 30 minutes - current topics change frequently
    REVISION_TOPICS: 3600, // 1 hour - revision topics are more stable
    SUBJECT_QUESTIONS: 10800, // 3 hours - subject questions are stable
    PRACTICE_SESSION: 86400, // 24 hours - sessions need to persist
  } as const;

  // Cache key generators for consistency
  private static generateKey(type: string, ...parts: string[]): string {
    return `${type}:${parts.filter(Boolean).join(":")}`;
  }

  // Generic cache operations with error handling
  private static async safeSetJson<T>(
    key: string,
    value: T,
    ttl: number
  ): Promise<boolean> {
    try {
      await redisService.setJson(key, value, ttl);
      return true;
    } catch (error) {
      console.error(`Cache SET failed for key ${key}:`, error);
      return false;
    }
  }

  private static async safeGetJson<T>(key: string): Promise<T | null> {
    try {
      return await redisService.getJson<T>(key);
    } catch (error) {
      console.error(`Cache GET failed for key ${key}:`, error);
      return null;
    }
  }

  // Question caching with improved key management
  static async cacheQuestionsBySubject(
    subjectId: string,
    questions: SelectedQuestion[],
    category: string
  ): Promise<boolean> {
    const key = this.generateKey("questions", "subject", subjectId, category);
    return this.safeSetJson(key, questions, this.CACHE_TTL.QUESTIONS);
  }

  static async getCachedQuestionsBySubject(
    subjectId: string,
    category: string
  ): Promise<SelectedQuestion[] | null> {
    const key = this.generateKey("questions", "subject", subjectId, category);
    return this.safeGetJson<SelectedQuestion[]>(key);
  }

  // User performance caching with validation
  static async cacheUserPerformance(
    userId: string,
    performance: Record<string, any>
  ): Promise<boolean> {
    if (!userId || !performance) {
      console.warn("Invalid parameters for cacheUserPerformance");
      return false;
    }

    const key = this.generateKey("user", "performance", userId);
    const enrichedPerformance = {
      ...performance,
      lastUpdated: Date.now(),
      version: "1.0",
    };

    return this.safeSetJson(
      key,
      enrichedPerformance,
      this.CACHE_TTL.USER_PERFORMANCE
    );
  }

  static async getCachedUserPerformance(
    userId: string
  ): Promise<Record<string, any> | null> {
    if (!userId) return null;

    const key = this.generateKey("user", "performance", userId);
    const performance = await this.safeGetJson<Record<string, any>>(key);

    // Check if cache is stale
    if (performance?.lastUpdated) {
      const age = Date.now() - performance.lastUpdated;
      if (age > this.CACHE_TTL.USER_PERFORMANCE * 1000) {
        await this.invalidateKey(key);
        return null;
      }
    }

    return performance;
  }

  // Session configuration with versioning
  static async cacheSessionConfig(
    examCode: string,
    grade: GradeEnum,
    config: SessionConfig
  ): Promise<boolean> {
    const key = this.generateKey("session", "config", examCode, grade);
    const versionedConfig = {
      ...config,
      version: "1.0",
      cachedAt: Date.now(),
    };

    return this.safeSetJson(
      key,
      versionedConfig,
      this.CACHE_TTL.SESSION_CONFIG
    );
  }

  static async getCachedSessionConfig(
    examCode: string,
    grade: GradeEnum
  ): Promise<SessionConfig | null> {
    const key = this.generateKey("session", "config", examCode, grade);
    const config = await this.safeGetJson<
      SessionConfig & { version?: string; cachedAt?: number }
    >(key);

    // Version check for backwards compatibility
    if (config && !config.version) {
      await this.invalidateKey(key);
      return null;
    }

    return config;
  }

  // Weak concepts with structured data
  static async cacheWeakConcepts(
    userId: string,
    subjectId: string,
    concepts: Array<{
      topicId: string;
      masteryLevel: number;
      strengthIndex: number;
      lastAssessed?: number;
    }>
  ): Promise<boolean> {
    if (!userId || !subjectId || !Array.isArray(concepts)) {
      return false;
    }

    const key = this.generateKey("weak", "concepts", userId, subjectId);
    const enrichedConcepts = concepts.map((concept) => ({
      ...concept,
      lastAssessed: concept.lastAssessed || Date.now(),
    }));

    return this.safeSetJson(
      key,
      enrichedConcepts,
      this.CACHE_TTL.WEAK_CONCEPTS
    );
  }

  static async getCachedWeakConcepts(
    userId: string,
    subjectId: string
  ): Promise<Array<{
    topicId: string;
    masteryLevel: number;
    strengthIndex: number;
    lastAssessed?: number;
  }> | null> {
    if (!userId || !subjectId) return null;

    const key = this.generateKey("weak", "concepts", userId, subjectId);
    return this.safeGetJson<any[]>(key);
  }

  // Current topics with metadata
  static async cacheCurrentTopics(
    userId: string,
    subjectId: string,
    topics: Array<Record<string, any>>
  ): Promise<boolean> {
    if (!Array.isArray(topics)) return false;

    const key = this.generateKey("current", "topics", userId, subjectId);
    const topicsWithMetadata = {
      topics,
      count: topics.length,
      lastUpdated: Date.now(),
    };

    return this.safeSetJson(
      key,
      topicsWithMetadata,
      this.CACHE_TTL.CURRENT_TOPICS
    );
  }

  static async getCachedCurrentTopics(
    userId: string,
    subjectId: string
  ): Promise<Array<Record<string, any>> | null> {
    const key = this.generateKey("current", "topics", userId, subjectId);
    const data = await this.safeGetJson<{
      topics: Array<Record<string, any>>;
      count: number;
      lastUpdated: number;
    }>(key);

    return data?.topics || null;
  }

  // Revision topics with smart invalidation
  static async cacheRevisionTopics(
    userId: string,
    subjectId: string,
    topics: string[]
  ): Promise<boolean> {
    if (!Array.isArray(topics)) return false;

    const key = this.generateKey("revision", "topics", userId, subjectId);
    const topicsData = {
      topics: [...new Set(topics)], // Remove duplicates
      count: topics.length,
      lastUpdated: Date.now(),
    };

    return this.safeSetJson(key, topicsData, this.CACHE_TTL.REVISION_TOPICS);
  }

  static async getCachedRevisionTopics(
    userId: string,
    subjectId: string
  ): Promise<string[] | null> {
    const key = this.generateKey("revision", "topics", userId, subjectId);
    const data = await this.safeGetJson<{
      topics: string[];
      count: number;
      lastUpdated: number;
    }>(key);

    return data?.topics || null;
  }

  // Subject questions with better categorization
  static async cacheSubjectQuestions(
    subjectId: string,
    category: QCategory,
    difficulty: number,
    questions: SelectedQuestion[]
  ): Promise<boolean> {
    if (!Array.isArray(questions)) return false;

    const key = this.generateKey(
      "subject",
      "questions",
      subjectId,
      category,
      difficulty.toString()
    );
    const questionsData = {
      questions,
      count: questions.length,
      category,
      difficulty,
      cachedAt: Date.now(),
    };

    return this.safeSetJson(
      key,
      questionsData,
      this.CACHE_TTL.SUBJECT_QUESTIONS
    );
  }

  static async getCachedSubjectQuestions(
    subjectId: string,
    category: QCategory,
    difficulty: number
  ): Promise<SelectedQuestion[] | null> {
    const key = this.generateKey(
      "subject",
      "questions",
      subjectId,
      category,
      difficulty.toString()
    );
    const data = await this.safeGetJson<{
      questions: SelectedQuestion[];
      count: number;
      category: QCategory;
      difficulty: number;
      cachedAt: number;
    }>(key);

    return data?.questions || null;
  }

  // Practice session with enhanced metadata
  static async cachePracticeSession(
    userId: string,
    sessionId: string,
    sessionData: Record<string, any>
  ): Promise<boolean> {
    const key = this.generateKey("practice", "session", userId, sessionId);
    const enhancedData = {
      ...sessionData,
      sessionId,
      cachedAt: Date.now(),
      version: "1.0",
    };

    return this.safeSetJson(key, enhancedData, this.CACHE_TTL.PRACTICE_SESSION);
  }

  static async getCachedPracticeSession(
    userId: string,
    sessionId: string
  ): Promise<Record<string, any> | null> {
    const key = this.generateKey("practice", "session", userId, sessionId);
    return this.safeGetJson(key);
  }

  // Optimized batch operations
  static async cacheMultipleQuestions(
    questionsMap: Map<string, SelectedQuestion[]>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Use controlled concurrency to avoid overwhelming Redis
    const BATCH_SIZE = 10;
    const entries = Array.from(questionsMap.entries());

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async ([key, questions]) => {
          const cacheKey = this.generateKey("questions", "batch", key);
          return this.safeSetJson(
            cacheKey,
            questions,
            this.CACHE_TTL.QUESTIONS
          );
        })
      );

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          success++;
        } else {
          failed++;
        }
      });
    }

    console.log(`Batch cache operation: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  // Improved cache invalidation
  private static async invalidateKey(key: string): Promise<boolean> {
    try {
      await redisService.del(key);
      return true;
    } catch (error) {
      console.error(`Failed to invalidate key ${key}:`, error);
      return false;
    }
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    if (!userId) return;

    const keysToInvalidate = [
      this.generateKey("user", "performance", userId),
      // Since we can't use patterns in Upstash easily, we'll track keys
    ];

    const results = await Promise.allSettled(
      keysToInvalidate.map((key) => this.invalidateKey(key))
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.warn(
        `Failed to invalidate ${failed} user cache keys for ${userId}`
      );
    }
  }

  static async invalidateSubjectCache(subjectId: string): Promise<void> {
    if (!subjectId) return;

    // For Upstash, we need to track keys or use a different approach
    console.log(`Invalidating subject cache for ${subjectId}`);

    // This is a placeholder - in production, you might want to maintain
    // a registry of keys per subject for efficient invalidation
  }

  // Enhanced health monitoring
  static async getCacheStats(): Promise<CacheStats> {
    try {
      // Try Upstash-specific stats first
      const upstashStats = await redisService.getUpstashStats?.();

      if (upstashStats) {
        return {
          totalKeys: upstashStats.totalKeys || 0,
          memoryUsage: upstashStats.memoryUsage || "N/A",
          hitRate: 0, // Would need custom tracking
          connectedClients: upstashStats.connectedClients,
          uptime: upstashStats.uptime,
        };
      }

      // Fallback to basic stats
      const [info, keys] = await Promise.allSettled([
        redisService.info?.("memory"),
        redisService.dbSize?.(),
      ]);

      return {
        totalKeys: keys.status === "fulfilled" ? keys.value || 0 : 0,
        memoryUsage: info.status === "fulfilled" ? info.value || "N/A" : "N/A",
        hitRate: 0,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return {
        totalKeys: 0,
        memoryUsage: "N/A",
        hitRate: 0,
      };
    }
  }

  // Comprehensive health check
  static async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    checks: Record<string, boolean>;
    latency: number;
    timestamp: string;
  }> {
    const startTime = Date.now();
    const checks: Record<string, boolean> = {};

    try {
      // Basic ping test
      const pingResult = await redisService.ping();
      checks.ping = pingResult === "PONG";

      // Test set/get operations
      const testKey = `health:check:${Date.now()}`;
      const testValue = { test: true, timestamp: Date.now() };

      await redisService.setJson(testKey, testValue, 10);
      const retrieved = await redisService.getJson(testKey);
      checks.setGet = JSON.stringify(retrieved) === JSON.stringify(testValue);

      // Cleanup test key
      await redisService.del(testKey).catch(() => {});

      // Test info command if available
      try {
        await redisService.info?.();
        checks.info = true;
      } catch {
        checks.info = false;
      }

      const latency = Date.now() - startTime;
      const healthyChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;

      let status: "healthy" | "degraded" | "unhealthy";
      if (healthyChecks === totalChecks && latency < 100) {
        status = "healthy";
      } else if (healthyChecks >= totalChecks * 0.7 && latency < 500) {
        status = "degraded";
      } else {
        status = "unhealthy";
      }

      return {
        status,
        checks,
        latency,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        checks,
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Simple ping for basic connectivity
  static async ping(): Promise<string | null> {
    try {
      return await redisService.ping();
    } catch (error) {
      console.error("Redis ping failed:", error);
      return null;
    }
  }

  // Enhanced stats for monitoring
  static async getDetailedStats(): Promise<Record<string, any> | null> {
    try {
      const [upstashStats, info, healthCheck] = await Promise.allSettled([
        redisService.getUpstashStats?.(),
        redisService.info?.(),
        this.healthCheck(),
      ]);

      return {
        upstash:
          upstashStats.status === "fulfilled" ? upstashStats.value : null,
        info: info.status === "fulfilled" ? info.value : null,
        health: healthCheck.status === "fulfilled" ? healthCheck.value : null,
        timestamp: new Date().toISOString(),
        ttlConfig: this.CACHE_TTL,
      };
    } catch (error) {
      console.error("Error getting detailed stats:", error);
      return null;
    }
  }

  // Cache warming with intelligent pre-loading
  static async warmCache(
    userId: string,
    subjectId: string,
    options: {
      preloadPerformance?: boolean;
      preloadTopics?: boolean;
      preloadQuestions?: boolean;
    } = {}
  ): Promise<void> {
    const {
      preloadPerformance = true,
      preloadTopics = true,
      preloadQuestions = false,
    } = options;

    try {
      const warmingPromises: Promise<any>[] = [];

      if (preloadPerformance) {
        const performanceKey = this.generateKey("user", "performance", userId);
        warmingPromises.push(
          this.safeGetJson(performanceKey).then((data) => {
            if (!data) {
              console.log(`Performance cache miss for user: ${userId}`);
            }
          })
        );
      }

      if (preloadTopics) {
        const topicsKey = this.generateKey(
          "current",
          "topics",
          userId,
          subjectId
        );
        warmingPromises.push(
          this.safeGetJson(topicsKey).then((data) => {
            if (!data) {
              console.log(
                `Topics cache miss for user: ${userId}, subject: ${subjectId}`
              );
            }
          })
        );
      }

      if (preloadQuestions) {
        const questionsKey = this.generateKey(
          "questions",
          "subject",
          subjectId,
          "currentTopic"
        );
        warmingPromises.push(
          this.safeGetJson(questionsKey).then((data) => {
            if (!data) {
              console.log(`Questions cache miss for subject: ${subjectId}`);
            }
          })
        );
      }

      await Promise.allSettled(warmingPromises);
      console.log(
        `Cache warming completed for user: ${userId}, subject: ${subjectId}`
      );
    } catch (error) {
      console.error("Error warming cache:", error);
    }
  }

  // Connection testing with detailed metrics
  static async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      const pingResult = await redisService.ping();
      const basicLatency = Date.now() - startTime;

      if (pingResult !== "PONG") {
        return {
          connected: false,
          latency: basicLatency,
          error: "Ping returned unexpected result",
        };
      }

      // Test read/write operations
      // const operationStart = Date.now();
      const testKey = `connection:test:${Date.now()}`;
      const testData = { timestamp: Date.now(), test: "connection" };

      await redisService.setJson(testKey, testData, 10);
      const retrieved = await redisService.getJson(testKey);
      await redisService.del(testKey);

      // const operationLatency = Date.now() - operationStart;
      const totalLatency = Date.now() - startTime;

      const isDataValid =
        JSON.stringify(retrieved) === JSON.stringify(testData);

      if (!isDataValid) {
        return {
          connected: false,
          latency: totalLatency,
          error: "Data integrity check failed",
        };
      }

      return {
        connected: true,
        latency: totalLatency,
      };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error:
          error instanceof Error ? error.message : "Unknown connection error",
      };
    }
  }

  // Cache cleanup utilities
  static async cleanupExpiredKeys(): Promise<void> {
    // Note: This is a placeholder for Upstash
    // Upstash handles TTL automatically, but you might want to implement
    // custom cleanup logic for specific patterns
    console.log("Upstash handles TTL automatically - no manual cleanup needed");
  }

  // Performance monitoring
  static async getPerformanceMetrics(): Promise<{
    averageLatency: number;
    errorRate: number;
    throughput: number;
    timestamp: string;
  }> {
    // This would require implementing custom metrics tracking
    // For now, return placeholder values
    return {
      averageLatency: 0,
      errorRate: 0,
      throughput: 0,
      timestamp: new Date().toISOString(),
    };
  }

  // Cache size management
  static async getCacheSize(pattern?: string): Promise<{
    keyCount: number;
    estimatedSize: string;
    pattern: string | undefined;
  }> {
    try {
      // For Upstash, we can get total key count
      const keyCount = (await redisService.dbSize?.()) || 0;

      return {
        keyCount,
        estimatedSize: "N/A", // Upstash doesn't provide detailed size info
        pattern,
      };
    } catch (error) {
      return {
        keyCount: 0,
        estimatedSize: "N/A",
        pattern,
      };
    }
  }

  // Batch invalidation for efficiency
  static async batchInvalidate(keys: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const BATCH_SIZE = 20;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((key) => this.invalidateKey(key))
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          success++;
        } else {
          failed++;
          const error =
            result.status === "rejected"
              ? result.reason?.message || "Unknown error"
              : "Invalidation returned false";
          errors.push(`${batch[index]}: ${error}`);
        }
      });
    }

    return { success, failed, errors };
  }

  // Memory pressure handling
  static async handleMemoryPressure(_maxMemoryMB: number = 100): Promise<{
    action: "none" | "cleanup" | "warning";
    message: string;
  }> {
    try {
      // const stats = await this.getCacheStats();

      // This is a simplified check - in practice you'd need more sophisticated
      // memory monitoring based on your Redis instance specs

      return {
        action: "none",
        message: "Memory monitoring not fully implemented for Upstash",
      };
    } catch (error) {
      return {
        action: "warning",
        message: `Memory check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
