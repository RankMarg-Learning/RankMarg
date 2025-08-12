const redis = require("redis");

async function testUpstashConnection() {
  console.log("🧪 Testing Upstash Redis Connection...\n");

  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

  if (!redisUrl) {
    console.error(
      "❌ Redis URL not found. Please set REDIS_URL or UPSTASH_REDIS_REST_URL environment variable"
    );
    process.exit(1);
  }

  const isUpstash = redisUrl.includes("upstash.io");
  console.log(`🔗 Connecting to: ${isUpstash ? "Upstash Redis" : "Redis"}`);
  console.log(`📍 URL: ${redisUrl.replace(/\/\/.*@/, "//***:***@")}\n`);

  const client = redis.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error("❌ Redis max reconnection attempts reached");
          return new Error("Redis max reconnection attempts reached");
        }
        // For Upstash, use exponential backoff with max 5 seconds
        return Math.min(Math.pow(2, retries) * 1000, 5000);
      },
      // Upstash specific settings
      ...(isUpstash && {
        tls: true,
        keepAlive: 30000, // 30 seconds
        connectTimeout: 10000, // 10 seconds
      }),
    },
    // Upstash specific configuration
    ...(isUpstash && {
      pingInterval: 30000, // Ping every 30 seconds to keep connection alive
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    }),
  });

  try {
    // Connect to Redis
    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;
    console.log(
      `✅ Successfully connected to ${isUpstash ? "Upstash" : ""} Redis (${connectTime}ms)`
    );

    // Test basic operations
    console.log("\n📝 Testing basic operations...");

    // Set a test key
    await client.set("test:key", "Hello Upstash Redis!");
    console.log("✅ Set test key");

    // Get the test key
    const value = await client.get("test:key");
    console.log(`✅ Retrieved value: ${value}`);

    // Test JSON operations
    console.log("\n📄 Testing JSON operations...");
    const testData = {
      userId: "test123",
      performance: {
        score: 85,
        questionsAnswered: 100,
      },
      timestamp: new Date().toISOString(),
      upstash: isUpstash,
    };

    await client.set("test:json", JSON.stringify(testData));
    console.log("✅ Set JSON data");

    const retrievedData = JSON.parse(await client.get("test:json"));
    console.log("✅ Retrieved JSON data:", retrievedData);

    // Test TTL
    console.log("\n⏰ Testing TTL...");
    await client.setEx("test:ttl", 10, "This will expire in 10 seconds");
    console.log("✅ Set key with 10-second TTL");

    const ttl = await client.ttl("test:ttl");
    console.log(`✅ TTL remaining: ${ttl} seconds`);

    // Test hash operations
    console.log("\n🗂️ Testing hash operations...");
    await client.hSet("test:hash", "field1", "value1");
    await client.hSet("test:hash", "field2", "value2");
    console.log("✅ Set hash fields");

    const hashData = await client.hGetAll("test:hash");
    console.log("✅ Retrieved hash data:", hashData);

    // Test list operations
    console.log("\n📋 Testing list operations...");
    await client.lPush("test:list", "item1");
    await client.lPush("test:list", "item2");
    await client.lPush("test:list", "item3");
    console.log("✅ Pushed items to list");

    const listLength = await client.lLen("test:list");
    console.log(`✅ List length: ${listLength}`);

    const poppedItem = await client.rPop("test:list");
    console.log(`✅ Popped item: ${poppedItem}`);

    // Test Upstash specific features
    if (isUpstash) {
      console.log("\n☁️ Testing Upstash specific features...");

      // Test ping latency
      const pingStart = Date.now();
      const pingResult = await client.ping();
      const pingLatency = Date.now() - pingStart;
      console.log(`✅ Ping test: ${pingResult} (${pingLatency}ms)`);

      // Test info command
      try {
        const info = await client.info();
        console.log("✅ Info command successful");

        // Parse some basic info
        const lines = info.split("\n");
        const stats = {};
        lines.forEach((line) => {
          const [key, value] = line.split(":");
          if (key && value) {
            stats[key] = value.trim();
          }
        });

        console.log(`📊 Redis Version: ${stats.redis_version || "N/A"}`);
        console.log(`📊 Memory Usage: ${stats.used_memory_human || "N/A"}`);
        console.log(
          `📊 Connected Clients: ${stats.connected_clients || "N/A"}`
        );
        console.log(`📊 Uptime: ${stats.uptime_in_seconds || "N/A"} seconds`);
      } catch (error) {
        console.log("⚠️ Info command not available:", error.message);
      }
    }

    // Test database info
    console.log("\n📊 Database info...");
    const dbSize = await client.dbSize();
    console.log(`✅ Database size: ${dbSize} keys`);

    // Clean up test data
    console.log("\n🧹 Cleaning up test data...");
    await client.del("test:key");
    await client.del("test:json");
    await client.del("test:ttl");
    await client.del("test:hash");
    await client.del("test:list");
    console.log("✅ Cleaned up test data");

    console.log("\n🎉 All Redis tests passed successfully!");
    console.log(
      `\n${isUpstash ? "☁️ Upstash Redis" : "Redis"} integration is working correctly.`
    );

    // Performance summary
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️  Total test time: ${totalTime}ms`);
    console.log(
      `🚀 Average operation time: ${Math.round(totalTime / 15)}ms per operation`
    );
  } catch (error) {
    console.error("❌ Redis test failed:", error.message);

    if (isUpstash) {
      console.log("\n🔧 Upstash troubleshooting tips:");
      console.log("1. Check your UPSTASH_REDIS_REST_URL environment variable");
      console.log("2. Verify your Upstash Redis database is active");
      console.log("3. Check your network connection");
      console.log("4. Ensure your Upstash credentials are correct");
    }

    process.exit(1);
  } finally {
    await client.quit();
    console.log("\n🔌 Disconnected from Redis");
  }
}

// Run the test
testUpstashConnection().catch(console.error);
