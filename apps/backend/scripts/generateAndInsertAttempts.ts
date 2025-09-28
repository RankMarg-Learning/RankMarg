import { generateAllAttemptData } from "./generateAttemptData";
import {
  insertGeneratedAttempts,
  verifyInsertedData,
} from "./insertGeneratedAttempts";

/**
 * Combined script to generate and insert attempt data for testing
 *
 * This script:
 * 1. Generates 200-400 attempt records for 3 different students
 * 2. Creates realistic attempt data with proper timing, accuracy, and mistakes
 * 3. Inserts the data into the database
 * 4. Verifies the insertion was successful
 *
 * Usage:
 * npm run ts-node scripts/generateAndInsertAttempts.ts
 */

async function main(): Promise<void> {
  console.log(
    "🎯 Starting attempt data generation and insertion pipeline...\n"
  );

  try {
    // Step 1: Generate attempt data
    console.log("📝 Step 1: Generating attempt data...");
    await generateAllAttemptData();

    // Step 2: Insert generated data
    console.log("\n💾 Step 2: Inserting attempt data into database...");
    await insertGeneratedAttempts();

    // Step 3: Verify insertion
    console.log("\n🔍 Step 3: Verifying inserted data...");
    await verifyInsertedData();

    console.log("\n🎉 Pipeline completed successfully!");
    console.log(
      "✨ You now have additional attempt data for testing your curriculum features."
    );
  } catch (error) {
    console.error("❌ Pipeline failed:", error);
    process.exit(1);
  }
}

// Run the pipeline
if (require.main === module) {
  main();
}

export { main };
