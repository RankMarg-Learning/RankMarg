import { PrismaClient } from "@prisma/client";
import { QCategory, GradeEnum } from "@repo/db/enums";
import { getDifficultyDistributionByGrade } from "./SessionConfig";
import { SelectedQuestion, SessionConfig } from "../../types/session.api.types";
import { RedisCacheService } from "../redisCache.service";
import { captureServiceError } from "../../lib/sentry";

const DAILY_TEACHING_HOURS = 60 //minutes
const BUFFER_FACTOR = 0.75

export class QuestionSelector {
  private config: SessionConfig;
  private userId: string;
  private grade: GradeEnum;
  private prisma: PrismaClient;
  private attempts: { nDays: number; questionIds: string[] };

  constructor(prisma: PrismaClient, config: SessionConfig) {
    this.prisma = prisma;
    this.userId = config.userId;
    this.grade = config.grade;
    this.attempts = config.attempts;
    this.config = config;
  }

  async selectCurrentTopicQuestions(
    subjectId: string,
    count: number
  ): Promise<{ id: string; difficulty: number }[]> {
    try {
      const currentTopics = await this.getCurrentTopics(subjectId);

      if (currentTopics.length === 0) {
        console.log("No current topics found, falling back to medium mastery topics");
        return this.selectMediumMasteryQuestions(subjectId, count);
      }

      const subTopicIds = await this.getSubTopicIdsFromCurrentTopics(currentTopics);

      if (subTopicIds.length === 0) {
        return [];
      }

      return this.selectQuestionsFromTopics(subTopicIds, subjectId, count, true);
    } catch (error) {
      console.error("Error selecting current topic questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectCurrentTopicQuestions",
          userId: this.userId,
          additionalData: {
            subjectId,
            count,
          },
        });
      }
      return [];
    }
  }

  public async selectMediumMasteryQuestions(subjectId: string, count: number): Promise<{ id: string; difficulty: number }[]> {
    try {
      const mediumMasteryTopics = await this.prisma.topicMastery.findMany({
        where: {
          userId: this.userId,
          topic: { subjectId },
          masteryLevel: { gte: 40, lte: 60 },
        },
        select: { topicId: true },
        orderBy: { masteryLevel: "asc" },
        take: 3,
      });

      if (mediumMasteryTopics.length === 0) {
        return [];
      }

      const topicIds = mediumMasteryTopics.map((t) => t.topicId);
      return this.selectQuestionsFromTopics(topicIds, subjectId, count, false);
    } catch (error) {
      console.error("Error selecting medium mastery questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectMediumMasteryQuestions",
          userId: this.userId,
          additionalData: { subjectId, count },
        });
      }
      return [];
    }
  }

  public async selectWeakConceptQuestions(
    subjectId: string,
    count: number
  ): Promise<{ id: string; difficulty: number }[]> {
    try {
      const weakTopics = await this.prisma.topicMastery.findMany({
        where: {
          userId: this.userId,
          topic: { subjectId },
          masteryLevel: { gte: 10, lte: 40 },
        },
        select: { topicId: true },
        orderBy: { masteryLevel: "asc" },
        take: 1,
      });

      if (weakTopics.length === 0) {
        return [];
      }

      const topicIds = weakTopics.map((wt) => wt.topicId);
      return this.selectQuestionsFromTopics(topicIds, subjectId, count, false);
    } catch (error) {
      console.error("Error selecting weak concept questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectWeakConceptQuestions",
          userId: this.userId,
          additionalData: { subjectId, count },
        });
      }
      return [];
    }
  }

  async selectRevisionQuestions(
    subjectId: string,
    count: number
  ): Promise<{ id: string; difficulty: number }[]> {
    try {
      const completedTopics = await this.prisma.currentStudyTopic.findMany({
        where: {
          userId: this.userId,
          subjectId,
          isCompleted: true,
        },
        select: { topicId: true },
      });

      if (completedTopics.length === 0) {
        return [];
      }

      const reviewSchedules = await this.prisma.reviewSchedule.findMany({
        where: {
          userId: this.userId,
          topicId: { in: completedTopics.map((ct) => ct.topicId) },
          nextReviewAt: { lte: new Date() },
        },
        select: { topicId: true },
        orderBy: { nextReviewAt: "asc" },
        take: 1,
      });

      if (reviewSchedules.length === 0) {
        return [];
      }

      const topicIds = reviewSchedules.map((rs) => rs.topicId);
      return this.selectQuestionsFromTopics(topicIds, subjectId, count, false);
    } catch (error) {
      console.error("Error selecting revision questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectRevisionQuestions",
          userId: this.userId,
          additionalData: { subjectId, count },
        });
      }
      return [];
    }
  }

  private async getFallbackQuestions(
    subTopicIds: string[],
    subjectId: string,
    count: number,
    categories: QCategory[],
    excludeIds: Set<string> = new Set()
  ): Promise<SelectedQuestion[]> {
    try {
      const questionsWithAttempts = await this.prisma.question.findMany({
        where: {
          subtopicId: { in: subTopicIds },
          subjectId: subjectId,
          isPublished: true,
          id: {
            notIn: Array.from(
              new Set([...excludeIds, ...this.attempts.questionIds])
            ),
          },
          OR: [
            { category: { some: { category: { in: categories } } } },
            { category: { none: {} } },
          ],
        },
        include: {
          options: true,
          attempts: {
            where: {
              userId: this.userId,
            },
            orderBy: {
              solvedAt: "desc",
            },
            take: 1,
            select: {
              solvedAt: true,
            },
          },
        },
        take: count * 2,
      });

      const sortedQuestions = questionsWithAttempts.sort((a, b) => {
        const aLastAttempt = a.attempts[0]?.solvedAt;
        const bLastAttempt = b.attempts[0]?.solvedAt;

        if (!aLastAttempt && !bLastAttempt) return 0;
        if (!aLastAttempt) return -1;
        if (!bLastAttempt) return 1;

        return aLastAttempt.getTime() - bLastAttempt.getTime();
      });

      return sortedQuestions.slice(0, count);
    } catch (error) {
      console.error("Error getting fallback questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "getFallbackQuestions",
          userId: this.userId,
          additionalData: {
            subTopicIds: subTopicIds.length,
            subjectId,
            count,
          },
        });
      }
      return [];
    }
  }


  private async getCurrentTopics(
    subjectId: string
  ): Promise<{ topicId: string; startedAt: Date }[]> {
    const cachedTopics = await RedisCacheService.getCachedCurrentTopics(
      this.userId,
      subjectId
    );

    if (cachedTopics) {
      return cachedTopics.map((topic) => ({
        ...topic,
        startedAt: new Date(topic.startedAt),
      }));
    }

    const currentTopics = await this.prisma.currentStudyTopic.findMany({
      where: {
        userId: this.userId,
        subjectId,
        isCurrent: true,
        isCompleted: false,
      },
      select: {
        topicId: true,
        startedAt: true,
      },
    });

    await RedisCacheService.cacheCurrentTopics(
      this.userId,
      subjectId,
      currentTopics
    );

    return currentTopics;
  }


  private async getSubTopicIdsFromCurrentTopics(
    currentTopics: { topicId: string; startedAt: Date }[]
  ): Promise<string[]> {
    const availableTimeMinutes = DAILY_TEACHING_HOURS * BUFFER_FACTOR;
    const topicIds = currentTopics.map((t) => t.topicId);

    const allSubTopics = await this.prisma.subTopic.findMany({
      where: { topicId: { in: topicIds } },
      select: {
        id: true,
        topicId: true,
        estimatedMinutes: true,
      },
      orderBy: { orderIndex: "asc" },
    });

    const subTopicsByTopic = new Map<string, typeof allSubTopics>();
    for (const subTopic of allSubTopics) {
      const list = subTopicsByTopic.get(subTopic.topicId) || [];
      list.push(subTopic);
      subTopicsByTopic.set(subTopic.topicId, list);
    }

    const subTopicIds: string[] = [];
    const now = Date.now();

    for (const topic of currentTopics) {
      const timeSpentDays = (now - topic.startedAt.getTime()) / (1000 * 60 * 60 * 24);
      const targetTime = timeSpentDays * availableTimeMinutes;
      const subTopics = subTopicsByTopic.get(topic.topicId) || [];

      let accumulatedTime = 0;
      for (const subTopic of subTopics) {
        if (accumulatedTime >= targetTime || subTopic.estimatedMinutes > availableTimeMinutes) {
          break;
        }
        subTopicIds.push(subTopic.id);
        accumulatedTime += subTopic.estimatedMinutes;
      }
    }

    return subTopicIds;
  }


  private async selectQuestionsFromTopics(
    topicIds: string[],
    subjectId: string,
    count: number,
    useSubtopicId: boolean
  ): Promise<{ id: string; difficulty: number }[]> {
    const { difficulty: difficultyDistribution, categories } =
      this.getSelectionParameters(count, subjectId);

    const baseWhere: any = {
      subjectId,
      isPublished: true,
      id: { notIn: this.attempts.questionIds },
    };

    if (useSubtopicId) {
      baseWhere.subtopicId = { in: topicIds };
    } else {
      baseWhere.topicId = { in: topicIds };
    }

    const categoryFilter = {
      OR: [
        { category: { some: { category: { in: categories } } } },
        { category: { none: {} } },
      ],
    };

    const allQuestions = await this.prisma.question.findMany({
      where: {
        ...baseWhere,
        difficulty: { in: [1, 2, 3, 4] },
        ...categoryFilter,
      },
      select: { id: true, difficulty: true },
      take: count * 3,
    });

    const selectedQuestions = this.distributeQuestionsByDifficulty(
      allQuestions,
      difficultyDistribution
    );
    if (selectedQuestions.length < count) {
      const selectedIds = new Set(selectedQuestions.map((q) => q.id));
      const additionalQuestions = await this.prisma.question.findMany({
        where: {
          ...baseWhere,
          id: {
            notIn: [...this.attempts.questionIds, ...Array.from(selectedIds)],
          },
          ...categoryFilter,
        },
        select: { id: true, difficulty: true },
        take: count - selectedQuestions.length,
      });
      selectedQuestions.push(...additionalQuestions);
    }

    if (selectedQuestions.length < count) {
      const selectedIds = new Set(selectedQuestions.map((q) => q.id));
      const fallbackQuestions = await this.getFallbackQuestions(
        topicIds,
        subjectId,
        count - selectedQuestions.length,
        categories,
        selectedIds
      );
      selectedQuestions.push(...fallbackQuestions);
    }

    return selectedQuestions.slice(0, count);
  }

  private distributeQuestionsByDifficulty(
    questions: { id: string; difficulty: number }[],
    difficultyDistribution: number[]
  ): { id: string; difficulty: number }[] {
    const selected: { id: string; difficulty: number }[] = [];

    for (let difficulty = 1; difficulty <= 4; difficulty++) {
      const needed = difficultyDistribution[difficulty - 1];
      if (needed <= 0) continue;

      const questionsForDifficulty = questions.filter(
        (q) => q.difficulty === difficulty
      );
      selected.push(...questionsForDifficulty.slice(0, needed));
    }

    return selected;
  }

  private getSelectionParameters(count: number, subjectId: string): {
    difficulty: number[];
    categories: QCategory[];
  } {
    const { difficulty } = getDifficultyDistributionByGrade(
      this.grade,
      count,
      subjectId,
      this.config.examCode
    );
    const categories = this.config.questionCategoriesDistribution.grade as QCategory[];

    return { difficulty, categories };
  }

  public async getAttemptedQuestionIds(): Promise<void> {
    try {
      const { nDays } = this.attempts;
      const startDate = new Date(
        new Date().setDate(new Date().getDate() - nDays)
      );
      const endDate = new Date();
      const attemptedQuestionIds = await this.prisma.attempt.findMany({
        where: {
          userId: this.userId,
          solvedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        distinct: ["questionId"],
      });
      this.attempts.questionIds = attemptedQuestionIds.map((a) => a.questionId);
    } catch (error) {
      console.error("Error getting attempted question ids:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "getAttemptedQuestionIds",
          userId: this.userId,
          additionalData: {
            nDays: this.attempts.nDays,
          },
        });
      }
      this.attempts.questionIds = [];
    }
  }
}
