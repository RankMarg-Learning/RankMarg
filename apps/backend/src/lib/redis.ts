import { createClient, RedisClientType } from "redis";
import { Logger } from "./logger";
import { ServerConfig } from "../config/server.config";

const logger = new Logger("RedisService");

class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    try {
      const redisUrl = ServerConfig.redis.url || ServerConfig.redis.upstashUrl;

      if (!redisUrl) {
        logger.error(
          "Redis URL not found. Please set REDIS_URL or UPSTASH_REDIS_REST_URL environment variable"
        );
        throw new Error("Redis URL not configured");
      }

      const isUpstash =
        redisUrl.includes("upstash.io") || !!ServerConfig.redis.upstashToken;

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error("Redis max reconnection attempts reached");
              return new Error("Redis max reconnection attempts reached");
            }
            return Math.min(Math.pow(2, retries) * 1000, 5000);
          },
          ...(isUpstash && {
            tls: true,
            keepAlive: 30000,
            connectTimeout: 10000,
          }),
        },
        ...(isUpstash && {
          pingInterval: 30000,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        }),
      });

      this.setupEventListeners();
    } catch (error: any) {
      logger.error(
        "Failed to initialize Redis client:",
        error?.message || error || "Unknown initialization error"
      );
      throw error;
    }
  }

  private setupEventListeners(): void {
    try {
      this.client.on("connect", () => {
        this.isConnected = true;
      });

      this.client.on("ready", () => {
      });

      this.client.on("error", (err: any) => {
        logger.error(
          "Redis client error:",
          err?.message || err || "Unknown Redis error"
        );
        this.isConnected = false;
      });

      this.client.on("end", () => {
        logger.info("Redis client disconnected");
        this.isConnected = false;
      });

      this.client.on("reconnecting", () => {
        logger.info("Redis client reconnecting...");
      });

      // Remove duplicate connect event listener
      // this.client.on("connect", () => {
      //   logger.info("Connected to Upstash Redis");
      // });
    } catch (error: any) {
      logger.error(
        "Failed to setup Redis event listeners:",
        error?.message || error || "Unknown error"
      );
    }
  }

  async connect(): Promise<void> {
    this.ensureClientInitialized();
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error: any) {
        logger.error(
          "Failed to connect to Redis:",
          error?.message || error || "Unknown connection error"
        );
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
      } catch (error: any) {
        logger.error(
          "Error disconnecting from Redis:",
          error?.message || error || "Unknown disconnect error"
        );
      }
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      await this.connect();
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.connect();
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
    }
  }

  async setEx(key: string, ttl: number, value: string): Promise<void> {
    try {
      await this.connect();
      await this.client.setEx(key, ttl, value);
    } catch (error) {
      logger.error(`Redis SETEX error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.connect();
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.connect();
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET JSON error for key ${key}:`, error);
      return null;
    }
  }

  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.set(key, jsonValue, ttl);
    } catch (error) {
      logger.error(`Redis SET JSON error for key ${key}:`, error);
    }
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    try {
      await this.connect();
      await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
    }
  }

  async hGetAll(key: string): Promise<Record<string, string> | null> {
    try {
      await this.connect();
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  async hDel(key: string, field: string): Promise<void> {
    try {
      await this.connect();
      await this.client.hDel(key, field);
    } catch (error) {
      logger.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
    }
  }

  async lPush(key: string, value: string): Promise<void> {
    try {
      await this.connect();
      await this.client.lPush(key, value);
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      await this.connect();
      return await this.client.rPop(key);
    } catch (error) {
      logger.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  async lLen(key: string): Promise<number> {
    try {
      await this.connect();
      return await this.client.lLen(key);
    } catch (error) {
      logger.error(`Redis LLEN error for key ${key}:`, error);
      return 0;
    }
  }

  async flushDb(): Promise<void> {
    try {
      await this.connect();
      await this.client.flushDb();
      logger.info("Redis database flushed");
    } catch (error) {
      logger.error("Redis FLUSHDB error:", error);
    }
  }

  async ping(): Promise<string | null> {
    try {
      await this.connect();
      return await this.client.ping();
    } catch (error) {
      logger.error("Redis PING error:", error);
      return null;
    }
  }

  async info(section?: string): Promise<string | null> {
    try {
      await this.connect();
      return await this.client.info(section);
    } catch (error) {
      logger.error("Redis INFO error:", error);
      return null;
    }
  }

  async dbSize(): Promise<number> {
    try {
      await this.connect();
      return await this.client.dbSize();
    } catch (error) {
      logger.error("Redis DBSIZE error:", error);
      return 0;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client && !this.client.isOpen === false;
  }

  private ensureClientInitialized(): void {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }
  }

  async getUpstashStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    connectedClients: number;
    uptime: number;
  } | null> {
    try {
      const info = await this.info();
      const dbSize = await this.dbSize();

      if (!info) return null;

      const lines = info.split("\n");
      const stats: any = {};

      lines.forEach((line) => {
        const [key, value] = line.split(":");
        if (key && value) {
          stats[key] = value.trim();
        }
      });

      return {
        totalKeys: dbSize,
        memoryUsage: stats.used_memory_human || "N/A",
        connectedClients: parseInt(stats.connected_clients) || 0,
        uptime: parseInt(stats.uptime_in_seconds) || 0,
      };
    } catch (error) {
      logger.error("Error getting Upstash stats:", error);
      return null;
    }
  }
}

const redisService = new RedisService();

export default redisService;
