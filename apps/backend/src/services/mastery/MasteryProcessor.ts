import { masteryConfig, MasteryConfig } from "./MasteryConfig";
import { MasteryCalculator } from "./MasteryCalculator";
import prisma from "../../lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { AttemptsProcessor } from "./AttemptsProcessor";
import {
  MasteryAttempt,
  MasteryCalculationContext,
  HierarchicalMasteryData,
  UserProfileData,
  PerformanceTrend,
} from "../../type/mastery.api.types";

export interface MasteryResult {
  masteryLevel: number;
  strengthIndex: number;
  hasInsufficientData: boolean;
  totalAttempts: number;
  correctAttempts: number;
  confidenceLevel: number;
}

interface SubtopicMasteryData {
  userId: string;
  subtopicId: string;
  topicId: string;
  masteryLevel: number;
  strengthIndex: number;
  totalAttempts: number;
  correctAttempts: number;
  confidenceLevel: number;
  lastPracticed: Date | null;
}

interface TopicMasteryData {
  userId: string;
  topicId: string;
  masteryLevel: number;
  strengthIndex: number;
  totalAttempts: number;
  correctAttempts: number;
  subtopicCount: number;
  masteredSubtopicCount: number;
  weightage: number;
  lastPracticed: Date | null;
}

interface SubjectMasteryData {
  userId: string;
  subjectId: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  topicCount: number;
  masteredTopicCount: number;
  overallConfidence: number;
  lastPracticed: Date | null;
}

export class MasteryProcessor {
  private config: MasteryConfig;
  private masteryCalculator: MasteryCalculator;
  private attemptsProcessor: AttemptsProcessor;

  constructor() {
    this.config = masteryConfig;
    this.attemptsProcessor = new AttemptsProcessor();
    this.masteryCalculator = new MasteryCalculator(this.config);
  }

  public async updateUserMastery(userId: string, examCode: string) {
    this.config.examCode = examCode;
    const cutoffDate = startOfDay(subDays(new Date(), this.config.timeWindow));
    const referenceDate = new Date();

    try {
      // Get user profile and performance data
      const userProfile = await this.attemptsProcessor.getUserProfile(userId);
      const performanceTrend = await this.attemptsProcessor.getPerformanceTrend(
        userId,
        this.config.timeWindow
      );
      const streamConfig = this.config.getExamConfig(examCode);

      // Create calculation context
      const context: MasteryCalculationContext = {
        userProfile,
        performanceTrend,
        streamConfig,
        timeWindow: this.config.timeWindow,
        referenceDate,
      };

      // Get attempts and organize them
      const attempts = await this.attemptsProcessor.attempts(
        userId,
        cutoffDate
      );
      const {
        subtopicAttempts,
        topicAttempts,
        subjectAttempts,
        subtopicIds,
        topicIds,
        subjectIds,
      } = this.attemptsProcessor.organizeAttempts(attempts);

      // Process subtopic masteries
      if (subtopicIds.size > 0) {
        await this.calculateSubtopicMastery(
          userId,
          subtopicIds,
          subtopicAttempts,
          context
        );
      }

      // Process topic masteries (including questions without subtopicId)
      const allTopicIds = new Set([...topicIds, ...subtopicIds]);
      if (allTopicIds.size > 0) {
        await this.updateTopicMasteries(
          userId,
          Array.from(allTopicIds),
          context
        );
      }

      // Process subject masteries
      const allSubjectIds = new Set([...subjectIds, ...topicIds]);
      if (allSubjectIds.size > 0) {
        await this.updateSubjectMasteries(
          userId,
          Array.from(allSubjectIds),
          context
        );
      }

      // Update mastery history
      await this.updateMasteryHistory(userId, context);

      console.log(`Successfully updated mastery for user ${userId}`);
    } catch (error) {
      console.error(`Error updating mastery for user ${userId}:`, error);
      throw error;
    }
  }

  public async calculateSubtopicMastery(
    userId: string,
    subtopicIds: Set<string>,
    subtopicAttempts: Map<string, MasteryAttempt[]>,
    context: MasteryCalculationContext
  ) {
    const subtopicsWithTopics = await prisma.subTopic.findMany({
      where: { id: { in: Array.from(subtopicIds) } },
      select: {
        id: true,
        name: true,
        topicId: true,
        topic: {
          select: {
            id: true,
            name: true,
            weightage: true,
          },
        },
      },
    });

    const subtopicToTopicMap = new Map(
      subtopicsWithTopics.map((subtopic) => [subtopic.id, subtopic.topicId])
    );

    const existingMasteries = await prisma.subtopicMastery.findMany({
      where: {
        userId,
        subtopicId: { in: Array.from(subtopicIds) },
      },
      select: {
        subtopicId: true,
        masteryLevel: true,
        strengthIndex: true,
        totalAttempts: true,
        correctAttempts: true,
      },
    });

    const existingMasteriesMap = new Map(
      existingMasteries.map((m) => [m.subtopicId, m])
    );

    const upsertOperations: Promise<any>[] = [];

    for (const subtopicId of Array.from(subtopicIds)) {
      const attempts = subtopicAttempts.get(subtopicId) || [];

      if (attempts.length === 0) continue;

      const topicId = subtopicToTopicMap.get(subtopicId);
      if (!topicId) continue;

      try {
        const enhancedMasteryData =
          this.masteryCalculator.calculateEnhancedMasteryData(
            attempts,
            context
          );
        const newMasteryLevel = this.masteryCalculator.calculateMasteryScore(
          enhancedMasteryData,
          context
        );
        const newStrengthIndex = this.masteryCalculator.calculateStrengthIndex(
          {
            totalAttempts: enhancedMasteryData.totalAttempts,
            correctAttempts: enhancedMasteryData.correctAttempts,
            streak: enhancedMasteryData.streak,
            lastCorrectDate: enhancedMasteryData.lastCorrectDate,
            avgTime: enhancedMasteryData.avgTime,
          },
          context
        );

        let masteryLevel = newMasteryLevel;
        let strengthIndex = newStrengthIndex;

        const existingMastery = existingMasteriesMap.get(subtopicId);

        if (existingMastery) {
          // Adaptive weighting based on user's learning pattern
          const oldWeight = 0.6;
          const newWeight = 0.4;

          masteryLevel = Math.round(
            existingMastery.masteryLevel * oldWeight +
              newMasteryLevel * newWeight
          );
          strengthIndex = Math.round(
            existingMastery.strengthIndex * oldWeight +
              newStrengthIndex * newWeight
          );
        }

        const confidenceLevel = this.calculateConfidenceLevel(
          enhancedMasteryData,
          context
        );
        const lastPracticed = attempts[0]?.solvedAt || null;

        upsertOperations.push(
          prisma.subtopicMastery.upsert({
            where: { userId_subtopicId: { userId, subtopicId } },
            create: {
              userId,
              subtopicId,
              topicId,
              masteryLevel,
              strengthIndex,
              totalAttempts: enhancedMasteryData.totalAttempts,
              correctAttempts: enhancedMasteryData.correctAttempts,
            },
            update: {
              masteryLevel,
              strengthIndex,
              totalAttempts: existingMastery
                ? existingMastery.totalAttempts +
                  enhancedMasteryData.totalAttempts
                : enhancedMasteryData.totalAttempts,
              correctAttempts: existingMastery
                ? existingMastery.correctAttempts +
                  enhancedMasteryData.correctAttempts
                : enhancedMasteryData.correctAttempts,
            },
          })
        );
      } catch (error) {
        console.error(
          `Error processing subtopic ${subtopicId} for user ${userId}:`,
          error
        );
      }
    }

    // Batch process operations
    const batchSize = 10;
    for (let i = 0; i < upsertOperations.length; i += batchSize) {
      const batch = upsertOperations.slice(i, i + batchSize);
      await Promise.all(batch);
    }
  }

  public async updateTopicMasteries(
    userId: string,
    topicIds: string[],
    context: MasteryCalculationContext
  ): Promise<TopicMasteryData[]> {
    const results: TopicMasteryData[] = [];

    // Get all subtopic masteries for these topics
    const subtopicMasteries = await prisma.subtopicMastery.findMany({
      where: {
        userId,
        topicId: { in: topicIds },
      },
      include: {
        subtopic: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get topic information
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: {
        id: true,
        name: true,
        weightage: true,
        subTopics: {
          select: {
            id: true,
          },
        },
      },
    });

    const topicMap = new Map(topics.map((t) => [t.id, t]));
    const masteryByTopic = subtopicMasteries.reduce(
      (acc, mastery) => {
        if (!acc[mastery.topicId]) acc[mastery.topicId] = [];
        acc[mastery.topicId].push(mastery);
        return acc;
      },
      {} as Record<string, typeof subtopicMasteries>
    );

    const existingTopicMasteries = await prisma.topicMastery.findMany({
      where: {
        userId,
        topicId: { in: topicIds },
      },
    });

    const existingTopicMap = new Map(
      existingTopicMasteries.map((tm) => [tm.topicId, tm])
    );

    const upsertOperations: Promise<any>[] = [];

    for (const topicId of topicIds) {
      const masteries = masteryByTopic[topicId] || [];
      const topic = topicMap.get(topicId);

      if (!topic) continue;

      if (masteries.length === 0) {
        console.log(
          `No subtopic mastery data found for topic ${topicId} and user ${userId}`
        );
        continue;
      }

      const totalAttempts = masteries.reduce(
        (sum, m) => sum + m.totalAttempts,
        0
      );
      const correctAttempts = masteries.reduce(
        (sum, m) => sum + m.correctAttempts,
        0
      );

      // Calculate weighted mastery level
      let weightedMasterySum = 0;
      let weightSum = 0;
      let strengthIndexSum = 0;

      for (const m of masteries) {
        const weight = Math.max(1, m.totalAttempts);
        weightedMasterySum += m.masteryLevel * weight;
        strengthIndexSum += m.strengthIndex;
        weightSum += weight;
      }

      const newMasteryLevel =
        weightSum > 0 ? Math.round(weightedMasterySum / weightSum) : 0;
      const avgStrengthIndex =
        masteries.length > 0 ? strengthIndexSum / masteries.length : 0;

      // Count mastered subtopics
      const masteredSubtopicCount = masteries.filter(
        (m) => m.masteryLevel >= 70
      ).length;
      const subtopicCount = topic.subTopics.length;

      const topicMasteryData: TopicMasteryData = {
        userId,
        topicId,
        masteryLevel: newMasteryLevel,
        strengthIndex: avgStrengthIndex,
        totalAttempts,
        correctAttempts,
        subtopicCount,
        masteredSubtopicCount,
        weightage: topic.weightage,
        lastPracticed:
          masteries.length > 0
            ? masteries[0].subtopic?.name
              ? new Date()
              : null
            : null,
      };

      results.push(topicMasteryData);

      upsertOperations.push(
        prisma.topicMastery.upsert({
          where: { userId_topicId: { userId, topicId } },
          create: {
            userId,
            topicId,
            masteryLevel: newMasteryLevel,
            strengthIndex: avgStrengthIndex,
            totalAttempts,
            correctAttempts,
          },
          update: {
            masteryLevel: newMasteryLevel,
            strengthIndex: avgStrengthIndex,
            totalAttempts,
            correctAttempts,
          },
        })
      );
    }

    // Batch process operations
    const batchSize = 10;
    for (let i = 0; i < upsertOperations.length; i += batchSize) {
      const batch = upsertOperations.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    return results;
  }

  public async updateSubjectMasteries(
    userId: string,
    subjectIds: string[],
    context: MasteryCalculationContext
  ): Promise<SubjectMasteryData[]> {
    const results: SubjectMasteryData[] = [];

    // Get all topic masteries for these subjects
    const topicMasteries = await prisma.topicMastery.findMany({
      where: {
        userId,
        topic: {
          subjectId: { in: subjectIds },
        },
      },
      include: {
        topic: {
          select: {
            subjectId: true,
            weightage: true,
          },
        },
      },
    });

    // Get subject information
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: {
        id: true,
        name: true,
        topics: {
          select: {
            id: true,
          },
        },
      },
    });

    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const masteryBySubject = topicMasteries.reduce(
      (acc, mastery) => {
        const subjectId = mastery.topic.subjectId;
        if (!acc[subjectId]) acc[subjectId] = [];
        acc[subjectId].push(mastery);
        return acc;
      },
      {} as Record<string, typeof topicMasteries>
    );

    const upsertOperations: Promise<any>[] = [];

    for (const subjectId of subjectIds) {
      const masteries = masteryBySubject[subjectId] || [];
      const subject = subjectMap.get(subjectId);

      if (!subject) continue;

      if (masteries.length === 0) {
        console.log(
          `No topic mastery data found for subject ${subjectId} and user ${userId}`
        );
        continue;
      }

      const totalAttempts = masteries.reduce(
        (sum, m) => sum + m.totalAttempts,
        0
      );
      const correctAttempts = masteries.reduce(
        (sum, m) => sum + m.correctAttempts,
        0
      );

      // Calculate weighted mastery level considering topic weightage
      let weightedMasterySum = 0;
      let weightSum = 0;

      for (const m of masteries) {
        const weight = Math.max(1, m.totalAttempts) * (m.topic.weightage || 1);
        weightedMasterySum += m.masteryLevel * weight;
        weightSum += weight;
      }

      const newMasteryLevel =
        weightSum > 0 ? Math.round(weightedMasterySum / weightSum) : 0;

      // Count mastered topics
      const masteredTopicCount = masteries.filter(
        (m) => m.masteryLevel >= 70
      ).length;
      const topicCount = subject.topics.length;

      // Calculate overall confidence
      const overallConfidence = this.calculateSubjectConfidence(
        masteries,
        context
      );

      const subjectMasteryData: SubjectMasteryData = {
        userId,
        subjectId,
        masteryLevel: newMasteryLevel,
        totalAttempts,
        correctAttempts,
        topicCount,
        masteredTopicCount,
        overallConfidence,
        lastPracticed: masteries.length > 0 ? new Date() : null,
      };

      results.push(subjectMasteryData);

      upsertOperations.push(
        prisma.subjectMastery.upsert({
          where: { userId_subjectId: { userId, subjectId } },
          create: {
            userId,
            subjectId,
            masteryLevel: newMasteryLevel,
            totalAttempts,
            correctAttempts,
          },
          update: {
            masteryLevel: newMasteryLevel,
            totalAttempts,
            correctAttempts,
          },
        })
      );
    }

    // Batch process operations
    const batchSize = 10;
    for (let i = 0; i < upsertOperations.length; i += batchSize) {
      const batch = upsertOperations.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    return results;
  }

  private calculateConfidenceLevel(
    masteryData: any,
    context: MasteryCalculationContext
  ): number {
    const { userProfile, performanceTrend } = context;

    // Base confidence from mastery level
    let confidence =
      masteryData.totalAttempts > 0
        ? (masteryData.correctAttempts / masteryData.totalAttempts) * 50
        : 0;

    // Add confidence based on consistency
    confidence += performanceTrend.consistencyScore * 20;

    // Add confidence based on user engagement
    if (userProfile.studyHoursPerDay && userProfile.studyHoursPerDay >= 2) {
      confidence += 10;
    }

    // Add confidence based on recent performance
    if (performanceTrend.recentAccuracy > 0.8) {
      confidence += 10;
    }

    // Add confidence based on forgetting curve
    confidence += masteryData.forgettingCurveFactor * 10;

    return Math.min(confidence, 100);
  }

  private calculateSubjectConfidence(
    masteries: any[],
    context: MasteryCalculationContext
  ): number {
    if (masteries.length === 0) return 0;

    const avgStrengthIndex =
      masteries.reduce((sum, m) => sum + m.strengthIndex, 0) / masteries.length;
    const consistencyScore = context.performanceTrend.consistencyScore;

    return Math.min((avgStrengthIndex + consistencyScore * 50) / 2, 100);
  }

  public async updateMasteryHistory(
    userId: string,
    context: MasteryCalculationContext
  ) {
    try {
      const subjectMasteries = await prisma.subjectMastery.findMany({
        where: { userId },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const topicMasteries = await prisma.topicMastery.findMany({
        where: { userId },
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              subjectId: true,
            },
          },
        },
      });

      const historyRecords = [];

      // Create subject mastery history
      for (const mastery of subjectMasteries) {
        historyRecords.push({
          userId: mastery.userId,
          subjectId: mastery.subjectId,
          masteryLevel: mastery.masteryLevel,
          strengthIndex: 0, // Subjects don't have strength index
          totalAttempts: mastery.totalAttempts,
          correctAttempts: mastery.correctAttempts,
          totalTimeSpent: 0, // Calculate if needed
          recordedAt: new Date(),
        });
      }

      // Create topic mastery history (as subject-level records)
      for (const mastery of topicMasteries) {
        historyRecords.push({
          userId: mastery.userId,
          subjectId: mastery.topic.subjectId,
          masteryLevel: mastery.masteryLevel,
          strengthIndex: mastery.strengthIndex,
          totalAttempts: mastery.totalAttempts,
          correctAttempts: mastery.correctAttempts,
          totalTimeSpent: 0, // Calculate if needed
          recordedAt: new Date(),
        });
      }

      if (historyRecords.length > 0) {
        await prisma.masteryHistory.createMany({
          data: historyRecords,
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error(
        `Error updating mastery history for user ${userId}:`,
        error
      );
    }
  }

  public async getHierarchicalMastery(
    userId: string,
    subjectId?: string
  ): Promise<HierarchicalMasteryData[]> {
    const whereClause: any = { userId };
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const subjectMasteries = await prisma.subjectMastery.findMany({
      where: whereClause,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const results: HierarchicalMasteryData[] = [];

    for (const subjectMastery of subjectMasteries) {
      const topicMasteries = await prisma.topicMastery.findMany({
        where: {
          userId,
          topic: {
            subjectId: subjectMastery.subjectId,
          },
        },
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              weightage: true,
            },
          },
        },
      });

      const topicData = [];

      for (const topicMastery of topicMasteries) {
        const subtopicMasteries = await prisma.subtopicMastery.findMany({
          where: {
            userId,
            topicId: topicMastery.topicId,
          },
          include: {
            subtopic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const subtopicData = subtopicMasteries.map((sm) => ({
          id: sm.subtopicId,
          name: sm.subtopic.name,
          mastery: sm.masteryLevel,
          totalAttempts: sm.totalAttempts,
          masteredCount: sm.masteryLevel >= 70 ? 1 : 0,
          lastPracticed: sm.subtopic.name ? new Date().toISOString() : null,
        }));

        topicData.push({
          id: topicMastery.topicId,
          name: topicMastery.topic.name,
          mastery: topicMastery.masteryLevel,
          weightage: topicMastery.topic.weightage,
          lastPracticed: new Date().toISOString(),
          subtopics: subtopicData,
        });
      }

      results.push({
        subject: {
          id: subjectMastery.subjectId,
          name: subjectMastery.subject.name,
          masteryLevel: subjectMastery.masteryLevel,
          totalAttempts: subjectMastery.totalAttempts,
          correctAttempts: subjectMastery.correctAttempts,
          topicCount: topicData.length,
          masteredTopicCount: topicData.filter((t) => t.mastery >= 70).length,
          overallConfidence: 0, // Calculate if needed
        },
        topic: topicData[0]
          ? {
              id: topicData[0].id,
              name: topicData[0].name,
              masteryLevel: topicData[0].mastery,
              strengthIndex: 0,
              totalAttempts: 0,
              correctAttempts: 0,
              subtopicCount: topicData[0].subtopics.length,
              masteredSubtopicCount: topicData[0].subtopics.filter(
                (s) => s.masteredCount > 0
              ).length,
              weightage: topicData[0].weightage,
            }
          : {
              id: "",
              name: "",
              masteryLevel: 0,
              strengthIndex: 0,
              totalAttempts: 0,
              correctAttempts: 0,
              subtopicCount: 0,
              masteredSubtopicCount: 0,
              weightage: 0,
            },
        subtopic: topicData[0]?.subtopics[0]
          ? {
              id: topicData[0].subtopics[0].id,
              name: topicData[0].subtopics[0].name,
              masteryLevel: topicData[0].subtopics[0].mastery,
              strengthIndex: 0,
              totalAttempts: topicData[0].subtopics[0].totalAttempts,
              correctAttempts: 0,
              lastPracticed: topicData[0].subtopics[0].lastPracticed
                ? new Date(topicData[0].subtopics[0].lastPracticed)
                : null,
              confidenceLevel: 0,
            }
          : {
              id: "",
              name: "",
              masteryLevel: 0,
              strengthIndex: 0,
              totalAttempts: 0,
              correctAttempts: 0,
              lastPracticed: null,
              confidenceLevel: 0,
            },
      });
    }

    return results;
  }

  public async oldMasterySubTopic(
    userId: string,
    subtopicId: string
  ): Promise<{ masteryLevel: number; strengthIndex: number }> {
    const result = await prisma.subtopicMastery.findUnique({
      where: { userId_subtopicId: { userId, subtopicId } },
      select: { masteryLevel: true, strengthIndex: true },
    });

    return result ?? { masteryLevel: 0, strengthIndex: 0 };
  }
}
