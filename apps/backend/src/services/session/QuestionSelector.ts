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
      const cachedTopics = await RedisCacheService.getCachedCurrentTopics(
        this.userId,
        subjectId
      );

      let currentTopics: { topicId: string; startedAt: Date }[];
      if (cachedTopics) {
        currentTopics = cachedTopics;
      } else {
        currentTopics = await this.prisma.currentStudyTopic.findMany({
          where: {
            userId: this.userId,
            subjectId: subjectId,
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
      }



      if (currentTopics.length === 0) {
        console.log("No current topics found, falling back to medium mastery topics");
        return this.selectMediumMasteryQuestions(subjectId, count);
      }

      const availableTimeMinutes = DAILY_TEACHING_HOURS * BUFFER_FACTOR;

      const subTopicIds: string[] = [];
      for (const topic of currentTopics) {

        const timeSpentOnTopic = Date.now() - topic.startedAt.getTime();
        const timeSpentDays = timeSpentOnTopic / (1000 * 60 * 24);

        const subTopics = await this.prisma.subTopic.findMany({
          where: {
            topicId: topic.topicId,
          },
          select: {
            id: true,
            estimatedMinutes: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        });

        let accumulatedTime = 0;

        for (const subTopic of subTopics) {
          if (
            accumulatedTime >= timeSpentDays * availableTimeMinutes ||
            subTopic.estimatedMinutes > availableTimeMinutes
          ) {
            break;
          }

          subTopicIds.push(subTopic.id);
          accumulatedTime += subTopic.estimatedMinutes;
        }
      }


      if (subTopicIds.length === 0) {
        return [];
      }

      const { difficulty: difficultyDistribution, categories } =
        this.getSelectionParameters(count, subjectId);

      let selectedQuestions: { id: string; difficulty: number }[] = [];

      const attemptedQuestionIds = this.attempts.questionIds;

      const questions = await this.prisma.question.findMany({
        where: {
          subtopicId: { in: subTopicIds },
          subjectId: subjectId,
          isPublished: true,
          id: {
            notIn: Array.from(attemptedQuestionIds),
          },
          OR: [
            {
              AND: [
                {
                  difficulty: {
                    in: difficultyDistribution.map((_, i) => i + 1),
                  },
                },
                { category: { some: { category: { in: categories } } } },
              ],
            },
            {
              AND: [
                {
                  difficulty: {
                    in: difficultyDistribution.map((_, i) => i + 1),
                  },
                },
                {
                  OR: [
                    {
                      category: {
                        some: {
                          category: { in: ["CONCEPTUAL", "APPLICATION"] },
                        },
                      },
                    },
                    { category: { none: {} } },
                  ],
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          difficulty: true,
        },
        take: count * 3,
      });

      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        const questionsNeededForThisDifficulty =
          difficultyDistribution[difficulty - 1];
        if (questionsNeededForThisDifficulty <= 0) continue;

        const questionsForDifficulty = questions.filter(
          (q) => q.difficulty === difficulty
        );

        selectedQuestions = [
          ...selectedQuestions,
          ...questionsForDifficulty.slice(0, questionsNeededForThisDifficulty),
        ];
      }

      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const additionalQuestions = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: subTopicIds,
            },
            subjectId: subjectId,
            id: {
              notIn: Array.from(
                new Set([...selectedIds, ...attemptedQuestionIds])
              ),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: count - selectedQuestions.length,
        });

        selectedQuestions = [
          ...selectedQuestions,
          ...additionalQuestions.slice(0, count - selectedQuestions.length),
        ];
      }

      if (selectedQuestions.length < count) {
        const remainingCount = count - selectedQuestions.length;
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const fallbackQuestions = await this.getFallbackQuestions(
          subTopicIds,
          subjectId,
          remainingCount,
          categories,
          selectedIds
        );

        selectedQuestions = [...selectedQuestions, ...fallbackQuestions];
      }

      if (selectedQuestions.length < 0) {
        return this.selectMediumMasteryQuestions(subjectId, count);
      }
      return selectedQuestions.slice(0, count);
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
          topic: {
            subjectId: subjectId,
          },
          masteryLevel: { gte: 40, lte: 60 },
        },
        select: {
          topicId: true,
        },
        orderBy: [{ masteryLevel: "asc" }],
        take: 3,
      });
      if (mediumMasteryTopics.length === 0) {
        return [];
      }
      let topicIds = mediumMasteryTopics.map((t) => t.topicId);
      const { difficulty: difficultyDistribution, categories } = this.getSelectionParameters(count, subjectId);
      let selectedQuestions: { id: string; difficulty: number }[] = [];
      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        const questionsNeededForThisDifficulty = difficultyDistribution[difficulty - 1];
        if (questionsNeededForThisDifficulty <= 0) continue;
        const questionsForDifficulty = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subjectId,
            difficulty: difficulty,
            id: {
              notIn: Array.from(this.attempts.questionIds),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: questionsNeededForThisDifficulty * 3,
        });
        selectedQuestions = [
          ...selectedQuestions,
          ...questionsForDifficulty.slice(0, questionsNeededForThisDifficulty),
        ];
      }
      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));
        const additionalQuestions = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subjectId,
            id: {
              notIn: Array.from(
                new Set([...selectedIds, ...this.attempts.questionIds])
              ),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: count - selectedQuestions.length,
        });
        selectedQuestions = [
          ...selectedQuestions,
          ...additionalQuestions.slice(0, count - selectedQuestions.length),
        ];
      }
      if (selectedQuestions.length < count) {
        const remainingCount = count - selectedQuestions.length;
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));
        const fallbackQuestions = await this.getFallbackQuestions(
          topicIds,
          subjectId,
          remainingCount,
          categories,
          selectedIds
        );
        selectedQuestions = [...selectedQuestions, ...fallbackQuestions];
      }

      return selectedQuestions.slice(0, count);


    } catch (error) {
      console.error("Error selecting medium mastery questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectMediumMasteryQuestions",
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

  public async selectWeakConceptQuestions(
    subjectId: string,
    count: number
  ): Promise<{ id: string; difficulty: number }[]> {
    try {

      let weakTopics = [];

      weakTopics = await this.prisma.topicMastery.findMany({
        where: {
          userId: this.userId,
          topic: {
            subjectId: subjectId,
          },
          OR: [{ masteryLevel: { lte: 40 } }, { masteryLevel: { gt: 0 } }],
        },
        select: {
          topicId: true,
          masteryLevel: true,
        },
        orderBy: [{ masteryLevel: "asc" }],
        take: 1,
      });


      if (!weakTopics || weakTopics.length === 0) {
        return [];
      }

      let topicIds = weakTopics.map((wt) => wt.topicId);

      const { difficulty: difficultyDistribution, categories } =
        this.getSelectionParameters(count, subjectId);

      let selectedQuestions: { id: string; difficulty: number }[] = [];

      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        const questionsNeededForThisDifficulty =
          difficultyDistribution[difficulty - 1];

        if (questionsNeededForThisDifficulty <= 0) continue;

        const questionsForDifficulty = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subjectId,
            difficulty: difficulty,
            id: {
              notIn: Array.from(this.attempts.questionIds),
            },
            OR: [
              {
                category: {
                  some: {
                    category: {
                      in: categories,
                    },
                  },
                },
              },
              {
                category: {
                  none: {},
                },
              },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: questionsNeededForThisDifficulty * 3,
        });

        selectedQuestions = [
          ...selectedQuestions,
          ...questionsForDifficulty.slice(0, questionsNeededForThisDifficulty),
        ];
      }

      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const additionalQuestions = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subjectId,
            id: {
              notIn: Array.from(
                new Set([...selectedIds, ...this.attempts.questionIds])
              ),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: count - selectedQuestions.length,
        });

        selectedQuestions = [
          ...selectedQuestions,
          ...additionalQuestions.slice(0, count - selectedQuestions.length),
        ];
      }

      if (selectedQuestions.length < count) {
        const remainingCount = count - selectedQuestions.length;
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const fallbackQuestions = await this.getFallbackQuestions(
          topicIds,
          subjectId,
          remainingCount,
          categories,
          selectedIds
        );

        selectedQuestions = [...selectedQuestions, ...fallbackQuestions];
      }

      return selectedQuestions.slice(0, count);
    } catch (error) {
      console.error("Error selecting weak concept questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectWeakConceptQuestions",
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

  async selectRevisionQuestions(
    subjectId: string,
    count: number
  ): Promise<{ id: string; difficulty: number }[]> {
    try {
      const completedTopics = await this.prisma.currentStudyTopic.findMany({
        where: {
          userId: this.userId,
          subjectId: subjectId,
          isCompleted: true,
        },
        select: {
          topicId: true,
        },
      });

      if (completedTopics.length === 0) {
        return [];
      }


      const reviewSchedules = await this.prisma.reviewSchedule.findMany({
        where: {
          userId: this.userId,
          topicId: {
            in: completedTopics.map((ct) => ct.topicId),
          },
          nextReviewAt: {
            lte: new Date(),
          },
        },
        select: {
          topicId: true,
        },
        orderBy: {
          nextReviewAt: "asc",
        },
        take: 1,
      });

      const topicIds: string[] = reviewSchedules.map((rs) => rs.topicId);

      if (topicIds.length === 0) {
        return [];
      }



      const { difficulty: difficultyDistribution, categories } =
        this.getSelectionParameters(count, subjectId);

      let selectedQuestions: { id: string; difficulty: number }[] = [];

      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        const questionsNeededForThisDifficulty =
          difficultyDistribution[difficulty - 1];

        if (questionsNeededForThisDifficulty <= 0) continue;

        const questionsForDifficulty = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subjectId,
            difficulty: difficulty,
            id: {
              notIn: Array.from(this.attempts.questionIds),
            },
            OR: [
              {
                category: {
                  some: {
                    category: {
                      in: categories,
                    },
                  },
                },
              },
              {
                category: {
                  none: {},
                },
              },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: questionsNeededForThisDifficulty * 3,
        });

        selectedQuestions = [
          ...selectedQuestions,
          ...questionsForDifficulty.slice(0, questionsNeededForThisDifficulty),
        ];
      }

      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const additionalQuestions = await this.prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subjectId,
            id: {
              notIn: Array.from(
                new Set([...selectedIds, ...this.attempts.questionIds])
              ),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          select: {
            id: true,
            difficulty: true,
          },
          take: count - selectedQuestions.length,
        });

        selectedQuestions = [
          ...selectedQuestions,
          ...additionalQuestions.slice(0, count - selectedQuestions.length),
        ];
      }

      if (selectedQuestions.length < count) {
        const remainingCount = count - selectedQuestions.length;
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const fallbackQuestions = await this.getFallbackQuestions(
          topicIds,
          subjectId,
          remainingCount,
          categories,
          selectedIds
        );

        selectedQuestions = [...selectedQuestions, ...fallbackQuestions];
      }

      return selectedQuestions.slice(0, count);
    } catch (error) {
      console.error("Error selecting revision questions:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "QuestionSelector",
          method: "selectRevisionQuestions",
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

  private getSelectionParameters(count: number, subjectId: string): {
    difficulty: number[];
    categories: QCategory[];
  } {
    const { difficulty } = getDifficultyDistributionByGrade(this.grade, count, subjectId, this.config.examCode);
    const categories = this.config.questionCategoriesDistribution
      .grade as QCategory[];

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
