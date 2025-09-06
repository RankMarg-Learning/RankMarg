import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { Prisma } from "@prisma/client";
import { Response, NextFunction } from "express";

interface DetailedMistakePattern {
  mistakeType: string;
  count: number;
  totalAttempts: number;
  accuracy: number;
  recentOccurrences: Array<{
    questionId: string;
    solvedAt: Date;
    difficulty: number;
  }>;
}

interface SpecificInsight {
  type: "MISTAKE_PATTERN" | "IMPROVEMENT" | "WEAKNESS";
  title: string;
  description: string;
  mistakeType?: string;
  frequency?: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
}
const getDateRanges = () => {
  const now = new Date();
  const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const previousWeekEnd = currentWeekStart;

  return {
    currentWeekStart,
    currentWeekEnd: now,
    previousWeekStart,
    previousWeekEnd,
  };
};

export class MistakeTrackerController {
  getMistakeTrackerDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const dateRanges = getDateRanges();
      let currentWeekAttempts = await prisma.attempt.findMany({
        where: {
          userId: userId.trim(),
          status: "INCORRECT",
          mistake: { not: "NONE" },
          solvedAt: {
            gte: dateRanges.currentWeekStart,
            lte: dateRanges.currentWeekEnd,
          },
        },
        include: {
          question: {
            include: {
              topic: true,
              subject: true,
              subTopic: true,
            },
          },
        },
      });
      let previousWeekAttempts = await prisma.attempt.findMany({
        where: {
          userId: userId.trim(),
          status: "INCORRECT",
          mistake: { not: "NONE" },
          solvedAt: {
            gte: dateRanges.previousWeekStart,
            lte: dateRanges.previousWeekEnd,
          },
        },
        include: {
          question: {
            include: {
              topic: true,
              subject: true,
              subTopic: true,
            },
          },
        },
      });
      if (!Array.isArray(currentWeekAttempts)) {
        currentWeekAttempts = [];
      }
      if (!Array.isArray(previousWeekAttempts)) {
        previousWeekAttempts = [];
      }
      const currentCount = currentWeekAttempts.length;
      const previousCount = previousWeekAttempts.length;
      const change = currentCount - previousCount;
      ResponseUtil.success(res, {
        cnt: {
          current: currentCount,
          previous: previousCount,
          change,
          reducePct:
            previousCount > 0
              ? parseFloat(
                  (
                    ((previousCount - currentCount) / previousCount) *
                    100
                  ).toFixed(2)
                )
              : currentCount === 0
                ? 100.0
                : 0.0,
        },
        mostMistakeType: getMostMistakeType(currentWeekAttempts),
        trend: getMistakeTrend(currentWeekAttempts, previousWeekAttempts),
        mistakesBySubject: getMistakesBySubject(
          currentWeekAttempts,
          previousWeekAttempts
        ),
      });
    } catch (error) {
      next(error);
    }
  };
  getMistakeDistribution = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { range } = req.query;
      const rangeNumber = parseInt(range as string);
      if (isNaN(rangeNumber) || rangeNumber <= 0 || rangeNumber > 365) {
        ResponseUtil.error(res, "Invalid range", 400);
      }
      const targetDate = new Date();
      if (isNaN(targetDate.getTime())) {
        ResponseUtil.error(res, "Date calculation error", 500);
      }
      targetDate.setDate(targetDate.getDate() - rangeNumber);

      const whereClause: Prisma.AttemptWhereInput = {
        userId: userId.trim(),
        solvedAt: {
          gte: targetDate,
        },
        mistake: {
          not: "NONE",
        },
      };
      const [mistakeData, totalAttempts] = await Promise.all([
        prisma.attempt.groupBy({
          by: ["mistake"],
          where: whereClause,
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: "desc",
            },
          },
        }),
        prisma.attempt.count({
          where: whereClause,
        }),
      ]);
      const distribution: { type: string; percentage: number }[] =
        mistakeData.map((item) => {
          const count = item._count.id || 0;
          const percentage =
            totalAttempts > 0
              ? parseFloat(((count / totalAttempts) * 100).toFixed(2))
              : 0;
          return {
            type: item.mistake,
            percentage: percentage,
          };
        });

      const allMistakeTypes = [
        "CONCEPTUAL",
        "CALCULATION",
        "READING",
        "OVERCONFIDENCE",
        "OTHER",
      ];

      const completeDistribution: { type: string; percentage: number }[] =
        allMistakeTypes.map((type) => {
          const existingDistribution = distribution.find(
            (item) => item.type === type
          );
          return {
            type: type,
            percentage: existingDistribution
              ? existingDistribution.percentage
              : 0,
          };
        });

      const conclusionMessage = generateMistakeConclusion(completeDistribution);

      ResponseUtil.success(
        res,
        {
          distribution: completeDistribution,
          suggest: conclusionMessage,
        },
        "Ok",
        200
      );
    } catch (error) {
      next(error);
    }
  };
  getMistakeInsight = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { range } = req.query;
      const rangeNumber = parseInt(range as string);
      if (isNaN(rangeNumber) || rangeNumber <= 0 || rangeNumber > 365) {
        ResponseUtil.error(res, "Invalid range", 400);
      }
      const dateFrom = new Date(Date.now() - rangeNumber * 24 * 60 * 60 * 1000);
      const allAttempts = await prisma.attempt.findMany({
        where: {
          userId,
          solvedAt: { gte: dateFrom },
        },
        include: {
          question: {
            include: {
              subject: true,
              topic: true,
              subTopic: true,
            },
          },
        },
        orderBy: { solvedAt: "desc" },
      });

      const mistakeAttempts = allAttempts.filter(
        (attempt) =>
          attempt.status === "INCORRECT" &&
          attempt.mistake &&
          attempt.mistake !== "NONE"
      );
      const detailedPatterns = analyzeDetailedMistakePatterns(mistakeAttempts);

      const specificInsights = generateSpecificInsights(
        detailedPatterns,
        allAttempts
      );
      ResponseUtil.success(
        res,
        {
          insights: specificInsights,
        },
        "Ok",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}
function getMostMistakeType(currentAttempts) {
  try {
    if (!Array.isArray(currentAttempts)) {
      throw new Error("Invalid attempts data provided");
    }

    const currentMistakeTypes = {};

    currentAttempts.forEach((attempt, index) => {
      try {
        const mistakeType = attempt?.mistake || "NONE";
        currentMistakeTypes[mistakeType] =
          (currentMistakeTypes[mistakeType] || 0) + 1;
      } catch (attemptError) {
        console.warn(
          `[Mistake Tracker] Error processing attempt at index ${index}:`,
          attemptError
        );
      }
    });

    const entries = Object.entries(currentMistakeTypes);
    if (entries.length === 0) {
      return {
        type: "NONE",
        count: 0,
      };
    }

    const currentMostCommon = entries.sort(
      ([, a], [, b]) => Number(b) - Number(a)
    )[0];

    return {
      type: currentMostCommon ? currentMostCommon[0] : "NONE",
      count: currentMostCommon ? currentMostCommon[1] : 0,
    };
  } catch (error) {
    console.error("[Mistake Tracker] Error in getMostMistakeType:", error);
    return {
      type: "NONE",
      count: 0,
    };
  }
}

function getMistakesBySubject(currentAttempts, previousAttempts) {
  try {
    if (!Array.isArray(currentAttempts) || !Array.isArray(previousAttempts)) {
      throw new Error("Invalid attempts data provided");
    }

    const currentSubjectMistakes = {};
    const previousSubjectMistakes = {};

    currentAttempts.forEach((attempt, index) => {
      try {
        const subjectName = attempt?.question?.subject?.name || "Unknown";
        currentSubjectMistakes[subjectName] =
          (currentSubjectMistakes[subjectName] || 0) + 1;
      } catch (attemptError) {
        console.warn(
          `[Mistake Tracker] Error processing current attempt at index ${index}:`,
          attemptError
        );
      }
    });

    previousAttempts.forEach((attempt, index) => {
      try {
        const subjectName = attempt?.question?.subject?.name || "Unknown";
        previousSubjectMistakes[subjectName] =
          (previousSubjectMistakes[subjectName] || 0) + 1;
      } catch (attemptError) {
        console.warn(
          `[Mistake Tracker] Error processing previous attempt at index ${index}:`,
          attemptError
        );
      }
    });

    const allSubjects = new Set([
      ...Object.keys(currentSubjectMistakes),
      ...Object.keys(previousSubjectMistakes),
    ]);

    const subjectAnalysis = Array.from(allSubjects)
      .map((subject) => ({
        subject,
        current: currentSubjectMistakes[subject] || 0,
        previous: previousSubjectMistakes[subject] || 0,
        change:
          (currentSubjectMistakes[subject] || 0) -
          (previousSubjectMistakes[subject] || 0),
      }))
      .sort((a, b) => b.current - a.current);

    return subjectAnalysis;
  } catch (error) {
    console.error("[Mistake Tracker] Error in getMistakesBySubject:", error);
    return [];
  }
}

function getMistakeTrend(currentAttempts, previousAttempts) {
  try {
    if (!Array.isArray(currentAttempts) || !Array.isArray(previousAttempts)) {
      throw new Error("Invalid attempts data provided");
    }

    const currentLength = currentAttempts.length;
    const previousLength = previousAttempts.length;

    const trend = {
      improving: currentLength < previousLength,
      status: "",
      recommendation: "",
    };

    if (currentLength < previousLength) {
      trend.status = "IMPROVING";
      trend.recommendation = "Great progress! Keep up the good work.";
    } else if (currentLength > previousLength) {
      trend.status = "NEEDS_ATTENTION";
      trend.recommendation =
        "Mistakes have increased. Focus on weak topics and review concepts.";
    } else {
      trend.status = "STABLE";
      trend.recommendation =
        "Mistakes are consistent. Work on identifying patterns to improve.";
    }

    return trend;
  } catch (error) {
    console.error("[Mistake Tracker] Error in getMistakeTrend:", error);
    return {
      improving: false,
      status: 500,
      recommendation: "Unable to determine trend. Please try again.",
    };
  }
}

function generateMistakeConclusion(
  distribution: { type: string; percentage: number }[]
): string {
  try {
    // Validate input
    if (!Array.isArray(distribution) || distribution.length === 0) {
      throw new Error("Invalid distribution data provided");
    }

    // Validate each distribution item
    for (const item of distribution) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.type !== "string" ||
        typeof item.percentage !== "number" ||
        isNaN(item.percentage) ||
        item.percentage < 0
      ) {
        throw new Error("Invalid distribution item structure");
      }
    }

    const topMistake = distribution.reduce(
      (prev, curr) => {
        if (curr.percentage > prev.percentage) {
          return curr;
        }
        return prev;
      },
      { type: "NONE", percentage: 0 }
    );

    if (topMistake.percentage === 0) {
      return "Great job! You haven't made any significant mistakes recently. Keep up the consistency!";
    }

    const suggestions: Record<string, string> = {
      CONCEPTUAL:
        "Focus more on strengthening your core concepts. Revisit the theory and understand the *why* behind each topic.",
      CALCULATION:
        "Looks like calculation mistakes are frequent. Double-check your math and try not to rush through problems.",
      READING:
        "Pay closer attention to the question. Misreading could be costing you. Practice active reading strategies.",
      OVERCONFIDENCE:
        "Be mindful of overconfidence. It's okay to double-check even the seemingly easy questions.",
      OTHER:
        "You're making miscellaneous mistakes. Try reviewing your attempted questions to spot any patterns or habits.",
    };

    const suggestion = suggestions[topMistake.type];
    if (!suggestion) {
      return `Analyze your recent mistakes for improvement. (${topMistake.percentage}% of your mistakes fall under ${topMistake.type} category.)`;
    }

    return `${suggestion} (${topMistake.percentage}% of your mistakes fall under this category.)`;
  } catch (error) {
    console.error("Error generating mistake conclusion:", error);
    // Return a safe fallback message
    return "Continue analyzing your mistakes to identify areas for improvement.";
  }
}

function analyzeDetailedMistakePatterns(
  attempts: any[]
): DetailedMistakePattern[] {
  const patterns: Record<string, DetailedMistakePattern> = {};

  attempts.forEach((attempt) => {
    const mistakeType = attempt.mistake;
    const key = mistakeType;

    if (!patterns[key]) {
      patterns[key] = {
        mistakeType,
        count: 0,
        totalAttempts: 0,
        accuracy: 0,
        recentOccurrences: [],
      };
    }

    patterns[key].count++;

    if (patterns[key].recentOccurrences.length < 3) {
      patterns[key].recentOccurrences.push({
        questionId: attempt.questionId,
        solvedAt: attempt.solvedAt,
        difficulty: attempt.question.difficulty,
      });
    }
  });

  return Object.values(patterns)
    .filter((pattern) => pattern.count >= 2)
    .sort((a, b) => b.count - a.count);
}

function generateSpecificInsights(
  patterns: DetailedMistakePattern[],
  allAttempts: any[]
): SpecificInsight[] {
  const insights: SpecificInsight[] = [];

  patterns.slice(0, 5).forEach((pattern) => {
    const insight = createMistakeInsight(pattern);
    if (insight) insights.push(insight);
  });

  const weaknessInsights = identifyWeaknesses(allAttempts);
  insights.push(...weaknessInsights.slice(0, 2));

  return insights.sort((a, b) => {
    const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

function createMistakeInsight(
  pattern: DetailedMistakePattern
): SpecificInsight | null {
  const mistakeDescriptions = {
    CONCEPTUAL: "Concept not clear",
    CALCULATION: "Calculation errors",
    READING: "Question misinterpretation",
    OVERCONFIDENCE: "Rushed answers",
  };

  const severity =
    pattern.count >= 5 ? "HIGH" : pattern.count >= 3 ? "MEDIUM" : "LOW";
  const description =
    mistakeDescriptions[pattern.mistakeType] || "Common errors";

  return {
    type: "MISTAKE_PATTERN",
    title: `${pattern.mistakeType.charAt(0) + pattern.mistakeType.slice(1).toLowerCase()} Errors`,
    description: `You consistently make "${description}" errors in your practice.`,
    mistakeType: pattern.mistakeType,
    frequency: pattern.count,
    severity,
  };
}
function identifyWeaknesses(allAttempts: any[]): SpecificInsight[] {
  const mistakeTypePerformance: Record<
    string,
    { correct: number; total: number }
  > = {};

  allAttempts.forEach((attempt) => {
    const mistakeType = attempt.mistake || "NONE";

    if (!mistakeTypePerformance[mistakeType]) {
      mistakeTypePerformance[mistakeType] = { correct: 0, total: 0 };
    }

    mistakeTypePerformance[mistakeType].total++;
    if (attempt.status === "CORRECT") {
      mistakeTypePerformance[mistakeType].correct++;
    }
  });

  const weaknesses: SpecificInsight[] = [];

  Object.entries(mistakeTypePerformance).forEach(
    ([mistakeType, performance]) => {
      if (performance.total >= 5 && mistakeType !== "NONE") {
        const accuracy = (performance.correct / performance.total) * 100;

        if (accuracy < 50) {
          weaknesses.push({
            type: "WEAKNESS",
            title: `Persistent ${mistakeType
              .replace(/_/g, " ")
              .toLocaleLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())} Issues`,
            description: `Your accuracy for ${mistakeType.toLowerCase()} related questions is ${accuracy.toFixed(1)}% across ${performance.total} attempts.`,
            severity: accuracy < 30 ? "HIGH" : "MEDIUM",
          });
        }
      }
    }
  );

  return weaknesses.sort((a, b) => {
    const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}
