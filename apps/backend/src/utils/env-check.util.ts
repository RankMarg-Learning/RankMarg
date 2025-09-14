/**
 * Environment Variables Validation Utility
 */

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

export const validateEnvironment = (): EnvValidationResult => {
  const required = ["DATABASE_URL", "JWT_SECRET", "SESSION_SECRET"];

  const optional = [
    "CORS_ORIGIN",
    "REDIS_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  required.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  // Check optional variables for warnings
  optional.forEach((envVar) => {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  });

  // Special checks
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    warnings.push(
      "Google OAuth will not work without GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    );
  }

  if (!process.env.CORS_ORIGIN) {
    warnings.push("CORS_ORIGIN not set, using default http://localhost:3000");
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
};

export const logEnvironmentStatus = (): void => {
  const result = validateEnvironment();

  console.log("\n📋 Environment Configuration Status:");

  if (result.isValid) {
    console.log("✅ All required environment variables are set");
  } else {
    console.log("❌ Missing required environment variables:");
    result.missing.forEach((env) => console.log(`   - ${env}`));
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((warning) => console.log(`   - ${warning}`));
  }

  console.log("\n🔧 Environment Details:");
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`   - PORT: ${process.env.PORT || "3001"}`);
  console.log(
    `   - CORS_ORIGIN: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
  );
  console.log(
    `   - Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? "Configured" : "Not configured"}`
  );
  console.log("");
};
