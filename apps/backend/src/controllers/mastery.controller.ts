import {
  generateBiologyRecommendationByMastery,
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
  concepts: { mastered: number; total: number };
  improvementFromLastMonth: number;
  improvementAreas: Array<{ name: string; masteryLevel: number }>;
  topPerformingTopics: Array<{ name: string; masteryLevel: number }>;
  recommendations: Recommendation[];
}

interface Recommendation {
  icon: RecommendationIcon;
  color: RecommendationColor;
  type: RecommendationType;
  message: string;
}

export type RecommendationType = "physics" | "chemistry" | "biology" | "mathematics" | "default";
export type RecommendationIcon = "info" | "warning" | "check" | "close";
export type RecommendationColor = "red" | "blue" | "green" | "purple" | "teal" | "gray" | "indigo" | "lime";

interface MasteryData {
  subject: { id: string; name: string; examCode: string };
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

const masteryCache = new Map<string, { data: MasteryData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const sortComparators = {
  "mastery-asc": (a: TopicWithMastery, b: TopicWithMastery) => a.mastery - b.mastery,
  "mastery-desc": (a: TopicWithMastery, b: TopicWithMastery) => b.mastery - a.mastery,
  index: (a: TopicWithMastery, b: TopicWithMastery) => a.orderIndex - b.orderIndex,
} as const;

const VALID_SORT_OPTIONS = new Set(["index", "mastery-asc", "mastery-desc"]);

export class MasteryController {
  getMasteryDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id: userId, examCode, plan } = req.user;

      if (plan.status !== SubscriptionStatus.ACTIVE && plan.status !== SubscriptionStatus.TRIAL) {
        ResponseUtil.error(res, "Your subscription is not active. Please upgrade to access Mastery Dashboard.", 403);
        return;
      }

      if (!examCode) {
        ResponseUtil.error(res, "Exam code is required", 400);
        return;
      }

      const [overallMastery, conceptsMastered, studyStreak, lastMonthMastery] = await Promise.all([
        calculateOverallMastery(userId),
        getConceptsMasteredData(userId, examCode),
        getStudyStreakData(userId),
        getLastMonthMastery(userId),
      ]);

      const improvement = lastMonthMastery ? Math.round(overallMastery - lastMonthMastery) : 0;

      ResponseUtil.success(res, { overallMastery, conceptsMastered, studyStreak, improvement }, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
        Vary: "Authorization",
      });
    } catch (error) {
      next(error);
    }
  };

  getTopMasteryBySubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id: userId, examCode, plan } = req.user;

      if (!examCode) {
        ResponseUtil.error(res, "Exam code is required", 400);
        return;
      }

      if (plan.status !== SubscriptionStatus.ACTIVE && plan.status !== SubscriptionStatus.TRIAL) {
        ResponseUtil.error(res, "Your subscription is not active. Please upgrade to access Subject Mastery.", 403);
        return;
      }

      const improvementAreasCount = parseInt(req.query.improvementAreasCount as string) || 2;
      const topPerformingCount = parseInt(req.query.topPerformingCount as string) || 3;

      const subjectMasteryData = await getSubjectMasteryData(userId, examCode, improvementAreasCount, topPerformingCount);

      ResponseUtil.success(res, subjectMasteryData, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
        Vary: "Authorization",
      });
    } catch (error) {
      next(error);
    }
  };

  getFullMasteryBySubjectId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id: userId, plan } = req.user;

      if (plan.status !== SubscriptionStatus.ACTIVE && plan.status !== SubscriptionStatus.TRIAL) {
        ResponseUtil.error(res, "Your subscription is not active. Please upgrade to access Subject Mastery Details.", 403);
        return;
      }

      const sortBy = (req.query.sortBy as string) || "index";
      const subjectId = req.params.subjectId;

      if (!VALID_SORT_OPTIONS.has(sortBy)) {
        ResponseUtil.error(res, "Invalid sortBy parameter", 400);
        return;
      }

      const masteryData = await getSubjectMasteryDataBySubjectId(userId, subjectId, sortBy);

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
  } catch {
    return 0;
  }
}

async function getConceptsMasteredData(userId: string, examCode: string) {
  try {
    const [masteredCount, totalTopics] = await Promise.all([
      prisma.topicMastery.count({
        where: { userId, masteryLevel: { gte: MASTERY_THRESHOLDS.GOOD } },
      }),
      prisma.topic.count({
        where: { subject: { examSubjects: { some: { examCode } } } },
      }),
    ]);
    return { mastered: masteredCount, total: totalTopics };
  } catch {
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
    return { days: streakDays, message: streakDays >= 7 ? "Keep it up! 🔥" : "Keep learning daily!" };
  } catch {
    return { days: 0, message: "Keep learning daily!" };
  }
}

async function getLastMonthMastery(userId: string): Promise<number | null> {
  try {
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const record = await prisma.masteryHistory.findFirst({
      where: { userId, recordedAt: { lt: previousMonth } },
      select: { masteryLevel: true },
      orderBy: { recordedAt: "desc" },
    });
    return record?.masteryLevel ?? null;
  } catch {
    return null;
  }
}

const getSubjectMasteryData = async (
  userId: string,
  examCode: string,
  improvementAreasCount: number,
  topPerformingCount: number
): Promise<SubjectMasteryResponse[]> => {
  if (!userId || !examCode) throw new Error("User ID and Exam code are required");

  const subjects = await prisma.subject.findMany({
    where: { examSubjects: { some: { examCode } } },
    select: { id: true, name: true },
  });

  if (subjects.length === 0) return [];

  const subjectIds = subjects.map(s => s.id);
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

  const [allSubjectMasteries, allTopicMasteries, previousMasteries, topicsPerSubject] = await Promise.all([
    prisma.subjectMastery.findMany({
      where: { userId, subjectId: { in: subjectIds } },
      select: { subjectId: true, masteryLevel: true },
    }),
    prisma.topicMastery.findMany({
      where: { userId, topic: { subjectId: { in: subjectIds } } },
      select: {
        masteryLevel: true,
        strengthIndex: true,
        topic: { select: { id: true, name: true, subjectId: true } },
      },
    }),
    prisma.masteryHistory.findMany({
      where: { userId, subjectId: { in: subjectIds }, recordedAt: { lt: previousMonthDate } },
      orderBy: { recordedAt: "desc" },
      distinct: ["subjectId"],
      select: { subjectId: true, masteryLevel: true },
    }),
    prisma.topic.groupBy({
      by: ["subjectId"],
      where: { subjectId: { in: subjectIds } },
      _count: { id: true },
    }),
  ]);

  const subjectMasteriesMap = new Map(allSubjectMasteries.map(sm => [sm.subjectId, sm.masteryLevel]));
  const previousMasteriesMap = new Map(previousMasteries.map(pm => [pm.subjectId, pm.masteryLevel]));
  const topicsCountMap = new Map(topicsPerSubject.map(t => [t.subjectId, t._count.id]));

  const topicMasteriesBySubject = new Map<string, Array<{ id: string; name: string; masteryLevel: number }>>();
  for (const tm of allTopicMasteries) {
    const sid = tm.topic.subjectId;
    if (!topicMasteriesBySubject.has(sid)) topicMasteriesBySubject.set(sid, []);
    topicMasteriesBySubject.get(sid)!.push({ id: tm.topic.id, name: tm.topic.name, masteryLevel: tm.masteryLevel });
  }

  return subjects.map(subject => {
    const masteryLevel = Math.max(0, Math.min(100, subjectMasteriesMap.get(subject.id) || 0));
    const previousMastery = previousMasteriesMap.get(subject.id);
    const topicCount = topicsCountMap.get(subject.id) || 0;
    const subjectTopics = topicMasteriesBySubject.get(subject.id) || [];

    const totalConcepts = topicCount * 10;
    const conceptsMastered = Math.round((masteryLevel / 100) * totalConcepts);

    const sorted = subjectTopics.slice().sort((a, b) => a.masteryLevel - b.masteryLevel);
    const weakestTopics = sorted.slice(0, improvementAreasCount);
    const strongestTopics = sorted.slice(-topPerformingCount).reverse();

    const recommendations: Recommendation[] = [];
    if (weakestTopics.length > 0) {
      recommendations.push(generateRecommendation(subject.name, weakestTopics[0].name, weakestTopics[0].masteryLevel));
    }
    if (strongestTopics.length > 0 && (!weakestTopics.length || strongestTopics[0].id !== weakestTopics[0].id)) {
      recommendations.push(generateRecommendation(subject.name, strongestTopics[0].name, strongestTopics[0].masteryLevel));
    }

    return {
      id: subject.id,
      name: subject.name,
      masteryPercentage: masteryLevel,
      concepts: { mastered: conceptsMastered, total: totalConcepts },
      improvementFromLastMonth: previousMastery ? masteryLevel - previousMastery : 0,
      improvementAreas: weakestTopics.map(t => ({ name: t.name, masteryLevel: Math.max(0, Math.min(100, t.masteryLevel)) })),
      topPerformingTopics: strongestTopics.map(t => ({ name: t.name, masteryLevel: Math.max(0, Math.min(100, t.masteryLevel)) })),
      recommendations: recommendations.slice(0, 2),
    };
  });
};

function generateRecommendation(subjectName: string, topicName: string, masteryLevel: number): Recommendation {
  try {
    switch (subjectName.toLowerCase()) {
      case "physics": return generatePhysicsRecommendationByMastery(topicName, masteryLevel);
      case "chemistry": return generateChemistryRecommendationByMastery(topicName, masteryLevel);
      case "mathematics": return generateMathematicsRecommendationByMastery(topicName, masteryLevel);
      case "biology": return generateBiologyRecommendationByMastery(topicName, masteryLevel);
      default: return { icon: "info", color: "gray", type: "default", message: `No specific recommendations available for **${subjectName}**. Keep practicing!` };
    }
  } catch {
    return { icon: "info", color: "gray", type: "default", message: `Unable to generate recommendations for **${subjectName}**. Please try again later.` };
  }
}

async function getSubjectMasteryDataBySubjectId(userId: string, subjectId: string, sortBy: string = "index"): Promise<MasteryData> {
  if (!userId || !subjectId) throw new Error("User ID and Subject ID are required");

  const baseCacheKey = `${userId}-${subjectId}`;
  const cached = masteryCache.get(baseCacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    const comparator = sortComparators[sortBy as keyof typeof sortComparators] || sortComparators.index;
    return { ...cached.data, topics: cached.data.topics.slice().sort(comparator) };
  }

  const [subjectData, lastAttemptData] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        name: true,
        examSubjects: { select: { examCode: true }, take: 1 },
        subjectMastery: {
          where: { userId },
          select: { masteryLevel: true },
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
              select: { masteryLevel: true, strengthIndex: true, totalAttempts: true },
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
                  select: { masteryLevel: true, strengthIndex: true, totalAttempts: true },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    }),
    prisma.$queryRaw<LastAttemptData[]>`
      SELECT DISTINCT ON (entity_id) entity_id, entity_type, "solvedAt"
      FROM (
        SELECT q."topicId" as entity_id, 'topic' as entity_type, a."solvedAt"
        FROM "Attempt" a
        JOIN "Question" q ON a."questionId" = q.id
        WHERE a."userId" = ${userId} AND q."topicId" IN (SELECT id FROM "Topic" WHERE "subjectId" = ${subjectId})
        UNION ALL
        SELECT q."subtopicId" as entity_id, 'subtopic' as entity_type, a."solvedAt"
        FROM "Attempt" a
        JOIN "Question" q ON a."questionId" = q.id
        WHERE a."userId" = ${userId} AND q."subtopicId" IN (
          SELECT st.id FROM "SubTopic" st JOIN "Topic" t ON st."topicId" = t.id WHERE t."subjectId" = ${subjectId}
        )
      ) combined
      ORDER BY entity_id, "solvedAt" DESC
    `,
  ]);

  if (!subjectData) throw new Error("Subject not found");

  const userExamCode = subjectData.examSubjects[0]?.examCode || "";
  const lastAttemptMap = new Map<string, Date>();
  for (const a of lastAttemptData) {
    if (a.entity_id && !lastAttemptMap.has(a.entity_id)) {
      lastAttemptMap.set(a.entity_id, new Date(a.solvedAt));
    }
  }

  let totalWeight = 0;
  let weightedMasterySum = 0;

  const processedTopics = subjectData.topics.map(topic => {
    const tm = topic.topicMastery[0];
    const mastery = tm?.masteryLevel || 0;
    const totalAttempts = tm?.totalAttempts || 0;
    const strengthIndex = tm?.strengthIndex || 0;
    const weightage = topic.weightage;

    totalWeight += weightage;
    weightedMasterySum += mastery * weightage;

    const subtopics = topic.subTopics.map(subtopic => {
      const sm = subtopic.subtopicMastery[0];
      const lastPracticedDate = lastAttemptMap.get(subtopic.id);
      return {
        id: subtopic.id,
        name: subtopic.name,
        slug: subtopic.slug,
        mastery: sm?.masteryLevel || 0,
        totalAttempts: sm?.totalAttempts || 0,
        masteredCount: (sm?.masteryLevel || 0) >= MASTERY_THRESHOLDS.EXCELLENT ? 1 : 0,
        orderIndex: subtopic.orderIndex,
        estimatedMinutes: subtopic.estimatedMinutes,
        strengthIndex: sm?.strengthIndex || 0,
        lastPracticed: lastPracticedDate?.toISOString() || null,
      };
    });

    const topicLastPracticedDate = lastAttemptMap.get(topic.id);
    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      mastery,
      weightage,
      orderIndex: topic.orderIndex,
      estimatedMinutes: topic.estimatedMinutes,
      totalAttempts,
      masteredCount: mastery >= MASTERY_THRESHOLDS.EXCELLENT ? 1 : 0,
      strengthIndex,
      lastPracticed: topicLastPracticedDate?.toISOString() || null,
      subtopics,
    };
  });

  const overallMastery = subjectData.subjectMastery[0]?.masteryLevel || 0;
  const comparator = sortComparators[sortBy as keyof typeof sortComparators] || sortComparators.index;
  const sortedTopics = processedTopics.slice().sort(comparator);

  const result: MasteryData = {
    subject: { id: subjectData.id, name: subjectData.name, examCode: userExamCode },
    overallMastery,
    topics: sortedTopics,
    userExamCode,
  };

  masteryCache.set(baseCacheKey, { data: { ...result, topics: processedTopics }, timestamp: Date.now() });

  if (masteryCache.size > 500) {
    const now = Date.now();
    for (const [key, value] of masteryCache) {
      if (now - value.timestamp > CACHE_TTL) {
        masteryCache.delete(key);
        if (masteryCache.size <= 400) break;
      }
    }
  }

  return result;
}
