import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/utils/session";
import { NextRequest } from "next/server";

// Constants
const MASTERY_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 70,
  SATISFACTORY: 60,
} as const;

const TOP_PERCENTILE_THRESHOLDS = [
  { score: 95, percentile: 1 },
  { score: 90, percentile: 5 },
  { score: 80, percentile: 10 },
  { score: 70, percentile: 25 },
  { score: 60, percentile: 50 },
  { score: 40, percentile: 75 },
] as const;

// Types
interface MasteryResponse {
  overallMastery: {
    percentage: number;
    label: string;
    improvement: number;
    topPercentage: number;
  };
  conceptsMastered: {
    mastered: number;
    total: number;
  };
  studyStreak: {
    days: number;
    message: string;
  };
}

interface DatabaseError extends Error {
  code?: string;
  meta?: any;
}

// Helper Functions
function estimateTopPercentile(studentScore: number): number {
  for (const threshold of TOP_PERCENTILE_THRESHOLDS) {
    if (studentScore >= threshold.score) {
      return threshold.percentile;
    }
  }
  return 90;
}

function getMasteryLabel(overallMastery: number): string {
  if (overallMastery >= MASTERY_THRESHOLDS.EXCELLENT) return "Excellent";
  if (overallMastery >= MASTERY_THRESHOLDS.GOOD) return "Good";
  if (overallMastery >= MASTERY_THRESHOLDS.SATISFACTORY) return "Satisfactory";
  return "Needs Improvement";
}

function getStreakMessage(streakDays: number): string {
  return streakDays >= 7 ? "Keep it up! 🔥" : "Keep learning daily!";
}

function handleDatabaseError(error: DatabaseError, operation: string) {
  console.error(`[Get Mastery] Database error - ${operation}:`, error);
  
  if (error.code === 'P2002') {
    return { message: "Data conflict occurred", status: 409 };
  }
  if (error.code === 'P2003') {
    return { message: "Referenced data not found", status: 400 };
  }
  if (error.code === 'P1008') {
    return { message: "Database timeout - please try again", status: 408 };
  }
  
  return { message: "Database operation failed", status: 500 };
}

// Main API Handler
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userIdFromQuery = url.searchParams.get('userId');
  
  try {
    // Step 1: Authentication
    const session = await getSessionSafely();
    const userId = session?.user?.id || userIdFromQuery;
    
    // Step 2: Authorization
    validateAuthorization(session, userId);
    
    // Step 3: Fetch user data
    const user = await fetchUserData(userId!);
    
    // Step 4: Validate user configuration
    validateUserConfiguration(user);
    
    // Step 5: Calculate mastery data
    const masteryData = await calculateMasteryData(user);
    
    return jsonResponse(masteryData, { 
      success: true, 
      message: "Data retrieved successfully", 
      status: 200 
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function implementations
async function getSessionSafely() {
  try {
    return await getAuthSession();
  } catch (error) {
    console.error("[Get Mastery] Session error:", error);
    throw new Error("Authentication service unavailable");
  }
}

function validateAuthorization(session: any, userId: string | null) {
  if (!userId && !session) {
    const error = new Error("Unauthorized - Please log in") as any;
    error.status = 401;
    throw error;
  }
  
  if (!userId) {
    const error = new Error("User ID is required") as any;
    error.status = 400;
    throw error;
  }
}

async function fetchUserData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subjectMastery: {
          include: { subject: true }
        },
        examRegistrations: { 
          select: { examCode: true } 
        },
        userPerformance: true,
      }
    });
    
    if (!user) {
      const error = new Error("User not found") as any;
      error.status = 404;
      throw error;
    }
    
    return user;
  } catch (error) {
    if ((error as any).status) throw error; // Re-throw our custom errors
    
    const dbError = handleDatabaseError(error as DatabaseError, "user fetch");
    const customError = new Error(dbError.message) as any;
    customError.status = dbError.status;
    throw customError;
  }
}

function validateUserConfiguration(user: any) {
  if (!user.examRegistrations[0].examCode) {
    console.warn(`[Get Mastery] User ${user.id} has no stream assigned`);
    const error = new Error("User stream not configured") as any;
    error.status = 400;
    throw error;
  }
}

async function calculateMasteryData(user: any): Promise<MasteryResponse> {
  try {
    // Calculate overall mastery
    const overallMastery = await calculateOverallMastery(user);
    
    // Get concepts mastered data
    const conceptsMastered = await getConceptsMasteredData(user);
    
    // Get study streak data
    const studyStreak = await getStudyStreakData(user);
    
    // Get improvement data
    const improvement = await getImprovementData(user.id, overallMastery);
    
    return {
      overallMastery: {
        percentage: overallMastery,
        label: getMasteryLabel(overallMastery),
        improvement,
        topPercentage: estimateTopPercentile(overallMastery)
      },
      conceptsMastered,
      studyStreak
    };
  } catch (error) {
    console.error("[Get Mastery] Error calculating mastery data:", error);
    throw error;
  }
}

async function calculateOverallMastery(user: any): Promise<number> {
  try {
    const subjectMasteries = user.subjectMastery || [];
    
    if (subjectMasteries.length === 0) return 0;
    
    const totalMasteryLevel = subjectMasteries.reduce(
      (sum: number, subject: any) => sum + (subject.masteryLevel || 0), 
      0
    );
    
    return Math.round(totalMasteryLevel / subjectMasteries.length);
  } catch (error) {
    console.error("[Get Mastery] Error calculating overall mastery:", error);
    return 0;
  }
}

async function getConceptsMasteredData(user: any) {
  try {
    // Get mastered topics
    const topicMasteries = await prisma.topicMastery.findMany({
      where: { 
        userId: user.id, 
        masteryLevel: { gte: MASTERY_THRESHOLDS.EXCELLENT } 
      },
      include: { topic: true }
    });
    
    // Get total topics
    const totalTopics = await prisma.topic.count({
      where: {
        subject: {
          examSubjects: { 
            some: { examCode: user.examRegistrations[0]?.examCode || "" } 
          }
        }
      }
    });
    
    return {
      mastered: topicMasteries.length,
      total: totalTopics,
    };
  } catch (error) {
    console.error("[Get Mastery] Error fetching concepts mastered data:", error);
    return { mastered: 0, total: 0 };
  }
}

async function getStudyStreakData(user: any) {
  try {
    const userPerformance = await prisma.userPerformance.findUnique({
      where: { userId: user.id },
      select: { streak: true }
    });
    
    const streakDays = userPerformance?.streak || 0;
    
    return {
      days: streakDays,
      message: getStreakMessage(streakDays)
    };
  } catch (error) {
    console.error("[Get Mastery] Error fetching study streak data:", error);
    return { days: 0, message: getStreakMessage(0) };
  }
}

async function getImprovementData(userId: string, currentMastery: number): Promise<number> {
  try {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const lastMonthMastery = await prisma.masteryHistory.findFirst({
      where: {
        userId,
        recordedAt: { lt: previousMonth }
      },
      select: { masteryLevel: true },
      orderBy: { recordedAt: 'desc' }
    });
    
    if (!lastMonthMastery?.masteryLevel) return 0;
    
    return Math.round(currentMastery - lastMonthMastery.masteryLevel);
  } catch (error) {
    console.error("[Get Mastery] Error fetching improvement data:", error);
    return 0;
  }
}

function handleApiError(error: any) {
  console.error("[Get Mastery] API Error:", error);
  
  // Handle custom errors with status codes
  if (error.status) {
    return jsonResponse(null, {
      success: false,
      message: error.message,
      status: error.status
    });
  }
  
  // Handle authentication errors
  if (error.message.includes("Authentication service unavailable")) {
    return jsonResponse(null, {
      success: false,
      message: "Authentication service unavailable",
      status: 503
    });
  }
  
  // Handle database connection errors
  if (error.message.includes("connect") || error.message.includes("timeout")) {
    return jsonResponse(null, {
      success: false,
      message: "Database connection error - please try again",
      status: 503
    });
  }
  
  // Generic server error
  return jsonResponse(null, {
    success: false,
    message: "Internal Server Error",
    status: 500
  });
}