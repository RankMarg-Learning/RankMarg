import { masteryConfig, MasteryConfig } from "./MasteryConfig";
import { MasteryCalculator } from "../../services/mastery/MasteryCalculator";
import prisma from "../../lib/prisma";
import { startOfDay, subDays } from "date-fns";
import { AttemptsProcessor } from "./AttemptsProcessor";
import { Stream } from "@prisma/client";
import { MasteryAttempt } from "../../type/mastery.api.types";

export interface MasteryResult {
  masteryLevel: number;
  strengthIndex: number;
  hasInsufficientData: boolean;
  totalAttempts: number;
  correctAttempts: number;
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
  public async updateUserMastery(userId: string, stream: Stream) {
    this.config.stream = stream;

    const cutoffDate = startOfDay(subDays(new Date(), this.config.timeWindow));

    try {
      const attempts = await this.attemptsProcessor.attempts(
        userId,
        cutoffDate
      );

      const { subtopicAttempts, subtopicIds } =
        this.attemptsProcessor.organizeAttempts(attempts);

      if (subtopicIds.size > 0) {
        await this.calculateSubtopicMastery(
          userId,
          subtopicIds,
          subtopicAttempts,
          this.masteryCalculator
        );
      }

      const subtopicMasteries = await prisma.subtopicMastery.findMany({
        where: { userId },
        select: { subtopicId: true },
      });

      const subtopicIdList = subtopicMasteries.map((sm) => sm.subtopicId);

      await this.updateMasteryTopicAndSubject(
        userId,
        Array.from(subtopicIdList)
      );
    } catch (error) {
      console.error(`Error updating mastery for user ${userId}:`, error);
      throw error;
    }
  }

  public async calculateSubtopicMastery(
    userId: string,
    subtopicIds: Set<string>,
    subtopicAttempts: Map<string, MasteryAttempt[]>,
    calculator: MasteryCalculator
  ) {
    const subtopicsWithTopics = await prisma.subTopic.findMany({
      where: {
        id: {
          in: Array.from(subtopicIds),
        },
      },
      select: {
        id: true,
        topicId: true,
      },
    });

    const subtopicToTopicMap = new Map(
      subtopicsWithTopics.map((subtopic) => [subtopic.id, subtopic.topicId])
    );

    for (const subtopicId of Array.from(subtopicIds)) {
      const attempts = subtopicAttempts.get(subtopicId) || [];

      if (attempts.length === 0) continue;

      const topicId = subtopicToTopicMap.get(subtopicId);

      if (!topicId) continue;

      const masteryData = calculator.calculateMasteryData(attempts);
      const newMasteryLevel = calculator.calculateMasteryScore(masteryData);
      const newStrengthIndex = calculator.calculateStrengthIndex({
        totalAttempts: masteryData.totalAttempts,
        correctAttempts: masteryData.correctAttempts,
        streak: masteryData.streak,
        lastCorrectDate: masteryData.lastCorrectDate,
        avgTime: masteryData.avgTime,
      });
      let strengthIndex = newStrengthIndex;

      let masteryLevel = newMasteryLevel;
      const existingMastery = await this.oldMasterySubTopic(userId, subtopicId);

      if (existingMastery) {
        const oldWeight = 0.7;
        const newWeight = 0.3;
        masteryLevel = Math.round(
          existingMastery.masteryLevel * oldWeight + newMasteryLevel * newWeight
        );
        strengthIndex = Math.round(
          existingMastery.strengthIndex * oldWeight +
            newStrengthIndex * newWeight
        );
      }

      await prisma.subtopicMastery.upsert({
        where: {
          userId_subtopicId: {
            userId,
            subtopicId,
          },
        },
        create: {
          userId,
          subtopicId,
          topicId,
          masteryLevel,
          strengthIndex,
          totalAttempts: masteryData.totalAttempts,
          correctAttempts: masteryData.correctAttempts,
        },
        update: {
          totalAttempts: { increment: masteryData.totalAttempts },
          correctAttempts: { increment: masteryData.correctAttempts },
          masteryLevel,
          strengthIndex,
        },
      });
    }
  }

  public async updateMasteryTopicAndSubject(
    userId: string,
    subtopicIds: string[]
  ) {
    return await prisma.$transaction(async (tx) => {
      const subtopics = await tx.subTopic.findMany({
        where: {
          id: {
            in: subtopicIds,
          },
        },
        select: {
          id: true,
          topicId: true,
          topic: {
            select: {
              id: true,
              subjectId: true,
            },
          },
        },
      });

      const uniqueTopicIds = new Set(subtopics.map((st) => st.topicId));
      const uniqueSubjectIds = new Set(
        subtopics.map((st) => st.topic.subjectId)
      );

      const updatedTopicMasteries = [];
      for (const topicId of Array.from(uniqueTopicIds)) {
        const updatedTopicMastery =
          await this.updateTopicMasteryFromExistingData(userId, topicId);
        if (updatedTopicMastery) {
          updatedTopicMasteries.push(updatedTopicMastery);
        }
      }

      const updatedSubjectMasteries = [];
      for (const subjectId of Array.from(uniqueSubjectIds)) {
        const updatedSubjectMastery =
          await this.updateSubjectMasteryFromExistingData(userId, subjectId);
        if (updatedSubjectMastery) {
          updatedSubjectMasteries.push(updatedSubjectMastery);
        }
      }

      // Only update mastery history if there are valid subject masteries
      if (updatedSubjectMasteries.length > 0) {
        await this.updateMasteryHistroy(updatedSubjectMasteries);
      }

      return {
        topics: Array.from(uniqueTopicIds),
        subjects: Array.from(uniqueSubjectIds),
        updatedTopicMasteries,
        updatedSubjectMasteries,
      };
    });
  }

  public async updateMasteryHistroy(updatedSubjectMasteries: any[]) {
    // Filter out null values and ensure we have valid mastery objects
    const validMasteries = updatedSubjectMasteries.filter(
      (mastery) => mastery && mastery.userId && mastery.subjectId
    );

    if (validMasteries.length === 0) {
      console.log("No valid subject masteries to record in history");
      return;
    }

    const subjectMasteryHistory = validMasteries.map((mastery) => ({
      userId: mastery.userId,
      subjectId: mastery.subjectId,
      masteryLevel: mastery.masteryLevel,
      totalAttempts: mastery.totalAttempts,
      correctAttempts: mastery.correctAttempts,
    }));

    await prisma.masteryHistory.createMany({
      data: subjectMasteryHistory,
    });
  }

  public async updateSubjectMasteryFromExistingData(
    userId: string,
    subjectId: string
  ) {
    const updateFunction = async () => {
      const topicMasteries = await prisma.topicMastery.findMany({
        where: {
          userId,
          topic: {
            subjectId,
          },
        },
      });

      if (topicMasteries.length === 0) {
        console.log(
          `No topic mastery data found for subject ${subjectId} and user ${userId}`
        );
        return null;
      }

      const totalAttempts = topicMasteries.reduce(
        (sum: number, m: { totalAttempts: number }) => sum + m.totalAttempts,
        0
      );
      const correctAttempts = topicMasteries.reduce(
        (sum: number, m: { correctAttempts: number }) =>
          sum + m.correctAttempts,
        0
      );

      let weightedMasterySum = 0;
      let weightSum = 0;

      for (const m of topicMasteries) {
        const weight = Math.max(1, m.totalAttempts);
        weightedMasterySum += m.masteryLevel * weight;
        weightSum += weight;
      }

      const newMasteryLevel =
        weightSum > 0 ? Math.round(weightedMasterySum / weightSum) : 0;

      let subjectMastery = await prisma.subjectMastery.findUnique({
        where: {
          userId_subjectId: {
            userId,
            subjectId,
          },
        },
      });

      if (!subjectMastery) {
        subjectMastery = await prisma.subjectMastery.create({
          data: {
            userId,
            subjectId,
            masteryLevel: newMasteryLevel,
            totalAttempts,
            correctAttempts,
          },
        });
      } else {
        subjectMastery = await prisma.subjectMastery.update({
          where: {
            id: subjectMastery.id,
          },
          data: {
            masteryLevel: newMasteryLevel,
            totalAttempts,
            correctAttempts,
          },
        });
      }

      return subjectMastery;
    };
    return await prisma.$transaction(updateFunction);
  }

  public async updateTopicMasteryFromExistingData(
    userId: string,
    topicId: string
  ) {
    const updateFunction = async () => {
      const subtopicMasteries = await prisma.subtopicMastery.findMany({
        where: {
          userId,
          topicId,
        },
      });

      if (subtopicMasteries.length === 0) {
        console.log(
          `No subtopic mastery data found for topic ${topicId} and user ${userId}`
        );
        return null;
      }

      const totalAttempts = subtopicMasteries.reduce(
        (sum: number, m: { totalAttempts: number }) => sum + m.totalAttempts,
        0
      );
      const correctAttempts = subtopicMasteries.reduce(
        (sum: number, m: { correctAttempts: number }) =>
          sum + m.correctAttempts,
        0
      );
      const avgStrengthIndex =
        subtopicMasteries.reduce(
          (sum: number, m: { strengthIndex: number }) => sum + m.strengthIndex,
          0
        ) / subtopicMasteries.length;

      let weightedMasterySum = 0;
      let weightSum = 0;

      for (const m of subtopicMasteries) {
        const weight = Math.max(1, m.totalAttempts);
        weightedMasterySum += m.masteryLevel * weight;
        weightSum += weight;
      }

      const newMasteryLevel =
        weightSum > 0 ? Math.round(weightedMasterySum / weightSum) : 0;

      let topicMastery = await prisma.topicMastery.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
      });

      if (!topicMastery) {
        topicMastery = await prisma.topicMastery.create({
          data: {
            userId,
            topicId,
            masteryLevel: newMasteryLevel,
            strengthIndex: avgStrengthIndex,
            totalAttempts,
            correctAttempts,
          },
        });
      } else {
        topicMastery = await prisma.topicMastery.update({
          where: {
            id: topicMastery.id,
          },
          data: {
            masteryLevel: newMasteryLevel,
            strengthIndex: avgStrengthIndex,
            totalAttempts,
            correctAttempts,
          },
        });
      }

      return topicMastery;
    };

    return await prisma.$transaction(updateFunction);
  }

  public async oldMasterySubTopic(
    userId: string,
    subtopicId: string
  ): Promise<{ masteryLevel: number; strengthIndex: number }> {
    return (
      (await prisma.subtopicMastery.findUnique({
        where: {
          userId_subtopicId: {
            userId,
            subtopicId,
          },
        },
        select: {
          masteryLevel: true,
          strengthIndex: true,
        },
      })) ?? { masteryLevel: 0, strengthIndex: 0 }
    );
  }
}
