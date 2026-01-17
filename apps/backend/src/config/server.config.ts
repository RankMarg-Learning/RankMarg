import dotenv from "dotenv";
import path from "path";

try {
  // dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") }); //npm run start test
  dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
} catch (error) {
  console.log("No .env file found, using system environment variables");
}

const DEFAULT_CORS_ORIGIN = "http://localhost:3000";

const corsOrigins = (
  process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN
)
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
if (corsOrigins.length === 0) {
  corsOrigins.push(DEFAULT_CORS_ORIGIN);
}

export const ServerConfig = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  resendApiKey: process.env.RESEND_API_KEY,
  emailAddress: process.env.EMAIL_ADDRESS,

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL,
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  redisFrontend: {
    url: process.env.REDIS_URL_FRONTEND!,
  },

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  s3: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  openai: {
    api_key: process.env.OPENAI_API_KEY,
  },
  razorpay: {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
  adminAPIKey: process.env.ADMIN_API_KEY,
  cron: {
    daily: {
      streak: "0 0 * * *",
      updatePerformance: "0 0 * * *",
      createSuggestion: "0 30 * * *", // 12:30 AM IST - Coaching suggestions based on yesterday's practice
    },
    weekly: {
      updateReview: "0 1 * * 0",
      updateMastery: "0 0 * * 0",
      updateLearningProgress: "0 1 * * 0",
    },
    frequent: {
      createSession: "0 0 * * *",
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
    session: {
      secret: process.env.JWT_SECRET || "rankmargsessionsecret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        domain: process.env.COOKIE_DOMAIN || undefined,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    },
  },

  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        `${process.env.NODE_ENV === "production" ? "https://" : "http://"}${process.env.NODE_ENV === "production" ? process.env.BACKEND_DOMAIN || "api.rankmarg.in" : "localhost:3001"}/api/auth/google/callback`,
    },
  },

  performance: {
    requestTimeout: 30000, // 30 seconds
    maxPayloadSize: "10mb",
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
    release: process.env.SENTRY_RELEASE,
  },
} as const;

export default ServerConfig;
