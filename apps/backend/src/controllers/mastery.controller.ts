import {
  generateChemistryRecommendationByMastery,
  generateMathematicsRecommendationByMastery,
  generatePhysicsRecommendationByMastery,
} from "@/constant/recommendation/master.recommendation.constant";
import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { SubscriptionStatus } from "@repo/db/enums";
import { NextFunction, Response } from "express";

const MASTERY_THRESHOLDS = {
  EXCELLENT: 70,
  GOOD: 60,
  SATISFACTORY: 40,
} as const;

interface SubjectMasteryResponse {
  id: string;
  name: string;
  masteryPercentage: number;
  concepts: {
    mastered: number;
    total: number;
  };
  improvementFromLastMonth: number;
  improvementAreas: Array<{
    name: string;
    masteryLevel: number;
  }>;
  topPerformingTopics: Array<{
    name: string;
    masteryLevel: number;
  }>;
  recommendations: Recommendation[];
}
interface Recommendation {
  icon: RecommendationIcon;
  color: RecommendationColor;
  type: RecommendationType;
  message: string;
}

export type RecommendationType =
  | "physics"
  | "chemistry"
  | "biology"
  | "mathematics"
  | "default";
export type RecommendationIcon = "info" | "warning" | "check" | "close";
export type RecommendationColor =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "teal"
  | "gray"
  | "indigo"
  | "lime";
// const TOP_PERCENTILE_THRESHOLDS = [
//   { score: 95, percentile: 1 },
//   { score: 90, percentile: 5 },
//   { score: 80, percentile: 10 },
//   { score: 70, percentile: 25 },
//   { score: 60, percentile: 50 },
//   { score: 40, percentile: 75 },
// ] as const;

// const MASTERY_LABELS = [
//   { threshold: MASTERY_THRESHOLDS.EXCELLENT, label: "Excellent" },
//   { threshold: MASTERY_THRESHOLDS.GOOD, label: "Good" },
//   { threshold: MASTERY_THRESHOLDS.SATISFACTORY, label: "Satisfactory" },
// ];
interface MasteryData {
  subject: {
    id: string;
    name: string;
    examCode: string;
  };
  overallMastery: number;
  topics: Array<{
    id: string;
    name: string;
    slug?: string;
    mastery: number;
    weightage: number;
    orderIndex: number;
    estimatedMinutes?: number;
    totalAttempts: number;
    masteredCount: number;
    strengthIndex: number;
    lastPracticed: string | null;
    subtopics: Array<{
      id: string;
      name: string;
      slug?: string;
      mastery: number;
      totalAttempts: number;
      masteredCount: number;
      orderIndex: number;
      estimatedMinutes?: number;
      strengthIndex: number;
      lastPracticed: string | null;
    }>;
  }>;
  userExamCode?: string;
}

interface TopicWithMastery {
  mastery: number;
  orderIndex: number;
}

interface LastAttemptData {
  entity_id: string;
  entity_type: "topic" | "subtopic";
  solvedAt: string;
}
const masteryCache = new Map<
  string,
  { data: MasteryData; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000;

const sortComparators = {
  "mastery-asc": (a: TopicWithMastery, b: TopicWithMastery) =>
    a.mastery - b.mastery,
  "mastery-desc": (a: TopicWithMastery, b: TopicWithMastery) =>
    b.mastery - a.mastery,
  index: (a: TopicWithMastery, b: TopicWithMastery) =>
    a.orderIndex - b.orderIndex,
} as const;
const VALID_SORT_OPTIONS = new Set(["index", "mastery-asc", "mastery-desc"]);

export class MasteryController {
  getMasteryDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const examCode = req.user.examCode;
      const plan = req.user.plan;
      if (
        plan.status === SubscriptionStatus.EXPIRED ||
        new Date(plan.endAt) < new Date()
      ) {
        ResponseUtil.error(
          res,
          "Your subscription has expired. Please upgrade to access Mastery Dashboard.",
          403
        );
      }
      if (!examCode) {
        ResponseUtil.error(res, "Exam code is required", 400);
      }
      const [overallMastery, conceptsMastered, studyStreak, improvement] =
        await Promise.all([
          calculateOverallMastery(userId),
          getConceptsMasteredData(userId, examCode),
          getStudyStreakData(userId),
          getImprovementData(userId),
        ]);
      ResponseUtil.success(
        res,
        {
          overallMastery,
          conceptsMastered,
          studyStreak,
          improvement,
        },
        "Ok",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };
  getTopMasteryBySubject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const examCode = req.user.examCode;
      if (!examCode) {
        ResponseUtil.error(res, "Exam code is required", 400);
      }
      const plan = req.user.plan;
      if (
        plan.status === SubscriptionStatus.EXPIRED ||
        new Date(plan.endAt) < new Date()
      ) {
        ResponseUtil.error(
          res,
          "Your subscription has expired. Please upgrade to access Subject Mastery.",
          403
        );
      }
      const improvementAreasCountParam = req.query
        .improvementAreasCount as string;
      const topPerformingCountParam = req.query.topPerformingCount as string;
      const improvementAreasCount = improvementAreasCountParam
        ? parseInt(improvementAreasCountParam)
        : 2;
      const topPerformingCount = topPerformingCountParam
        ? parseInt(topPerformingCountParam)
        : 3;
      const subjectMasteryData = await getSubjectMasteryData(
        userId,
        examCode,
        improvementAreasCount,
        topPerformingCount
      );
      ResponseUtil.success(res, subjectMasteryData, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
        Vary: "Authorization",
      });
    } catch (error) {
      next(error);
    }
  };
  getFullMasteryBySubjectId = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const sortBy = (req.query.sortBy as string) || "index";
      const subjectId = req.params.subjectId;
      if (!VALID_SORT_OPTIONS.has(sortBy)) {
        ResponseUtil.error(res, "Invalid sortBy parameter", 400);
      }
      const masteryData = await getSubjectMasteryDataBySubjectId(
        userId,
        subjectId,
        sortBy
      );
      ResponseUtil.success(res, masteryData, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
        Vary: "Authorization",
      });
    } catch (error) {
      next(error);
    }
  };
}
async function calculateOverallMastery(userId: string): Promise<number> {
  try {
    const result = await prisma.subjectMastery.aggregate({
      where: { userId },
      _avg: { masteryLevel: true },
    });
    return Math.round(result._avg.masteryLevel ?? 0);
  } catch (error) {
    console.error("[Get Mastery] Error calculating overall mastery:", error);
    return 0;
  }
}
async function getConceptsMasteredData(userId: string, examCode: string) {
  try {
    const [masteredCount, totalTopics] = await Promise.all([
      prisma.topicMastery.count({
        where: {
          userId,
          masteryLevel: { gte: MASTERY_THRESHOLDS.EXCELLENT },
        },
      }),
      prisma.topic.count({
        where: {
          subject: {
            examSubjects: { some: { examCode } },
          },
        },
      }),
    ]);

    return { mastered: masteredCount, total: totalTopics };
  } catch (error) {
    console.error(
      "[Get Mastery] Error fetching concepts mastered data:",
      error
    );
    return { mastered: 0, total: 0 };
  }
}
async function getStudyStreakData(userId: string) {
  try {
    const userPerformance = await prisma.userPerformance.findUnique({
      where: { userId },
      select: { streak: true },
    });

    const streakDays = userPerformance?.streak || 0;

    return { days: streakDays, message: getStreakMessage(streakDays) };
  } catch (error) {
    console.error("[Get Mastery] Error fetching study streak data:", error);
    return { days: 0, message: getStreakMessage(0) };
  }
}
function getStreakMessage(streakDays: number): string {
  return streakDays >= 7 ? "Keep it up! 🔥" : "Keep learning daily!";
}

async function getImprovementData(userId: string): Promise<number> {
  try {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const lastMonthMastery = await prisma.masteryHistory.findFirst({
      where: { userId, recordedAt: { lt: previousMonth } },
      select: { masteryLevel: true },
      orderBy: { recordedAt: "desc" },
    });

    if (!lastMonthMastery?.masteryLevel) return 0;

    const current = await calculateOverallMastery(userId);
    return Math.round(current - lastMonthMastery.masteryLevel);
  } catch (error) {
    console.error("[Get Mastery] Error fetching improvement data:", error);
    return 0;
  }
}

// ============================
const getSubjectMasteryData = async (
  userId: string,
  examCode: string,
  improvementAreasCount: number,
  topPerformingCount: number
): Promise<SubjectMasteryResponse[]> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!examCode) {
    throw new Error("Exam code is required");
  }

  return await prisma.$transaction(
    async (tx) => {
      try {
        const [subjects, allSubjectMasteries, allTopicMasteries, allSubTopics] =
          await Promise.all([
            tx.subject.findMany({
              where: { examSubjects: { some: { examCode } } },
              select: { id: true, name: true },
            }),
            tx.subjectMastery.findMany({
              where: { userId },
              select: {
                subjectId: true,
                masteryLevel: true,
                totalAttempts: true,
                correctAttempts: true,
              },
            }),
            tx.topicMastery.findMany({
              where: { userId },
              select: {
                topicId: true,
                masteryLevel: true,
                strengthIndex: true,
                topic: {
                  select: {
                    id: true,
                    name: true,
                    subjectId: true,
                  },
                },
              },
            }),
            tx.subtopicMastery.findMany({
              where: { userId },
              select: {
                subtopicId: true,
                masteryLevel: true,
                subtopic: {
                  select: {
                    name: true,
                    topicId: true,
                  },
                },
              },
            }),
          ]);

        const previousMonthDate = new Date();
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

        const [previousMasteries, topicsPerSubject] = await Promise.all([
          tx.masteryHistory.findMany({
            where: {
              userId,
              recordedAt: { lt: previousMonthDate },
            },
            orderBy: { recordedAt: "desc" },
            distinct: ["subjectId"],
            select: {
              subjectId: true,
              masteryLevel: true,
            },
          }),
          tx.topic.groupBy({
            by: ["subjectId"],
            _count: { id: true },
          }),
        ]);

        // Create maps for efficient lookups
        const subjectMasteriesMap = new Map(
          allSubjectMasteries.map((sm) => [sm.subjectId, sm])
        );

        const previousMasteriesMap = new Map(
          previousMasteries.map((pm) => [pm.subjectId, pm])
        );

        const topicsCountMap = new Map(
          topicsPerSubject.map((t) => [t.subjectId, t._count.id])
        );

        const topicMasteriesBySubject = new Map<
          string,
          Array<{
            id: string;
            name: string;
            masteryLevel: number;
            strengthIndex: number;
          }>
        >();

        // Group topic masteries by subject
        allTopicMasteries.forEach((tm) => {
          const subjectId = tm.topic.subjectId;
          if (!topicMasteriesBySubject.has(subjectId)) {
            topicMasteriesBySubject.set(subjectId, []);
          }
          topicMasteriesBySubject.get(subjectId)?.push({
            id: tm.topic.id,
            name: tm.topic.name,
            masteryLevel: tm.masteryLevel,
            strengthIndex: tm.strengthIndex,
          });
        });

        const subtopicsByTopic = new Map<
          string,
          Array<{
            name: string;
            masteryLevel: number;
          }>
        >();

        // Group subtopics by topic
        allSubTopics.forEach((stm) => {
          const topicId = stm.subtopic.topicId;
          if (!subtopicsByTopic.has(topicId)) {
            subtopicsByTopic.set(topicId, []);
          }
          subtopicsByTopic.get(topicId)?.push({
            name: stm.subtopic.name,
            masteryLevel: stm.masteryLevel,
          });
        });

        return subjects.map((subject) => {
          try {
            const subjectId = subject.id;
            const subjectMastery = subjectMasteriesMap.get(subjectId) || {
              masteryLevel: 0,
            };
            const previousMastery = previousMasteriesMap.get(subjectId);
            const topicCount = topicsCountMap.get(subjectId) || 0;

            const subjectTopics = topicMasteriesBySubject.get(subjectId) || [];
            const masteryLevel = Math.max(
              0,
              Math.min(100, subjectMastery.masteryLevel || 0)
            );
            const improvementPercentage = previousMastery
              ? masteryLevel - previousMastery.masteryLevel
              : 0;

            const conceptsPerTopic = 10;
            const totalConcepts = Math.max(0, topicCount * conceptsPerTopic);
            const conceptsMastered = Math.round(
              (masteryLevel / 100) * totalConcepts
            );

            const sortedByMastery = [...subjectTopics].sort(
              (a, b) => a.masteryLevel - b.masteryLevel
            );
            const weakestTopics = sortedByMastery.slice(
              0,
              Math.max(0, improvementAreasCount)
            );
            const strongestTopics = [...subjectTopics]
              .sort((a, b) => b.masteryLevel - a.masteryLevel)
              .slice(0, Math.max(0, topPerformingCount));

            const recommendations: Recommendation[] = [];

            // Generate recommendations for weakest topic
            if (weakestTopics.length > 0) {
              const weakestTopic = weakestTopics[0];
              const recommendation = generateRecommendations(
                subject.name,
                weakestTopics.map((t) => ({
                  name: t.name,
                  masteryLevel: t.masteryLevel,
                })),
                weakestTopic.name
              );
              recommendations.push(recommendation);
            }

            // Generate recommendations for strongest topic (if different from weakest)
            if (
              strongestTopics.length > 0 &&
              (!weakestTopics.length ||
                strongestTopics[0].id !== weakestTopics[0].id)
            ) {
              const strongestTopic = strongestTopics[0];
              const recommendation = generateRecommendations(
                subject.name,
                strongestTopics.map((t) => ({
                  name: t.name,
                  masteryLevel: t.masteryLevel,
                })),
                strongestTopic.name
              );
              recommendations.push(recommendation);
            }

            return {
              id: subjectId,
              name: subject.name,
              masteryPercentage: masteryLevel,
              concepts: {
                mastered: conceptsMastered,
                total: totalConcepts,
              },
              improvementFromLastMonth: improvementPercentage,
              improvementAreas: weakestTopics.map((t) => ({
                name: t.name,
                masteryLevel: Math.max(0, Math.min(100, t.masteryLevel)),
              })),
              topPerformingTopics: strongestTopics.map((t) => ({
                name: t.name,
                masteryLevel: Math.max(0, Math.min(100, t.masteryLevel)),
              })),
              recommendations: recommendations.slice(0, 2),
            };
          } catch (error) {
            console.error(`Error processing subject ${subject.name}:`, error);
            // Return a safe default for this subject
            return {
              id: subject.id,
              name: subject.name,
              masteryPercentage: 0,
              concepts: {
                mastered: 0,
                total: 0,
              },
              improvementFromLastMonth: 0,
              improvementAreas: [],
              topPerformingTopics: [],
              recommendations: [],
            };
          }
        });
      } catch (error) {
        console.error("Database transaction error:", error);
        throw new Error("Failed to fetch mastery data from database");
      }
    },
    {
      isolationLevel: "ReadCommitted",
      timeout: 30000, // 30 second timeout
    }
  );
};

function generateRecommendations(
  subjectName: string,
  topicData: Array<{ name: string; masteryLevel: number }>,
  topicName: string
): Recommendation {
  try {
    const masteryLevel =
      topicData.find((t) => t.name === topicName)?.masteryLevel || 0;

    switch (subjectName.toLowerCase()) {
      case "physics":
        return generatePhysicsRecommendationByMastery(topicName, masteryLevel);

      case "chemistry":
        return generateChemistryRecommendationByMastery(
          topicName,
          masteryLevel
        );

      case "mathematics":
        return generateMathematicsRecommendationByMastery(
          topicName,
          masteryLevel
        );

      case "biology":
        return generateChemistryRecommendationByMastery(
          topicName,
          masteryLevel
        );

      default:
        return {
          icon: "info",
          color: "gray",
          type: "default",
          message: `No specific recommendations available for **${subjectName}**. Keep practicing!`,
        };
    }
  } catch (error) {
    console.error(
      `Error generating recommendations for ${subjectName}:`,
      error
    );
    return {
      icon: "info",
      color: "gray",
      type: "default",
      message: `Unable to generate recommendations for **${subjectName}**. Please try again later.`,
    };
  }
}

// ============================
async function getSubjectMasteryDataBySubjectId(
  userId: string,
  subjectId: string,
  sortBy: string = "index"
): Promise<MasteryData> {
  // Input validation with early return
  if (!userId || !subjectId) {
    throw new Error("User ID and Subject ID are required");
  }

  // Check cache first (O(1) lookup)
  const cacheKey = `${userId}-${subjectId}-${sortBy}`;
  const cached = masteryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Hit] Serving cached data for ${cacheKey}`);
    return cached.data;
  }

  // Optimized: Single query to fetch all required data using joins
  // This reduces database round trips from ~4 queries to 1 query
  const [subjectData, lastAttemptData] = await Promise.all([
    // Main data query with optimized joins
    prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        name: true,
        examSubjects: {
          select: { examCode: true },
          take: 1, // Only need the first exam code
        },
        topics: {
          select: {
            id: true,
            name: true,
            slug: true,
            weightage: true,
            orderIndex: true,
            estimatedMinutes: true,
            topicMastery: {
              where: { userId },
              select: {
                masteryLevel: true,
                strengthIndex: true,
                totalAttempts: true,
                correctAttempts: true,
              },
            },
            subTopics: {
              select: {
                id: true,
                name: true,
                slug: true,
                orderIndex: true,
                estimatedMinutes: true,
                subtopicMastery: {
                  where: { userId },
                  select: {
                    masteryLevel: true,
                    strengthIndex: true,
                    totalAttempts: true,
                    correctAttempts: true,
                  },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    }),

    // Optimized: Single query for last attempts with proper indexing
    prisma.$queryRaw`
            WITH topic_attempts AS (
                SELECT DISTINCT ON (q."topicId") 
                    q."topicId" as entity_id,
                    'topic' as entity_type,
                    a."solvedAt"
                FROM "Attempt" a
                JOIN "Question" q ON a."questionId" = q.id
                WHERE a."userId" = ${userId} 
                  AND q."topicId" IN (
                      SELECT t.id FROM "Topic" t WHERE t."subjectId" = ${subjectId}
                  )
                ORDER BY q."topicId", a."solvedAt" DESC
            ),
            subtopic_attempts AS (
                SELECT DISTINCT ON (q."subtopicId") 
                    q."subtopicId" as entity_id,
                    'subtopic' as entity_type,
                    a."solvedAt"
                FROM "Attempt" a
                JOIN "Question" q ON a."questionId" = q.id
                WHERE a."userId" = ${userId} 
                  AND q."subtopicId" IN (
                      SELECT st.id FROM "SubTopic" st 
                      JOIN "Topic" t ON st."topicId" = t.id 
                      WHERE t."subjectId" = ${subjectId}
                  )
                ORDER BY q."subtopicId", a."solvedAt" DESC
            )
            SELECT * FROM topic_attempts 
            UNION ALL 
            SELECT * FROM subtopic_attempts
        `,
  ]);

  if (!subjectData) {
    throw new Error("Subject not found");
  }

  // Get user's exam code efficiently
  const userExamRegistration = await prisma.examUser.findFirst({
    where: { userId },
    select: { examCode: true },
    orderBy: { registeredAt: "desc" },
    take: 1, // Only need the latest one
  });

  const userExamCode =
    userExamRegistration?.examCode ||
    subjectData.examSubjects[0]?.examCode ||
    "";

  // Create efficient lookup maps (O(1) access instead of O(n) array.find)
  const lastAttemptMap = new Map<string, Date>();

  // Process last attempt data into maps
  (lastAttemptData as LastAttemptData[]).forEach((attempt: LastAttemptData) => {
    if (attempt.entity_id && !lastAttemptMap.has(attempt.entity_id)) {
      lastAttemptMap.set(attempt.entity_id, new Date(attempt.solvedAt));
    }
  });

  // Process topics data with optimized calculations
  const processedTopics = subjectData.topics.map((topic) => {
    const topicMastery = topic.topicMastery[0];
    const mastery = topicMastery?.masteryLevel || 0;
    const totalAttempts = topicMastery?.totalAttempts || 0;
    const strengthIndex = topicMastery?.strengthIndex || 0;
    const masteredCount = mastery >= 70 ? 1 : 0;

    // Process subtopics with optimized mapping
    const subtopics = topic.subTopics.map((subtopic) => {
      const subtopicMastery = subtopic.subtopicMastery[0];
      const subtopicMasteryLevel = subtopicMastery?.masteryLevel || 0;
      const subtopicTotalAttempts = subtopicMastery?.totalAttempts || 0;
      const subtopicStrengthIndex = subtopicMastery?.strengthIndex || 0;
      const subtopicMasteredCount = subtopicMasteryLevel >= 70 ? 1 : 0;

      // O(1) lookup instead of array search
      const lastPracticedDate = lastAttemptMap.get(subtopic.id);
      const lastPracticed = lastPracticedDate
        ? lastPracticedDate.toISOString()
        : null;

      return {
        id: subtopic.id,
        name: subtopic.name,
        slug: subtopic.slug,
        mastery: subtopicMasteryLevel,
        totalAttempts: subtopicTotalAttempts,
        masteredCount: subtopicMasteredCount,
        orderIndex: subtopic.orderIndex,
        estimatedMinutes: subtopic.estimatedMinutes,
        strengthIndex: subtopicStrengthIndex,
        lastPracticed,
      };
    });

    // O(1) lookup for topic last practiced
    const topicLastPracticedDate = lastAttemptMap.get(topic.id);
    const topicLastPracticed = topicLastPracticedDate
      ? topicLastPracticedDate.toISOString()
      : null;

    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      mastery,
      weightage: topic.weightage,
      orderIndex: topic.orderIndex,
      estimatedMinutes: topic.estimatedMinutes,
      totalAttempts,
      masteredCount,
      strengthIndex,
      lastPracticed: topicLastPracticed,
      subtopics,
    };
  });

  // Optimized sorting using pre-defined comparator functions
  // This avoids function creation overhead in each sort call
  const comparator =
    sortComparators[sortBy as keyof typeof sortComparators] ||
    sortComparators.index;

  // Use stable sort (Timsort) which is O(n log n) worst case, O(n) best case
  const sortedTopics = [...processedTopics].sort(comparator);

  // Optimized overall mastery calculation using single pass
  let totalWeight = 0;
  let weightedMasterySum = 0;

  for (const topic of sortedTopics) {
    totalWeight += topic.weightage;
    weightedMasterySum += topic.mastery * topic.weightage;
  }

  const overallMastery =
    totalWeight > 0 ? Math.round(weightedMasterySum / totalWeight) : 0;

  const result: MasteryData = {
    subject: {
      id: subjectData.id,
      name: subjectData.name,
      examCode: userExamCode,
    },
    overallMastery,
    topics: sortedTopics,
    userExamCode,
  };

  // Cache the result for future requests
  masteryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
  });

  if (masteryCache.size > 1000) {
    // Arbitrary limit
    const now = Date.now();
    const keysToDelete: string[] = [];
    masteryCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => masteryCache.delete(key));
  }

  return result;
}
