import { createClient, RedisClientType } from "redis";
import { ServerConfig } from "../config/server.config";

class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      const redisUrl = ServerConfig.redisFrontend.url;

      if (!redisUrl) {
        console.warn(
          "Redis URL not configured. Job storage will not persist across server restarts."
        );
        return;
      }

      const isUpstash =
        redisUrl.includes("upstash.io") || !!ServerConfig.redis.upstashToken;

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              console.error("Redis max reconnection attempts reached");
              return new Error("Redis max reconnection attempts reached");
            }
            return Math.min(Math.pow(2, retries) * 1000, 5000);
          },
          connectTimeout: 10000,
          ...(isUpstash && {
            tls: true,
            keepAlive: 30000,
          }),
        },
        ...(isUpstash && {
          pingInterval: 30000,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        }),
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize Redis client:", error);
      this.client = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on("connect", () => {
      console.log("Frontend Redis client connected");
      this.isConnected = true;
    });

    this.client.on("ready", () => {
      console.log("Frontend Redis client ready");
    });

    this.client.on("error", (err: Error) => {
      console.error("Frontend Redis client error:", err);
      this.isConnected = false;
    });

    this.client.on("end", () => {
      console.log("Frontend Redis client disconnected");
      this.isConnected = false;
    });

    this.client.on("reconnecting", () => {
      console.log("Frontend Redis client reconnecting...");
    });
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }

    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.client.connect().then(() => {});

    try {
      await this.connectionPromise;
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    } finally {
      this.connectionPromise = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.client) {
      throw new Error("Redis client not available");
    }

    if (!this.isConnected) {
      await this.connect();
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      await this.ensureConnection();
      const result = await this.client!.get(key);
      return typeof result === "string" ? result : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.ensureConnection();
      if (ttl) {
        await this.client!.setEx(key, ttl, value);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async setEx(key: string, ttl: number, value: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.client!.setEx(key, ttl, value);
    } catch (error) {
      console.error(`Redis SETEX error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await this.client!.expire(key, ttl);
      return result;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.hSet(key, field, value);
    } catch (error) {
      console.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      await this.ensureConnection();
      const result = await this.client!.hGet(key, field);
      return typeof result === "string" ? result : undefined;
    } catch (error) {
      console.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      await this.ensureConnection();
      return await this.client!.hGetAll(key);
    } catch (error) {
      console.error(`Redis HGETALL error for key ${key}:`, error);
      throw error;
    }
  }

  async hDel(key: string, field: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.hDel(key, field);
    } catch (error) {
      console.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async sAdd(key: string, member: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.sAdd(key, member);
    } catch (error) {
      console.error(`Redis SADD error for key ${key}:`, error);
      throw error;
    }
  }

  async sMembers(key: string): Promise<string[]> {
    try {
      await this.ensureConnection();
      return await this.client!.sMembers(key);
    } catch (error) {
      console.error(`Redis SMEMBERS error for key ${key}:`, error);
      throw error;
    }
  }

  async sRem(key: string, member: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.sRem(key, member);
    } catch (error) {
      console.error(`Redis SREM error for key ${key}:`, error);
      throw error;
    }
  }

  async lPush(key: string, value: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.lPush(key, value);
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      await this.ensureConnection();
      const result = await this.client!.rPop(key);
      return typeof result === "string" ? result : null;
    } catch (error) {
      console.error(`Redis RPOP error for key ${key}:`, error);
      throw error;
    }
  }

  async lLen(key: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.lLen(key);
    } catch (error) {
      console.error(`Redis LLEN error for key ${key}:`, error);
      throw error;
    }
  }

  async publish(channel: string, message: string): Promise<number> {
    try {
      await this.ensureConnection();
      return await this.client!.publish(channel, message);
    } catch (error) {
      console.error(`Redis PUBLISH error for channel ${channel}:`, error);
      throw error;
    }
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    try {
      await this.ensureConnection();
      await this.client!.subscribe(channel, callback);
    } catch (error) {
      console.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    try {
      await this.ensureConnection();
      return await this.client!.ping();
    } catch (error) {
      console.error("Redis PING error:", error);
      throw error;
    }
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  getClient(): RedisClientType | null {
    return this.client;
  }
}

// Create a singleton instance
export const redisClient = new RedisClient();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Graceful shutdown: disconnecting Redis client...");
  await redisClient.disconnect();
});

process.on("SIGINT", async () => {
  console.log("Graceful shutdown: disconnecting Redis client...");
  await redisClient.disconnect();
});

export default redisClient;
