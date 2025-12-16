import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Configuration
const ATTEMPTS_PER_STUDENT = {
  min: 100,
  max: 150,
};

const STUDENT_PROFILES = [
  // {
  //   id: "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5", // Aniket Sudke
  //   name: "Aniket Sudke",
  //   performance: "dull", // Lower performance
  //   accuracyRate: 0.45, // 45% accuracy
  //   avgTiming: 90, // Slower timing (90-150 seconds)
  //   hintUsage: 0.4, // 40% chance of using hints
  // },
  {
    id: "61e6aebc-00e9-4e4d-a379-03b5138c93e6", // Siddhi Sudke
    name: "Siddhi Sudke",
    performance: "smarter", // Higher performance
    accuracyRate: 0.85, // 85% accuracy
    avgTiming: 30, // Faster timing (15-60 seconds)
    hintUsage: 0.1, // 10% chance of using hints
  },
];

const SUBJECT_IDS = [
  "70821584-88d7-4205-9f32-4dd5ecde20b9", // Biology
  "959f2ce7-b37a-4325-a9d0-d46c2ba3ef59", // Chemistry
  "c47c9c14-2dd7-42fc-823d-d3f550a0e471", // Mathematics
  "fdee61f5-0236-44d2-b614-a1da45659ca6", // Physics
];

// Mistake types
const MISTAKE_TYPES = ["CONCEPTUAL", "CALCULATION", "READING", "OTHER", null];

// Answer options (0-3 for MCQ)
const ANSWER_OPTIONS = ["0", "1", "2", "3"];

// Status options
const STATUS_OPTIONS = ["CORRECT", "INCORRECT"];

// Attempt types
const ATTEMPT_TYPES = ["SESSION", "NONE"];

// Helper function to get random element from array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number between min and max
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random date within last 30 days
function getRandomDate(): string {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const randomTime =
    thirtyDaysAgo.getTime() +
    Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString().replace("T", " ").substring(0, 23);
}

// Helper function to generate realistic timing based on student profile (in seconds)
function getRealisticTiming(avgTiming: number): number {
  // Generate timing around the average with some variation
  const variation = avgTiming * 0.5; // 50% variation
  const minTime = Math.max(5, avgTiming - variation);
  const maxTime = avgTiming + variation;

  const baseTime = getRandomInt(minTime, maxTime);

  // 10% chance of being very fast (1-15 seconds) - more likely for smarter students
  if (Math.random() < 0.1) {
    return getRandomInt(1, 15);
  }
  // 5% chance of being very slow (maxTime to maxTime*2) - more likely for dull students
  if (Math.random() < 0.05) {
    return getRandomInt(maxTime, maxTime * 2);
  }
  return baseTime;
}

// Helper function to determine if answer is correct based on student profile
function shouldBeCorrect(accuracyRate: number): boolean {
  return Math.random() < accuracyRate;
}

// Helper function to determine if hints were used based on student profile
function shouldUseHints(hintUsageRate: number): boolean {
  return Math.random() < hintUsageRate;
}

// Generate attempt data for a single student
async function generateStudentAttempts(
  studentProfile: any,
  numAttempts: number
): Promise<any[]> {
  console.log(
    `\n🎯 Generating ${numAttempts} attempts for ${studentProfile.name} (${studentProfile.performance})...`
  );

  const attempts: any[] = [];

  // Get questions for each subject to ensure we have valid question IDs
  const questionsBySubject: { [key: string]: string[] } = {};

  for (const subjectId of SUBJECT_IDS) {
    try {
      const questions = await prisma.question.findMany({
        where: { subjectId },
        select: { id: true },
        take: 100, // Limit to avoid memory issues
      });
      questionsBySubject[subjectId] = questions.map((q) => q.id);
    } catch (error) {
      console.warn(
        `⚠️  Could not fetch questions for subject ${subjectId}:`,
        error
      );
      questionsBySubject[subjectId] = [];
    }
  }

  // Generate attempts
  for (let i = 0; i < numAttempts; i++) {
    const subjectId = getRandomElement(SUBJECT_IDS);
    const availableQuestions = questionsBySubject[subjectId];

    if (availableQuestions.length === 0) {
      console.warn(
        `⚠️  No questions available for subject ${subjectId}, skipping attempt ${i + 1}`
      );
      continue;
    }

    const questionId = getRandomElement(availableQuestions);
    const isCorrect = shouldBeCorrect(studentProfile.accuracyRate);
    const answer = getRandomElement(ANSWER_OPTIONS);
    const timing = getRealisticTiming(studentProfile.avgTiming);
    const reactionTime = Math.max(1, timing - getRandomInt(0, 5)); // Slightly less than timing
    const hintsUsed = shouldUseHints(studentProfile.hintUsage);
    const mistake = isCorrect ? null : getRandomElement(MISTAKE_TYPES);
    const status = isCorrect ? "CORRECT" : "INCORRECT";
    const attemptType = getRandomElement(ATTEMPT_TYPES);
    const solvedAt = getRandomDate();

    const attempt = {
      id: uuidv4(),
      userId: studentProfile.id,
      questionId: questionId,
      type: attemptType,
      answer: answer,
      mistake: mistake,
      timing: timing,
      reactionTime: reactionTime,
      status: status,
      hintsUsed: hintsUsed,
      solvedAt: solvedAt,
      testParticipationId: null,
      practiceSessionId: null,
    };

    attempts.push(attempt);

    // Progress indicator
    if ((i + 1) % 50 === 0) {
      console.log(`  📊 Generated ${i + 1}/${numAttempts} attempts...`);
    }
  }

  console.log(
    `✅ Generated ${attempts.length} attempts for ${studentProfile.name} (${studentProfile.performance})`
  );
  return attempts;
}

// Main function to generate all attempt data
async function generateAllAttemptData(): Promise<void> {
  console.log("🚀 Starting attempt data generation...\n");

  const allAttempts: any[] = [];

  // Generate attempts for each student
  for (const studentProfile of STUDENT_PROFILES) {
    const numAttempts = getRandomInt(
      ATTEMPTS_PER_STUDENT.min,
      ATTEMPTS_PER_STUDENT.max
    );
    const studentAttempts = await generateStudentAttempts(
      studentProfile,
      numAttempts
    );
    allAttempts.push(...studentAttempts);
  }

  console.log(`\n📈 Total attempts generated: ${allAttempts.length}`);

  // Save to JSON file
  const outputPath = path.join(
    __dirname,
    "json",
    "random_generate",
    "GeneratedAttempts.json"
  );
  const outputDir = path.dirname(outputPath);

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(allAttempts, null, 2));
  console.log(`💾 Attempt data saved to: ${outputPath}`);

  // Display summary
  console.log("\n📊 Generation Summary:");
  console.log("=".repeat(50));

  for (const studentProfile of STUDENT_PROFILES) {
    const studentAttempts = allAttempts.filter(
      (a) => a.userId === studentProfile.id
    );
    const correctAttempts = studentAttempts.filter(
      (a) => a.status === "CORRECT"
    ).length;
    const accuracy =
      studentAttempts.length > 0
        ? ((correctAttempts / studentAttempts.length) * 100).toFixed(1)
        : "0";
    const avgTiming =
      studentAttempts.length > 0
        ? (
            studentAttempts.reduce((sum, a) => sum + a.timing, 0) /
            studentAttempts.length
          ).toFixed(1)
        : "0";
    const hintsUsed = studentAttempts.filter((a) => a.hintsUsed).length;

    console.log(`👤 ${studentProfile.name} (${studentProfile.performance}):`);
    console.log(`   📝 Total Attempts: ${studentAttempts.length}`);
    console.log(`   ✅ Correct: ${correctAttempts}`);
    console.log(`   ❌ Incorrect: ${studentAttempts.length - correctAttempts}`);
    console.log(`   🎯 Accuracy: ${accuracy}%`);
    console.log(`   ⏱️  Avg Timing: ${avgTiming}s`);
    console.log(
      `   💡 Hints Used: ${hintsUsed} (${((hintsUsed / studentAttempts.length) * 100).toFixed(1)}%)`
    );
    console.log("");
  }

  console.log("🎉 Attempt data generation completed successfully!");
}

// Run the script
if (require.main === module) {
  generateAllAttemptData()
    .catch((error) => {
      console.error("❌ Error generating attempt data:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { generateAllAttemptData };
