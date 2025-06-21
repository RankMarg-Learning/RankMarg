import { Subject, QCategory, GradeEnum } from "@prisma/client";
import { getDifficultyDistributionByGrade } from "./SessionConfig";
import {
  SelectectedQuestion,
  SessionConfig,
} from "../../type/session.api.types";
import prisma from "../../lib/prisma";

export class QuestionSelector {
  private config: SessionConfig;
  private userId: string;
  private grade: GradeEnum;

  constructor(userId: string, grade: GradeEnum, config: SessionConfig) {
    this.userId = userId;
    this.grade = grade;
    this.config = config;
  }

  async selectCurrentTopicQuestions(
    subject: Subject,
    count: number
  ): Promise<SelectectedQuestion[]> {
    try {
      const currentTopics = await prisma.currentStudyTopic.findMany({
        where: {
          userId: this.userId,
          subjectId: subject.id,
          isCurrent: true,
          isCompleted: false,
        },
        include: {
          topic: true,
        },
      });
      if (currentTopics.length === 0) {
        return [];
      }

      const topicIds = currentTopics.map((ct) => ct.topicId);

      const { difficulty: difficultyDistribution, categories } =
        this.getSelectionParameters(count);

      let selectedQuestions: SelectectedQuestion[] = [];
      const questions = await prisma.question.findMany({
        where: {
          topicId: { in: topicIds },
          subjectId: subject.id,
          isPublished: true,
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

        const filteredQuestionsForDifficulty =
          await this.filterRecentlyAttemptedQuestions(questionsForDifficulty);

        selectedQuestions = [
          ...selectedQuestions,
          ...filteredQuestionsForDifficulty.slice(
            0,
            questionsNeededForThisDifficulty
          ),
        ];
      }

      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const additionalQuestions = await prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subject.id,
            id: {
              notIn: Array.from(selectedIds),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          include: {
            options: true,
          },
          take: count - selectedQuestions.length,
        });

        const filteredAdditional =
          await this.filterRecentlyAttemptedQuestions(additionalQuestions);

        selectedQuestions = [
          ...selectedQuestions,
          ...filteredAdditional.slice(0, count - selectedQuestions.length),
        ];
      }
      return selectedQuestions.slice(0, count);
    } catch (error) {
      console.error("Error selecting current topic questions:", error);
      return [];
    }
  }

  public async selectWeakConceptQuestions(
    subject: Subject,
    count: number
  ): Promise<SelectectedQuestion[]> {
    try {
      const weakTopics = await prisma.topicMastery.findMany({
        where: {
          userId: this.userId,
          topic: {
            subjectId: subject.id,
          },
          OR: [{ masteryLevel: { lte: 40 } }, { strengthIndex: { lte: 50 } }],
        },
        include: {
          topic: true,
        },
        orderBy: {
          masteryLevel: "asc",
        },
        take: 10,
      });

      if (weakTopics.length === 0) {
        return [];
      }

      const topicIds = weakTopics.map((wt) => wt.topicId);
      const { difficulty: difficultyDistribution, categories } =
        this.getSelectionParameters(count);

      let selectedQuestions: SelectectedQuestion[] = [];

      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        const questionsNeededForThisDifficulty =
          difficultyDistribution[difficulty - 1];

        if (questionsNeededForThisDifficulty <= 0) continue;

        const questionsForDifficulty = await prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subject.id,
            difficulty: difficulty,
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
          },
          take: questionsNeededForThisDifficulty * 3,
        });

        const filteredQuestionsForDifficulty =
          await this.filterRecentlyAttemptedQuestions(questionsForDifficulty);

        selectedQuestions = [
          ...selectedQuestions,
          ...filteredQuestionsForDifficulty.slice(
            0,
            questionsNeededForThisDifficulty
          ),
        ];
      }

      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const additionalQuestions = await prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subject.id,
            id: {
              notIn: Array.from(selectedIds),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          include: {
            options: true,
          },
          take: count - selectedQuestions.length,
        });

        const filteredAdditional =
          await this.filterRecentlyAttemptedQuestions(additionalQuestions);

        selectedQuestions = [
          ...selectedQuestions,
          ...filteredAdditional.slice(0, count - selectedQuestions.length),
        ];
      }

      return selectedQuestions.slice(0, count);
    } catch (error) {
      console.error("Error selecting weak concept questions:", error);
      return [];
    }
  }

  async selectRevisionQuestions(
    subject: Subject,
    count: number
  ): Promise<SelectectedQuestion[]> {
    try {
      const completedTopics = await prisma.currentStudyTopic.findMany({
        where: {
          userId: this.userId,
          subjectId: subject.id,
          isCompleted: true,
        },
        include: {
          topic: true,
        },
      });

      if (completedTopics.length === 0) {
        return [];
      }

      const reviewSchedules = await prisma.reviewSchedule.findMany({
        where: {
          userId: this.userId,
          topicId: {
            in: completedTopics.map((ct) => ct.topicId),
          },
          nextReviewAt: {
            lte: new Date(),
          },
        },
      });

      let topicIds = reviewSchedules.map((rs) => rs.topicId);

      if (topicIds.length < 5) {
        const otherTopicIds = completedTopics
          .filter((ct) => !topicIds.includes(ct.topicId))
          .map((ct) => ct.topicId);

        topicIds = [...topicIds, ...otherTopicIds];
      }

      const { difficulty: difficultyDistribution, categories } =
        this.getSelectionParameters(count);
      let selectedQuestions: SelectectedQuestion[] = [];

      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        const questionsNeededForThisDifficulty =
          difficultyDistribution[difficulty - 1];

        if (questionsNeededForThisDifficulty <= 0) continue;

        const questionsForDifficulty = await prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subject.id,
            difficulty: difficulty,
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
          },
          take: questionsNeededForThisDifficulty * 3,
        });

        const filteredQuestionsForDifficulty =
          await this.filterRecentlyAttemptedQuestions(questionsForDifficulty);

        selectedQuestions = [
          ...selectedQuestions,
          ...filteredQuestionsForDifficulty.slice(
            0,
            questionsNeededForThisDifficulty
          ),
        ];
      }

      if (selectedQuestions.length < count) {
        const selectedIds = new Set(selectedQuestions.map((q) => q.id));

        const additionalQuestions = await prisma.question.findMany({
          where: {
            topicId: {
              in: topicIds,
            },
            subjectId: subject.id,
            id: {
              notIn: Array.from(selectedIds),
            },
            OR: [
              { category: { some: { category: { in: categories } } } },
              { category: { none: {} } },
            ],
            isPublished: true,
          },
          include: {
            options: true,
          },
          take: count - selectedQuestions.length,
        });

        const filteredAdditional =
          await this.filterRecentlyAttemptedQuestions(additionalQuestions);

        selectedQuestions = [
          ...selectedQuestions,
          ...filteredAdditional.slice(0, count - selectedQuestions.length),
        ];
      }

      return selectedQuestions.slice(0, count);
    } catch (error) {
      console.error("Error selecting revision questions:", error);
      return [];
    }
  }

  private async filterRecentlyAttemptedQuestions(
    questions: SelectectedQuestion[]
  ): Promise<SelectectedQuestion[]> {
    try {
      if (questions.length === 0) {
        return [];
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 15);

      const recentAttempts = await prisma.attempt.findMany({
        where: {
          userId: this.userId,
          solvedAt: {
            gte: oneWeekAgo,
          },
          questionId: {
            in: questions.map((q) => q.id),
          },
        },
        select: {
          questionId: true,
        },
      });

      const recentQuestionIds = new Set(
        recentAttempts.map((a) => a.questionId)
      );

      return questions.filter((q) => !recentQuestionIds.has(q.id));
    } catch (error) {
      console.error("Error filtering recently attempted questions:", error);
      return questions;
    }
  }

  private getSelectionParameters(count: number): {
    difficulty: number[];
    categories: QCategory[];
  } {
    const { difficulty } = getDifficultyDistributionByGrade(this.grade, count);
    const categories = this.config.questionCategoriesDistribution
      .grade as QCategory[];

    return { difficulty, categories };
  }
  // private prioritizeQuestions(questions: Question[]): Question[] {
  //     // Clone the array to avoid modifying the original
  //     const prioritizedQuestions = [...questions];

  //     // Sort by multiple criteria
  //     prioritizedQuestions.sort((a, b) => {
  //         // First priority: Calculate score based on question attributes
  //         const scoreA = this.calculateQuestionScore(a);
  //         const scoreB = this.calculateQuestionScore(b);

  //         // Higher score should come first
  //         return scoreB - scoreA;
  //     });

  //     return prioritizedQuestions;
  // }

  /**
   * Calculate a score for each question to determine its priority
   */
  // private calculateQuestionScore(question: Question): number {
  //     let score = 0;

  //     // Base score from difficulty (weighted by student's grade)
  //     const difficultyFactor = this.getDifficultyFactor(question.difficulty);
  //     score += difficultyFactor * 10;

  //     // Bonus for high accuracy questions (if student's grade is low)
  //     if (this.grade === 'D' || this.grade === 'C') {
  //         score += (question. || 0) * 5;
  //     }

  //     // Penalty for high accuracy questions (if student's grade is high)
  //     if (this.grade === 'A+' || this.grade === 'A') {
  //         score -= (question.accuracy || 0) * 3;
  //     }

  //     // Bonus for PYQs
  //     if (question.pyqYear) {
  //         score += 5;
  //     }

  //     // Bonus for questions with hints (for lower grades)
  //     if (question.hint && (this.grade === 'D' || this.grade === 'C')) {
  //         score += 3;
  //     }

  //     // Random factor to ensure diversity (±2 points)
  //     score += (Math.random() * 4) - 2;

  //     return score;
  // }

  /**
   * Calculate difficulty factor based on student's grade
   */
  // private getDifficultyFactor(questionDifficulty: number): number {

  //     const gradeMap: Record<string, number[]> = {
  //         'A+': [2, 3], // Medium to Hard
  //         'A': [2, 3],  // Medium to Hard
  //         'B': [1, 2],  // Easy to Medium
  //         'C': [1, 2],  // Easy to Medium
  //         'D': [1, 1]   // Easy
  //     };

  //     const optimalRange = gradeMap[this.grade] || [1, 2]; // Default to Easy-Medium

  //     // Calculate how close the question difficulty is to the optimal range
  //     if (questionDifficulty >= optimalRange[0] && questionDifficulty <= optimalRange[1]) {
  //         return 1.0; // Perfect match
  //     } else {
  //         // Penalty for being outside the optimal range
  //         return 1.0 - (0.2 * Math.min(
  //             Math.abs(questionDifficulty - optimalRange[0]),
  //             Math.abs(questionDifficulty - optimalRange[1])
  //         ));
  //     }
  // }

  // /**
  //  * Get difficulty levels and categories based on student's grade
  //  */
}
