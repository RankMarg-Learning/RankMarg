import dotenv from "dotenv";
import path from "path";

// Load environment variables
try {
  dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
} catch (error) {
  console.log("No .env file found, using system environment variables");
}

export const ServerConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL!,
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL!,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  cron: {
    daily: {
      resetStreak: "0 0 * * *",
      updatePerformance: "0 0 * * *",
      createSuggestion: "0 0 * * *",
    },
    weekly: {
      updateReview: "0 0 * * 0",
      updateMastery: "0 0 * * 0",
      updateLearningProgress: "0 1 * * 0",
    },
    frequent: {
      createSession: "0 0 * * *", // Every 3 minutes
    },
  },

  api: {
    prefix: "/api",
    routes: {
      health: "/health",
      redis: "/health/redis",
      cache: "/cache",
      upstash: "/upstash",
      session: "/create-practice",
      mastery: "/update-mastery",
      performance: "/update-performance",
      reviews: "/update-review",
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV === "production" ? "json" : "simple",
  },

  security: {
    jwtSecret: process.env.JWT_SECRET,
    bcryptRounds: 12,
  },

  performance: {
    requestTimeout: 30000, // 30 seconds
    maxPayloadSize: "10mb",
  },
} as const;

export default ServerConfig;
