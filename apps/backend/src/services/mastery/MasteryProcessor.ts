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

export interface MasteryResult {
  masteryLevel: number;
  strengthIndex: number;
  hasInsufficientData: boolean;
  totalAttempts: number;
  correctAttempts: number;
  confidenceLevel: number;
}

// interface SubtopicMasteryData {
//   userId: string;
//   subtopicId: string;
//   topicId: string;
//   masteryLevel: number;
//   strengthIndex: number;
//   totalAttempts: number;
//   correctAttempts: number;
//   confidenceLevel: number;
//   lastPracticed: Date | null;
// }

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
      const userProfile = await this.attemptsProcessor.getUserProfile(userId);
      const performanceTrend = await this.attemptsProcessor.getPerformanceTrend(
        userId,
        this.config.timeWindow
      );
      const streamConfig = this.config.getExamConfig(examCode);

      const context: MasteryCalculationContext = {
        userProfile,
        performanceTrend,
        streamConfig,
        timeWindow: this.config.timeWindow,
        referenceDate,
      };

      const attempts = await this.attemptsProcessor.attempts(
        userId,
        cutoffDate
      );
      const {
        subtopicAttempts,
        // _topicAttempts,
        // _subjectAttempts,
        subtopicIds,
        topicIds,
        subjectIds,
      } = this.attemptsProcessor.organizeAttempts(attempts);

      if (subtopicIds.size > 0) {
        await this.calculateSubtopicMastery(
          userId,
          subtopicIds,
          subtopicAttempts,
          context
        );
      }

      const allTopicIds = new Set([...topicIds, ...subtopicIds]);
      if (allTopicIds.size > 0) {
        await this.updateTopicMasteries(
          userId,
          Array.from(allTopicIds),
          context
        );
      }

      const allSubjectIds = new Set([...subjectIds, ...topicIds]);
      if (allSubjectIds.size > 0) {
        await this.updateSubjectMasteries(
          userId,
          Array.from(allSubjectIds),
          context
        );

        // Send notification for mastery update
        try {
          // Get the highest mastery subject to notify about
          const subjectMasteries = await prisma.subjectMastery.findMany({
            where: { 
              userId,
              subjectId: { in: Array.from(allSubjectIds) }
            },
            include: {
              subject: { select: { name: true } }
            },
            orderBy: { masteryLevel: 'desc' },
            take: 1,
          });

          if (subjectMasteries.length > 0) {
            const topSubject = subjectMasteries[0];
            const masteryLevel = topSubject.masteryLevel.toFixed(1);
            const template = NotificationService.templates.masteryUpdated(
              topSubject.subject.name,
              masteryLevel
            );
            await NotificationService.createAndDeliverToUser(
              userId,
              template.type,
              template.title,
              template.message
            );
          }
        } catch (notificationError) {
          console.error("Error sending mastery notification:", notificationError);
        }
      }

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
        topicId: true,
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
        // const newStrengthIndex = this.masteryCalculator.calculateStrengthIndex(
        //   {
        //     totalAttempts: enhancedMasteryData.totalAttempts,
        //     correctAttempts: enhancedMasteryData.correctAttempts,
        //     streak: enhancedMasteryData.streak,
        //     lastCorrectDate: enhancedMasteryData.lastCorrectDate,
        //     avgTime: enhancedMasteryData.avgTime,
        //   },
        //   context
        // );

        let masteryLevel = newMasteryLevel;
        let strengthIndex = 0;

        const existingMastery = existingMasteriesMap.get(subtopicId);

        if (existingMastery) {
          const oldWeight = 0.6;
          const newWeight = 0.4;

          masteryLevel = Math.round(
            existingMastery.masteryLevel * oldWeight +
              newMasteryLevel * newWeight
          );
          strengthIndex = Math.round(
            existingMastery.strengthIndex * oldWeight +
              strengthIndex * newWeight
          );
        }

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

    const batchSize = 10;
    for (let i = 0; i < upsertOperations.length; i += batchSize) {
      const batch = upsertOperations.slice(i, i + batchSize);
      await Promise.all(batch);
    }
  }

  public async updateTopicMasteries(
    userId: string,
    topicIds: string[],
    _context: MasteryCalculationContext
  ): Promise<TopicMasteryData[]> {
    const results: TopicMasteryData[] = [];

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

    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: {
        id: true,
        name: true,
        weightage: true,
        subTopics: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const topicMap = new Map(topics.map((t) => [t.id, t]));

    const masteryBySubtopicId = new Map(
      subtopicMasteries.map((m) => [m.subtopicId, m])
    );

    const upsertOperations: Promise<any>[] = [];

    for (const topicId of topicIds) {
      const topic = topicMap.get(topicId);

      if (!topic) continue;

      const subtopicCount = topic.subTopics.length;

      if (subtopicCount === 0) {
        console.log(`No subtopics found for topic ${topicId}`);
        continue;
      }

      let totalAttempts = 0;
      let correctAttempts = 0;
      let masterySum = 0;
      let strengthIndexSum = 0;
      let masteredSubtopicCount = 0;
      let attemptedSubtopicCount = 0;

      for (const subtopic of topic.subTopics) {
        const mastery = masteryBySubtopicId.get(subtopic.id);

        if (mastery) {
          totalAttempts += mastery.totalAttempts;
          correctAttempts += mastery.correctAttempts;
          masterySum += mastery.masteryLevel;
          strengthIndexSum += mastery.strengthIndex;
          attemptedSubtopicCount++;

          if (mastery.masteryLevel >= 70) {
            masteredSubtopicCount++;
          }
        } else {
          masterySum += 0;
          strengthIndexSum += 0;
        }
      }

      const newMasteryLevel = Math.round(masterySum / subtopicCount);

      const avgStrengthIndex =
        attemptedSubtopicCount > 0
          ? strengthIndexSum / attemptedSubtopicCount
          : 0;

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
        lastPracticed: attemptedSubtopicCount > 0 ? new Date() : null,
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
    _context: MasteryCalculationContext
  ): Promise<SubjectMasteryData[]> {
    const results: SubjectMasteryData[] = [];

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
            id: true,
            subjectId: true,
            weightage: true,
          },
        },
      },
    });

    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: {
        id: true,
        name: true,
        topics: {
          select: {
            id: true,
            weightage: true,
          },
        },
      },
    });

    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    const masteryByTopicId = new Map(
      topicMasteries.map((m) => [m.topic.id, m])
    );

    const upsertOperations: Promise<any>[] = [];

    for (const subjectId of subjectIds) {
      const subject = subjectMap.get(subjectId);

      if (!subject) continue;

      const topicCount = subject.topics.length;

      if (topicCount === 0) {
        console.log(`No topics found for subject ${subjectId}`);
        continue;
      }

      let totalAttempts = 0;
      let correctAttempts = 0;
      let weightedMasterySum = 0;
      let totalWeight = 0;
      let masteredTopicCount = 0;
      let attemptedTopicCount = 0;

      // Process ALL topics (attempted and unattempted)
      for (const topic of subject.topics) {
        const mastery = masteryByTopicId.get(topic.id);
        const topicWeight = topic.weightage || 1;

        if (mastery) {
          // Topic has been attempted
          totalAttempts += mastery.totalAttempts;
          correctAttempts += mastery.correctAttempts;
          weightedMasterySum += mastery.masteryLevel * topicWeight;
          attemptedTopicCount++;

          if (mastery.masteryLevel >= 70) {
            masteredTopicCount++;
          }
        } else {
          weightedMasterySum += 0 * topicWeight;
        }

        totalWeight += topicWeight;
      }

      const newMasteryLevel =
        totalWeight > 0 ? Math.round(weightedMasterySum / totalWeight) : 0;

      const attemptedMasteries = topicMasteries.filter((m) =>
        subject.topics.some((t) => t.id === m.topic.id)
      );

      const overallConfidence = this.calculateSubjectConfidence(
        attemptedMasteries,
        _context
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
        lastPracticed: attemptedTopicCount > 0 ? new Date() : null,
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

    const batchSize = 10;
    for (let i = 0; i < upsertOperations.length; i += batchSize) {
      const batch = upsertOperations.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    return results;
  }

  // private calculateConfidenceLevel(
  //   masteryData: any,
  //   context: MasteryCalculationContext
  // ): number {
  //   const { userProfile, performanceTrend } = context;

  //   // Base confidence from mastery level
  //   let confidence =
  //     masteryData.totalAttempts > 0
  //       ? (masteryData.correctAttempts / masteryData.totalAttempts) * 50
  //       : 0;

  //   // Add confidence based on consistency
  //   confidence += performanceTrend.consistencyScore * 20;

  //   // Add confidence based on user engagement
  //   if (userProfile.studyHoursPerDay && userProfile.studyHoursPerDay >= 2) {
  //     confidence += 10;
  //   }

  //   // Add confidence based on recent performance
  //   if (performanceTrend.recentAccuracy > 0.8) {
  //     confidence += 10;
  //   }

  //   // Add confidence based on forgetting curve
  //   confidence += masteryData.forgettingCurveFactor * 10;

  //   return Math.min(confidence, 100);
  // }

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
    _context: MasteryCalculationContext
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
