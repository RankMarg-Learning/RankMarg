import { masteryConfig, MasteryConfig } from "./MasteryConfig";
import { MasteryCalculator } from "./MasteryCalculator";
import prisma from "../../lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { AttemptsProcessor } from "./AttemptsProcessor";
import {
  MasteryAttempt,
  MasteryCalculationContext,
  HierarchicalMasteryData,
} from "../../types/mastery.api.types";
import { NotificationService } from "../notification.service";
import { captureServiceError } from "../../lib/sentry";

export interface MasteryResult {
  masteryLevel: number;
  strengthIndex: number;
  hasInsufficientData: boolean;
  totalAttempts: number;
  correctAttempts: number;
  confidenceLevel: number;
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

const BATCH_SIZE = 50;
const MASTERY_THRESHOLD = 70;

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
      const [userProfile, performanceTrend] = await Promise.all([
        this.attemptsProcessor.getUserProfile(userId),
        this.attemptsProcessor.getPerformanceTrend(userId, this.config.timeWindow),
      ]);

      const streamConfig = this.config.getExamConfig(examCode);

      const context: MasteryCalculationContext = {
        userProfile,
        performanceTrend,
        streamConfig,
        timeWindow: this.config.timeWindow,
        referenceDate,
      };

      const attempts = await this.attemptsProcessor.attempts(userId, cutoffDate);
      const { subtopicAttempts, subtopicIds, topicIds, subjectIds } =
        this.attemptsProcessor.organizeAttempts(attempts);

      if (subtopicIds.size > 0) {
        await this.calculateSubtopicMastery(userId, subtopicIds, subtopicAttempts, context);
      }

      if (topicIds.size > 0) {
        await this.updateTopicMasteries(userId, Array.from(topicIds), context);
      }

      if (subjectIds.size > 0) {
        await this.updateSubjectMasteries(userId, Array.from(subjectIds), context);

        try {
          const template = NotificationService.templates.masteryUpdated();
          await NotificationService.createAndDeliverToUser(
            userId,
            template.type,
            template.title,
            template.message
          );
        } catch { }
      }

      await this.updateMasteryHistory(userId, context);
    } catch (error) {
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "MasteryProcessor",
          method: "updateUserMastery",
          userId,
          additionalData: { examCode },
        });
      }
      throw error;
    }
  }

  public async calculateSubtopicMastery(
    userId: string,
    subtopicIds: Set<string>,
    subtopicAttempts: Map<string, MasteryAttempt[]>,
    context: MasteryCalculationContext
  ) {
    const subtopicIdArray = Array.from(subtopicIds);

    const [subtopicsWithTopics, existingMasteries] = await Promise.all([
      prisma.subTopic.findMany({
        where: { id: { in: subtopicIdArray } },
        select: { id: true, topicId: true },
      }),
      prisma.subtopicMastery.findMany({
        where: { userId, subtopicId: { in: subtopicIdArray } },
        select: {
          subtopicId: true,
          masteryLevel: true,
          strengthIndex: true,
          totalAttempts: true,
          correctAttempts: true,
        },
      }),
    ]);

    const subtopicToTopicMap = new Map(subtopicsWithTopics.map(s => [s.id, s.topicId]));
    const existingMasteriesMap = new Map(existingMasteries.map(m => [m.subtopicId, m]));

    const upsertData: Array<{
      subtopicId: string;
      topicId: string;
      masteryLevel: number;
      strengthIndex: number;
      totalAttempts: number;
      correctAttempts: number;
    }> = [];

    for (const subtopicId of subtopicIdArray) {
      const attempts = subtopicAttempts.get(subtopicId);
      if (!attempts || attempts.length === 0) continue;

      const topicId = subtopicToTopicMap.get(subtopicId);
      if (!topicId) continue;

      try {
        const enhancedMasteryData = this.masteryCalculator.calculateEnhancedMasteryData(attempts, context);
        const newMasteryLevel = this.masteryCalculator.calculateMasteryScore(enhancedMasteryData, context);

        let masteryLevel = newMasteryLevel;
        let strengthIndex = 0;
        let totalAttempts = enhancedMasteryData.totalAttempts;
        let correctAttempts = enhancedMasteryData.correctAttempts;

        const existingMastery = existingMasteriesMap.get(subtopicId);
        if (existingMastery) {
          masteryLevel = Math.round(existingMastery.masteryLevel * 0.6 + newMasteryLevel * 0.4);
          strengthIndex = Math.round(existingMastery.strengthIndex * 0.6);
          totalAttempts += existingMastery.totalAttempts;
          correctAttempts += existingMastery.correctAttempts;
        }

        upsertData.push({ subtopicId, topicId, masteryLevel, strengthIndex, totalAttempts, correctAttempts });
      } catch (error) {
        if (error instanceof Error) {
          captureServiceError(error, {
            service: "MasteryProcessor",
            method: "calculateSubtopicMastery",
            userId,
            additionalData: { subtopicId, attemptsCount: attempts.length },
          });
        }
      }
    }

    for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
      const batch = upsertData.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(data =>
          prisma.subtopicMastery.upsert({
            where: { userId_subtopicId: { userId, subtopicId: data.subtopicId } },
            create: { userId, ...data },
            update: {
              masteryLevel: data.masteryLevel,
              strengthIndex: data.strengthIndex,
              totalAttempts: data.totalAttempts,
              correctAttempts: data.correctAttempts,
            },
          })
        )
      );
    }
  }

  public async updateTopicMasteries(
    userId: string,
    topicIds: string[],
    _context: MasteryCalculationContext
  ): Promise<TopicMasteryData[]> {
    const [subtopicMasteries, topics] = await Promise.all([
      prisma.subtopicMastery.findMany({
        where: { userId, topicId: { in: topicIds } },
        select: { subtopicId: true, masteryLevel: true, totalAttempts: true, correctAttempts: true },
      }),
      prisma.topic.findMany({
        where: { id: { in: topicIds } },
        select: {
          id: true,
          subTopics: { select: { id: true, weightage: true } },
        },
      }),
    ]);

    const topicMap = new Map(topics.map(t => [t.id, t]));
    const masteryBySubtopicId = new Map(subtopicMasteries.map(m => [m.subtopicId, m]));

    const results: TopicMasteryData[] = [];
    const upsertData: Array<{
      topicId: string;
      masteryLevel: number;
      strengthIndex: number;
      totalAttempts: number;
      correctAttempts: number;
    }> = [];

    for (const topicId of topicIds) {
      const topic = topicMap.get(topicId);
      if (!topic || topic.subTopics.length === 0) continue;

      let totalAttempts = 0;
      let correctAttempts = 0;
      let weightedMasterySum = 0;
      let totalWeight = 0;
      let masteredSubtopicCount = 0;
      let attemptedSubtopicCount = 0;

      for (const subtopic of topic.subTopics) {
        const mastery = masteryBySubtopicId.get(subtopic.id);
        const weight = subtopic.weightage || 1;
        totalWeight += weight;

        if (mastery) {
          totalAttempts += mastery.totalAttempts;
          correctAttempts += mastery.correctAttempts;
          weightedMasterySum += mastery.masteryLevel * weight;
          attemptedSubtopicCount++;
          if (mastery.masteryLevel >= MASTERY_THRESHOLD) masteredSubtopicCount++;
        }
      }

      const newMasteryLevel = totalWeight > 0
        ? Math.min(100, Math.round(weightedMasterySum / totalWeight) + 5)
        : 0;

      results.push({
        userId,
        topicId,
        masteryLevel: newMasteryLevel,
        strengthIndex: 0,
        totalAttempts,
        correctAttempts,
        subtopicCount: topic.subTopics.length,
        masteredSubtopicCount,
        lastPracticed: attemptedSubtopicCount > 0 ? new Date() : null,
      });

      upsertData.push({ topicId, masteryLevel: newMasteryLevel, strengthIndex: 0, totalAttempts, correctAttempts });
    }

    for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
      const batch = upsertData.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(data =>
          prisma.topicMastery.upsert({
            where: { userId_topicId: { userId, topicId: data.topicId } },
            create: { userId, ...data },
            update: data,
          })
        )
      );
    }

    return results;
  }

  public async updateSubjectMasteries(
    userId: string,
    subjectIds: string[],
    _context: MasteryCalculationContext
  ): Promise<SubjectMasteryData[]> {
    const [topicMasteries, subjects] = await Promise.all([
      prisma.topicMastery.findMany({
        where: { userId, topic: { subjectId: { in: subjectIds } } },
        select: {
          topicId: true,
          masteryLevel: true,
          totalAttempts: true,
          correctAttempts: true,
          topic: { select: { id: true, subjectId: true, weightage: true } },
        },
      }),
      prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, topics: { select: { id: true, weightage: true } } },
      }),
    ]);

    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const masteryByTopicId = new Map(topicMasteries.map(m => [m.topicId, m]));

    const results: SubjectMasteryData[] = [];
    const upsertData: Array<{
      subjectId: string;
      masteryLevel: number;
      totalAttempts: number;
      correctAttempts: number;
    }> = [];

    for (const subjectId of subjectIds) {
      const subject = subjectMap.get(subjectId);
      if (!subject || subject.topics.length === 0) continue;

      let totalAttempts = 0;
      let correctAttempts = 0;
      let weightedMasterySum = 0;
      let totalWeight = 0;
      let masteredTopicCount = 0;
      let attemptedTopicCount = 0;
      const attemptedMasteries: any[] = [];

      for (const topic of subject.topics) {
        const mastery = masteryByTopicId.get(topic.id);
        const weight = topic.weightage || 1;
        totalWeight += weight;

        if (mastery) {
          totalAttempts += mastery.totalAttempts;
          correctAttempts += mastery.correctAttempts;
          weightedMasterySum += mastery.masteryLevel * weight;
          attemptedTopicCount++;
          attemptedMasteries.push(mastery);
          if (mastery.masteryLevel >= MASTERY_THRESHOLD) masteredTopicCount++;
        }
      }

      const newMasteryLevel = totalWeight > 0
        ? Math.min(100, Math.round(weightedMasterySum / totalWeight) + 3)
        : 0;

      const overallConfidence = this.calculateSubjectConfidence(attemptedMasteries, _context);

      results.push({
        userId,
        subjectId,
        masteryLevel: newMasteryLevel,
        totalAttempts,
        correctAttempts,
        topicCount: subject.topics.length,
        masteredTopicCount,
        overallConfidence,
        lastPracticed: attemptedTopicCount > 0 ? new Date() : null,
      });

      upsertData.push({ subjectId, masteryLevel: newMasteryLevel, totalAttempts, correctAttempts });
    }

    for (let i = 0; i < upsertData.length; i += BATCH_SIZE) {
      const batch = upsertData.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(data =>
          prisma.subjectMastery.upsert({
            where: { userId_subjectId: { userId, subjectId: data.subjectId } },
            create: { userId, ...data },
            update: data,
          })
        )
      );
    }

    return results;
  }

  public async updateMasteryHistory(userId: string, _context: MasteryCalculationContext) {
    try {
      const recordedAt = new Date();

      const [subjectMasteries, topicMasteries] = await Promise.all([
        prisma.subjectMastery.findMany({
          where: { userId },
          select: { userId: true, subjectId: true, masteryLevel: true, totalAttempts: true, correctAttempts: true },
        }),
        prisma.topicMastery.findMany({
          where: { userId },
          select: {
            userId: true,
            masteryLevel: true,
            strengthIndex: true,
            totalAttempts: true,
            correctAttempts: true,
            topic: { select: { subjectId: true } },
          },
        }),
      ]);

      const historyRecords = [
        ...subjectMasteries.map(m => ({
          userId: m.userId,
          subjectId: m.subjectId,
          masteryLevel: m.masteryLevel,
          strengthIndex: 0,
          totalAttempts: m.totalAttempts,
          correctAttempts: m.correctAttempts,
          totalTimeSpent: 0,
          recordedAt,
        })),
        ...topicMasteries.map(m => ({
          userId: m.userId,
          subjectId: m.topic.subjectId,
          masteryLevel: m.masteryLevel,
          strengthIndex: m.strengthIndex,
          totalAttempts: m.totalAttempts,
          correctAttempts: m.correctAttempts,
          totalTimeSpent: 0,
          recordedAt,
        })),
      ];

      if (historyRecords.length > 0) {
        await prisma.masteryHistory.createMany({ data: historyRecords, skipDuplicates: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "MasteryProcessor",
          method: "updateMasteryHistory",
          userId,
        });
      }
    }
  }

  private calculateSubjectConfidence(masteries: any[], context: MasteryCalculationContext): number {
    if (masteries.length === 0) return 0;
    const avgStrengthIndex = masteries.reduce((sum, m) => sum + (m.strengthIndex || 0), 0) / masteries.length;
    const consistencyScore = context.performanceTrend.consistencyScore;
    return Math.min((avgStrengthIndex + consistencyScore * 50) / 2, 100);
  }

  public async getHierarchicalMastery(userId: string, subjectId?: string): Promise<HierarchicalMasteryData[]> {
    const whereClause: any = { userId };
    if (subjectId) whereClause.subjectId = subjectId;

    const subjectMasteries = await prisma.subjectMastery.findMany({
      where: whereClause,
      include: { subject: { select: { id: true, name: true } } },
    });

    if (subjectMasteries.length === 0) return [];

    const subjectIdsList = subjectMasteries.map(sm => sm.subjectId);

    const [topicMasteries, subtopicMasteries] = await Promise.all([
      prisma.topicMastery.findMany({
        where: { userId, topic: { subjectId: { in: subjectIdsList } } },
        include: { topic: { select: { id: true, name: true, weightage: true, subjectId: true } } },
      }),
      prisma.subtopicMastery.findMany({
        where: { userId, subtopic: { topic: { subjectId: { in: subjectIdsList } } } },
        include: { subtopic: { select: { id: true, name: true, topicId: true } } },
      }),
    ]);

    const topicsBySubject = new Map<string, typeof topicMasteries>();
    for (const tm of topicMasteries) {
      const sid = tm.topic.subjectId;
      if (!topicsBySubject.has(sid)) topicsBySubject.set(sid, []);
      topicsBySubject.get(sid)!.push(tm);
    }

    const subtopicsByTopic = new Map<string, typeof subtopicMasteries>();
    for (const sm of subtopicMasteries) {
      const tid = sm.subtopic.topicId;
      if (!subtopicsByTopic.has(tid)) subtopicsByTopic.set(tid, []);
      subtopicsByTopic.get(tid)!.push(sm);
    }

    const results: HierarchicalMasteryData[] = [];

    for (const subjectMastery of subjectMasteries) {
      const subjectTopics = topicsBySubject.get(subjectMastery.subjectId) || [];

      const topicData = subjectTopics.map(tm => {
        const topicSubtopics = subtopicsByTopic.get(tm.topicId) || [];
        return {
          id: tm.topicId,
          name: tm.topic.name,
          mastery: tm.masteryLevel,
          weightage: tm.topic.weightage,
          lastPracticed: new Date().toISOString(),
          subtopics: topicSubtopics.map(sm => ({
            id: sm.subtopicId,
            name: sm.subtopic.name,
            mastery: sm.masteryLevel,
            totalAttempts: sm.totalAttempts,
            masteredCount: sm.masteryLevel >= MASTERY_THRESHOLD ? 1 : 0,
            lastPracticed: new Date().toISOString(),
          })),
        };
      });

      const firstTopic = topicData[0];
      const firstSubtopic = firstTopic?.subtopics[0];

      results.push({
        subject: {
          id: subjectMastery.subjectId,
          name: subjectMastery.subject.name,
          masteryLevel: subjectMastery.masteryLevel,
          totalAttempts: subjectMastery.totalAttempts,
          correctAttempts: subjectMastery.correctAttempts,
          topicCount: topicData.length,
          masteredTopicCount: topicData.filter(t => t.mastery >= MASTERY_THRESHOLD).length,
          overallConfidence: 0,
        },
        topic: firstTopic
          ? {
            id: firstTopic.id,
            name: firstTopic.name,
            masteryLevel: firstTopic.mastery,
            strengthIndex: 0,
            totalAttempts: 0,
            correctAttempts: 0,
            subtopicCount: firstTopic.subtopics.length,
            masteredSubtopicCount: firstTopic.subtopics.filter(s => s.masteredCount > 0).length,
            weightage: firstTopic.weightage,
          }
          : { id: "", name: "", masteryLevel: 0, strengthIndex: 0, totalAttempts: 0, correctAttempts: 0, subtopicCount: 0, masteredSubtopicCount: 0, weightage: 0 },
        subtopic: firstSubtopic
          ? {
            id: firstSubtopic.id,
            name: firstSubtopic.name,
            masteryLevel: firstSubtopic.mastery,
            strengthIndex: 0,
            totalAttempts: firstSubtopic.totalAttempts,
            correctAttempts: 0,
            lastPracticed: new Date(),
            confidenceLevel: 0,
          }
          : { id: "", name: "", masteryLevel: 0, strengthIndex: 0, totalAttempts: 0, correctAttempts: 0, lastPracticed: null, confidenceLevel: 0 },
      });
    }

    return results;
  }
}
