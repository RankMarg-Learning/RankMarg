import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

const getDateRanges = () => {
  const now = new Date();
  const currentWeekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const previousWeekStart = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  const previousWeekEnd = currentWeekStart;

  return {
    currentWeekStart,
    currentWeekEnd: now,
    previousWeekStart,
    previousWeekEnd
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('id');

    const session = await getAuthSession();
    if (session?.user?.id) {
      userId = session.user.id;
    }
    if (!userId) {
      return jsonResponse(null, {
        status: 400,
        message: "User ID is required",
        success: false
      });
    }

    // Validate userId format (assuming it should be a valid string/UUID)
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return jsonResponse(null, {
        status: 400,
        message: "Invalid user ID format",
        success: false
      });
    }

    const dateRanges = getDateRanges();

    // Database queries with individual error handling
    let currentWeekAttempts, previousWeekAttempts;

    try {
      currentWeekAttempts = await prisma.attempt.findMany({
        where: {
          userId: userId.trim(),
          status: 'INCORRECT',
          mistake: { not: 'NONE' },
          solvedAt: {
            gte: dateRanges.currentWeekStart,
            lte: dateRanges.currentWeekEnd
          }
        },
        include: {
          question: {
            include: {
              topic: true,
              subject: true,
              subTopic: true
            }
          }
        }
      });
    } catch (dbError) {
      console.error("[Mistake Tracker] Error fetching current week attempts:", dbError);
      return jsonResponse(null, {
        status: 500,
        message: "Failed to fetch current week data",
        success: false
      });
    }

    try {
      previousWeekAttempts = await prisma.attempt.findMany({
        where: {
          userId: userId.trim(),
          status: 'INCORRECT',
          mistake: { not: 'NONE' },
          solvedAt: {
            gte: dateRanges.previousWeekStart,
            lte: dateRanges.previousWeekEnd
          }
        },
        include: {
          question: {
            include: {
              topic: true,
              subject: true,
              subTopic: true
            }
          }
        }
      });
    } catch (dbError) {
      console.error("[Mistake Tracker] Error fetching previous week attempts:", dbError);
      return jsonResponse(null, {
        status: 500,
        message: "Failed to fetch previous week data",
        success: false
      });
    }

    // Ensure arrays are valid
    if (!Array.isArray(currentWeekAttempts)) {
      currentWeekAttempts = [];
    }
    if (!Array.isArray(previousWeekAttempts)) {
      previousWeekAttempts = [];
    }

    const currentCount = currentWeekAttempts.length;
    const previousCount = previousWeekAttempts.length;
    const change = currentCount - previousCount;

    let mistakeAnalytics;
    try {
      mistakeAnalytics = {
        cnt: {
          current: currentCount,
          previous: previousCount,
          change,
          reducePct: previousCount > 0
            ? parseFloat(((previousCount - currentCount) / previousCount * 100).toFixed(2))
            : currentCount === 0 ? 100.0 : 0.0
        },
        mostMistakeType: getMostMistakeType(currentWeekAttempts),
        trend: getMistakeTrend(currentWeekAttempts, previousWeekAttempts),
        mistakesBySubject: getMistakesBySubject(currentWeekAttempts, previousWeekAttempts),
      };
    } catch (analyticsError) {
      console.error("[Mistake Tracker] Error processing analytics:", analyticsError);
      return jsonResponse(null, {
        status: 500,
        message: "Failed to process mistake analytics",
        success: false
      });
    }

    return jsonResponse(mistakeAnalytics, {
      status: 200,
      message: "Mistake trends fetched successfully",
      success: true
    });

  } catch (error) {
    // Log the full error for debugging
    console.error("[Mistake Tracker] Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return jsonResponse(null, {
      status: 500,
      message: "An unexpected error occurred while processing your request",
      success: false
    });
  }
}

function getMostMistakeType(currentAttempts) {
  try {
    // Validate input
    if (!Array.isArray(currentAttempts)) {
      throw new Error("Invalid attempts data provided");
    }

    const currentMistakeTypes = {};

    currentAttempts.forEach((attempt, index) => {
      try {
        const mistakeType = attempt?.mistake || 'NONE';
        currentMistakeTypes[mistakeType] = (currentMistakeTypes[mistakeType] || 0) + 1;
      } catch (attemptError) {
        console.warn(`[Mistake Tracker] Error processing attempt at index ${index}:`, attemptError);
        // Continue processing other attempts
      }
    });

    const entries = Object.entries(currentMistakeTypes);
    if (entries.length === 0) {
      return {
        type: 'NONE',
        count: 0
      };
    }

    const currentMostCommon = entries
      .sort(([, a], [, b]) => Number(b) - Number(a))[0];

    return {
      type: currentMostCommon ? currentMostCommon[0] : 'NONE',
      count: currentMostCommon ? currentMostCommon[1] : 0
    };
  } catch (error) {
    console.error("[Mistake Tracker] Error in getMostMistakeType:", error);
    return {
      type: 'NONE',
      count: 0
    };
  }
}

function getMistakesBySubject(currentAttempts, previousAttempts) {
  try {
    // Validate inputs
    if (!Array.isArray(currentAttempts) || !Array.isArray(previousAttempts)) {
      throw new Error("Invalid attempts data provided");
    }

    const currentSubjectMistakes = {};
    const previousSubjectMistakes = {};

    // Process current attempts
    currentAttempts.forEach((attempt, index) => {
      try {
        const subjectName = attempt?.question?.subject?.name || 'Unknown';
        currentSubjectMistakes[subjectName] = (currentSubjectMistakes[subjectName] || 0) + 1;
      } catch (attemptError) {
        console.warn(`[Mistake Tracker] Error processing current attempt at index ${index}:`, attemptError);
      }
    });

    // Process previous attempts
    previousAttempts.forEach((attempt, index) => {
      try {
        const subjectName = attempt?.question?.subject?.name || 'Unknown';
        previousSubjectMistakes[subjectName] = (previousSubjectMistakes[subjectName] || 0) + 1;
      } catch (attemptError) {
        console.warn(`[Mistake Tracker] Error processing previous attempt at index ${index}:`, attemptError);
      }
    });

    const allSubjects = new Set([
      ...Object.keys(currentSubjectMistakes),
      ...Object.keys(previousSubjectMistakes)
    ]);

    const subjectAnalysis = Array.from(allSubjects).map(subject => ({
      subject,
      current: currentSubjectMistakes[subject] || 0,
      previous: previousSubjectMistakes[subject] || 0,
      change: (currentSubjectMistakes[subject] || 0) - (previousSubjectMistakes[subject] || 0)
    })).sort((a, b) => b.current - a.current);

    return subjectAnalysis;
  } catch (error) {
    console.error("[Mistake Tracker] Error in getMistakesBySubject:", error);
    return [];
  }
}

function getMistakeTrend(currentAttempts, previousAttempts) {
  try {
    // Validate inputs
    if (!Array.isArray(currentAttempts) || !Array.isArray(previousAttempts)) {
      throw new Error("Invalid attempts data provided");
    }

    const currentLength = currentAttempts.length;
    const previousLength = previousAttempts.length;

    const trend = {
      improving: currentLength < previousLength,
      status: '',
      recommendation: ''
    };

    if (currentLength < previousLength) {
      trend.status = 'IMPROVING';
      trend.recommendation = 'Great progress! Keep up the good work.';
    } else if (currentLength > previousLength) {
      trend.status = 'NEEDS_ATTENTION';
      trend.recommendation = 'Mistakes have increased. Focus on weak topics and review concepts.';
    } else {
      trend.status = 'STABLE';
      trend.recommendation = 'Mistakes are consistent. Work on identifying patterns to improve.';
    }

    return trend;
  } catch (error) {
    console.error("[Mistake Tracker] Error in getMistakeTrend:", error);
    return {
      improving: false,
      status: 500,
      recommendation: 'Unable to determine trend. Please try again.'
    };
  }
}