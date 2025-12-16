import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 50; // Process attempts in batches of 50

// Helper function to read JSON file
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("JSON file should contain an array");
    }

    return parsed as T[];
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error);
    throw error;
  }
}

// Helper function to convert date string to Date object
function parseDate(dateString: string): Date {
  try {
    // Handle "YYYY-MM-DD HH:mm:ss.sss" format
    if (dateString.includes(" ")) {
      return new Date(dateString.replace(" ", "T") + "Z");
    }
    return new Date(dateString);
  } catch (error) {
    console.warn(`⚠️  Could not parse date: ${dateString}, using current date`);
    return new Date();
  }
}

// Process a single attempt
async function processAttempt(attempt: any): Promise<void> {
  try {
    // Validate required fields
    if (!attempt.id || !attempt.userId || !attempt.questionId) {
      throw new Error("Missing required fields: id, userId, or questionId");
    }

    // Check if attempt already exists
    const existingAttempt = await prisma.attempt.findUnique({
      where: { id: attempt.id },
    });

    if (existingAttempt) {
      console.log(`⚠️  Attempt ${attempt.id} already exists, skipping...`);
      return;
    }

    // Validate that user exists
    const userExists = await prisma.user.findUnique({
      where: { id: attempt.userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new Error(`User ${attempt.userId} does not exist in database`);
    }

    // Validate that question exists
    const questionExists = await prisma.question.findUnique({
      where: { id: attempt.questionId },
      select: { id: true },
    });

    if (!questionExists) {
      throw new Error(`Question ${attempt.questionId} does not exist in database`);
    }

    // Prepare attempt data for insertion
    const attemptData = {
      id: attempt.id,
      userId: attempt.userId,
      questionId: attempt.questionId,
      type: attempt.type || "SESSION",
      answer: attempt.answer || "0",
      mistake: attempt.mistake,
      timing: attempt.timing || 0,
      reactionTime: attempt.reactionTime || 0,
      status: attempt.status || "CORRECT",
      hintsUsed: attempt.hintsUsed || false,
      solvedAt: attempt.solvedAt ? parseDate(attempt.solvedAt) : new Date(),
      testParticipationId: attempt.testParticipationId,
      practiceSessionId: attempt.practiceSessionId,
    };

    // Insert the attempt
    await prisma.attempt.create({
      data: attemptData,
    });
  } catch (error) {
    console.error(`❌ Failed to process attempt ${attempt.id}:`, error);
    throw error;
  }
}

// Process attempts in batches
async function processBatch(
  attempts: any[],
  batchNumber: number
): Promise<number> {
  console.log(
    `\n🔄 Processing batch ${batchNumber} (${attempts.length} attempts)...`
  );

  let successCount = 0;
  let errorCount = 0;
  const errors: { userId: number; questionId: number; other: number } = {
    userId: 0,
    questionId: 0,
    other: 0,
  };

  for (const attempt of attempts) {
    try {
      await processAttempt(attempt);
      successCount++;
    } catch (error: any) {
      errorCount++;
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes("User") && errorMessage.includes("does not exist")) {
        errors.userId++;
        console.warn(`⚠️  Skipping attempt ${attempt.id}: User ${attempt.userId} not found`);
      } else if (errorMessage.includes("Question") && errorMessage.includes("does not exist")) {
        errors.questionId++;
        console.warn(`⚠️  Skipping attempt ${attempt.id}: Question ${attempt.questionId} not found`);
      } else {
        errors.other++;
        console.error(`❌ Error processing attempt ${attempt.id}:`, errorMessage);
      }
    }
  }

  console.log(
    `✅ Batch ${batchNumber} completed: ${successCount} successful, ${errorCount} errors`
  );
  if (errorCount > 0) {
    console.log(`   📊 Error breakdown: ${errors.userId} user errors, ${errors.questionId} question errors, ${errors.other} other errors`);
  }
  return successCount;
}

// Main function to insert all generated attempts
async function insertGeneratedAttempts(): Promise<void> {
  console.log("🚀 Starting attempt data insertion...\n");

  const inputPath = path.join(
    __dirname,
    "json",
    "random_generate",
    "GeneratedAttempts.json"
  );

  // Check if file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Generated attempts file not found: ${inputPath}`);
    console.log(
      "💡 Please run generateAttemptData.ts first to generate the data."
    );
    process.exit(1);
  }

  // Read the generated attempts
  console.log("📖 Reading generated attempts...");
  const attempts = readJsonFile<any>(inputPath);
  console.log(`📊 Found ${attempts.length} attempts to insert`);

  if (attempts.length === 0) {
    console.log("⚠️  No attempts found in the file. Nothing to insert.");
    return;
  }

  // Process in batches
  let totalProcessed = 0;
  let totalErrors = 0;
  const totalBatches = Math.ceil(attempts.length / BATCH_SIZE);

  console.log(
    `\n📦 Processing ${attempts.length} attempts in ${totalBatches} batches of ${BATCH_SIZE}...`
  );

  for (let i = 0; i < attempts.length; i += BATCH_SIZE) {
    const batch = attempts.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const batchSuccessCount = await processBatch(batch, batchNumber);
      totalProcessed += batchSuccessCount;
      totalErrors += batch.length - batchSuccessCount;

      // Progress indicator
      const progress = Math.round(((i + batch.length) / attempts.length) * 100);
      console.log(
        `📈 Progress: ${i + batch.length}/${attempts.length} (${progress}%)`
      );
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} failed:`, error);
      totalErrors += batch.length;
    }
  }

  // Get unique user IDs from attempts to check which ones are missing
  const uniqueUserIds = [...new Set(attempts.map(a => a.userId))];
  const validUserIds: string[] = [];
  const invalidUserIds: string[] = [];
  
  console.log("\n🔍 Validating user IDs...");
  for (const userId of uniqueUserIds) {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (userExists) {
      validUserIds.push(userId);
    } else {
      invalidUserIds.push(userId);
    }
  }
  
  if (invalidUserIds.length > 0) {
    console.log(`⚠️  Found ${invalidUserIds.length} invalid user IDs:`);
    invalidUserIds.forEach(id => console.log(`   - ${id}`));
    console.log(`\n💡 Tip: Make sure these users exist in the database before generating attempts.`);
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 INSERTION SUMMARY");
  console.log("=".repeat(60));
  console.log(`📝 Total Attempts: ${attempts.length}`);
  console.log(`✅ Successfully Inserted: ${totalProcessed}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(
    `📈 Success Rate: ${((totalProcessed / attempts.length) * 100).toFixed(1)}%`
  );
  console.log(`👤 Valid Users: ${validUserIds.length}/${uniqueUserIds.length}`);
  if (invalidUserIds.length > 0) {
    console.log(`⚠️  Invalid Users: ${invalidUserIds.length}`);
  }
  console.log("=".repeat(60));

  if (totalProcessed > 0) {
    console.log("🎉 Attempt data insertion completed successfully!");
  } else {
    console.log(
      "⚠️  No attempts were inserted. Please check the logs for errors."
    );
  }
}

// Function to verify inserted data
async function verifyInsertedData(): Promise<void> {
  console.log("\n🔍 Verifying inserted data...");

  try {
    // Count total attempts
    const totalAttempts = await prisma.attempt.count();
    console.log(`📊 Total attempts in database: ${totalAttempts}`);

    // Count attempts by status
    const correctAttempts = await prisma.attempt.count({
      where: { status: "CORRECT" },
    });
    const incorrectAttempts = await prisma.attempt.count({
      where: { status: "INCORRECT" },
    });

    console.log(`✅ Correct attempts: ${correctAttempts}`);
    console.log(`❌ Incorrect attempts: ${incorrectAttempts}`);

    // Student IDs from generateAttemptData.ts
    const studentIds = [
      "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5", // Aniket Sudke
      "12a154d8-4ebc-4f36-839d-200040446c37", // Suyash Dhone
      "61e6aebc-00e9-4e4d-a379-03b5138c93e6", // Siddhi Sudke
    ];

    // Count attempts by student
    console.log("\n👤 Attempts by student:");
    for (const studentId of studentIds) {
      const user = await prisma.user.findUnique({
        where: { id: studentId },
        select: { name: true, id: true },
      });
      const studentAttempts = await prisma.attempt.count({
        where: { userId: studentId },
      });
      const studentName = user?.name || "Unknown";
      console.log(`   ${studentName} (${studentId}): ${studentAttempts} attempts`);
    }
  } catch (error) {
    console.error("❌ Error verifying data:", error);
  }
}

// Run the script
if (require.main === module) {
  insertGeneratedAttempts()
    .then(() => verifyInsertedData())
    .catch((error) => {
      console.error("❌ Error inserting attempt data:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { insertGeneratedAttempts, verifyInsertedData };
