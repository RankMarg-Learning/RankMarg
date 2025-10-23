import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { RedisCacheService } from "@/services/redisCache.service";
import { ResponseUtil } from "@/utils/response.util";
import { ApiError, ErrorCode } from "@/types/common";
import prisma from "@repo/db";
import { GradeEnum, SubmitStatus, SubscriptionStatus } from "@repo/db/enums";
import { NextFunction, Response } from "express";

interface AIQuestionFilters {
  topicSlug: string;
  subjectId?: string;
  userGrade: GradeEnum;
  userId: string;
  page: number;
  limit: number;
}
export interface AIQuestion {
  id: string;
  slug: string;
  title: string;
  content: string;
  type: string;
  format: string;
  difficulty: number;
  hint?: string | null;
  strategy?: string | null;
  commonMistake?: string | null;
  options: QuestionOption[];
  topic: {
    name: string;
    slug: string | null;
  } | null;
  subject: {
    name: string;
  } | null;
}
export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
}
export interface AIQuestionPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AIQuestionMetadata {
  topicName: string;
  subjectName: string;
  userGrade: string;
  difficultyRange: {
    min: number;
    max: number;
  };
  questionsAttempted: number;
}

export interface AIQuestionsResponse {
  questions: AIQuestion[];
  pagination: AIQuestionPagination;
  metadata: AIQuestionMetadata;
}

export class AIQuestionController {
  /**
   * Get AI-powered questions based on topic with performance-based filtering
   * Excludes already attempted questions and adjusts difficulty based on user grade
   */
  getAIQuestionsByTopic = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { topicSlug } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      if (!req.user) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "User not authenticated",
          401
        );
      }

      const userId = req.user.id;
      const userGrade = await this.getUserGrade(userId);

      // Check cache first
      const cacheKey = `ai:questions:${topicSlug}:${userId}:${userGrade}:${page}:${limit}`;
      const cachedData = await RedisCacheService.getCachedQuestionsBySubject(
        topicSlug,
        `ai-${userGrade}`
      );

      if (cachedData) {
         ResponseUtil.success(
          res,
          cachedData,
          "AI questions fetched successfully (cached)",
          200
        );
      }

      // Fetch topic details
      const topic = await prisma.topic.findFirst({
        where: { slug: topicSlug },
        include: {
          subject: {
            select: { id: true, name: true },
          },
        },
      });

      if (!topic) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          "Topic not found",
          404
        );
      }

      // Get user's attempted questions to exclude them
      const attemptedQuestions = await prisma.attempt.findMany({
        where: {
          userId,
          question: {
            topicId: topic.id,
          },
        },
        select: {
          questionId: true,
        },
        distinct: ["questionId"],
      });

      const attemptedQuestionIds = attemptedQuestions.map((a) => a.questionId);

      // Get difficulty range based on user grade
      const difficultyRange = this.getDifficultyRangeForGrade(userGrade);

      // Fetch questions with performance-based filtering
      const [questions, totalCount] = await Promise.all([
        this.fetchFilteredQuestions({
          topicSlug,
          subjectId: topic.subjectId,
          userGrade,
          userId,
          page: Number(page),
          limit: Number(limit),
        }, attemptedQuestionIds, difficultyRange),
        this.countFilteredQuestions(
          topic.id,
          attemptedQuestionIds,
          difficultyRange
        ),
      ]);

      const currentPage = Number(page);
      const totalPages = Math.ceil(totalCount / Number(limit));

      const payload = {
        questions: questions,
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          limit: Number(limit),
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
        metadata: {
          topicName: topic.name,
          subjectName: topic.subject?.name,
          userGrade,
          difficultyRange,
          questionsAttempted: attemptedQuestionIds.length,
        },
      };

      // Cache the results (cast to any to avoid type mismatch with Redis cache)
      await RedisCacheService.cacheQuestionsBySubject(
        topicSlug,
        payload.questions as any,
        `ai-${userGrade}`
      );

      ResponseUtil.success(
        res,
        payload,
        "AI questions fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's current grade
   */
  private async getUserGrade(userId: string): Promise<GradeEnum> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { grade: true },
      });

      if (!user || !user.grade) {
        return GradeEnum.C; // Default grade
      }

      return user.grade as GradeEnum;
    } catch (error) {
      console.error("Error fetching user grade:", error);
      return GradeEnum.C;
    }
  }

  /**
   * Get difficulty range based on user's grade
   * A_PLUS: 3-4 (Hard, Very Hard)
   * A: 2-4 (Medium, Hard, Very Hard)
   * B: 2-3 (Medium, Hard)
   * C: 1-2 (Easy, Medium)
   * D: 1 (Easy)
   */
  private getDifficultyRangeForGrade(grade: GradeEnum): {
    min: number;
    max: number;
  } {
    switch (grade) {
      case GradeEnum.A_PLUS:
        return { min: 3, max: 4 };
      case GradeEnum.A:
        return { min: 2, max: 4 };
      case GradeEnum.B:
        return { min: 2, max: 3 };
      case GradeEnum.C:
        return { min: 1, max: 2 };
      case GradeEnum.D:
        return { min: 1, max: 1 };
      default:
        return { min: 1, max: 2 };
    }
  }

  /**
   * Fetch filtered questions with optimized query
   */
  private async fetchFilteredQuestions(
    filters: AIQuestionFilters,
    excludedQuestionIds: string[],
    difficultyRange: { min: number; max: number }
  ): Promise<AIQuestion[]> {
    const { topicSlug, page, limit } = filters;

    const skip = (page - 1) * limit;

    const questions = await prisma.question.findMany({
      where: {
        topic: {
          slug: topicSlug,
        },
        isPublished: true,
        difficulty: {
          gte: difficultyRange.min,
          lte: difficultyRange.max,
        },
        id: {
          notIn: excludedQuestionIds.length > 0 ? excludedQuestionIds : undefined,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        type: true,
        format: true,
        difficulty: true,
        hint: true,
        strategy: true,
        commonMistake: true,
        options: {
          select: {
            id: true,
            content: true,
            isCorrect: true,
          },
        },
        topic: {
          select: {
            name: true,
            slug: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        
      },
      orderBy: [
        { difficulty: "asc" }, // Start with easier questions within range
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });
    
    return questions;
  }

  /**
   * Count total filtered questions
   */
  private async countFilteredQuestions(
    topicId: string,
    excludedQuestionIds: string[],
    difficultyRange: { min: number; max: number }
  ): Promise<number> {
    return await prisma.question.count({
      where: {
        topicId,
        isPublished: true,
        difficulty: {
          gte: difficultyRange.min,
          lte: difficultyRange.max,
        },
        id: {
          notIn: excludedQuestionIds.length > 0 ? excludedQuestionIds : undefined,
        },
      },
    });
  }

 

  /**
   * Get topics with their subject information for the AI questions route
   */
  getTopicsBySubject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { subjectId } = req.params;

      if (!subjectId) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          "Subject ID is required",
          400
        );
      }

      const topics = await prisma.topic.findMany({
        where: {
          subjectId,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          orderIndex: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      });

      const formattedTopics = topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        orderIndex: topic.orderIndex,
      }));

      ResponseUtil.success(
        res,
        { topics: formattedTopics },
        "Topics fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all subjects available for AI questions
   */
  getSubjectsForAIQuestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
        const examCode = req.user.examCode as string;

      const subjects = await prisma.subject.findMany({
        where: {
          ...(examCode && examCode !== "undefined" ? { examSubjects: { some: { examCode } } } : {}),
        },
        select: {
          id: true,
          name: true,
          shortName: true,
          _count: {
            select: {
              questions: {
                where: {
                  isPublished: true,
                },
              },
              topics: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      const formattedSubjects = subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        shortName: subject.shortName,
        questionCount: subject._count.questions,
        topicCount: subject._count.topics,
      }));

      ResponseUtil.success(
        res,
        { subjects: formattedSubjects },
        "Subjects fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  
  /**
   * Get questions for solving session (returns unattempted questions + last 10 attempted)
   */
  getQuestionsForSession = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { topicSlug } = req.params;
      
      if (!req.user) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "User not authenticated",
          401
        );
      }

      const isPaid = req.user.plan?.status === SubscriptionStatus.ACTIVE || req.user.plan?.status === SubscriptionStatus.TRIAL;
      const isTrial = req.user.plan?.status === SubscriptionStatus.TRIAL;
      if (!isPaid) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "Upgrade to premium to access this feature",
          403
        );
      }

      const userId = req.user.id;
      const userGrade = await this.getUserGrade(userId);

      // Fetch topic details
      const topic = await prisma.topic.findFirst({
        where: { slug: topicSlug },
        include: {
          subject: {
            select: { id: true, name: true },
          },
        },
      });

      if (!topic) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          "Topic not found",
          404
        );
      }

      // Get difficulty range
      const difficultyRange = this.getDifficultyRangeForGrade(userGrade);

      // Get user's recent attempts (last 10) with full details
      const recentAttempts = await prisma.attempt.findMany({
        where: {
          userId,
          question: {
            topicId: topic.id,
          },
        },
        include: {
          question: {
            select: {
              id: true,
              slug: true,
              title: true,
              content: true,
              type: true,
              format: true,
              difficulty: true,
              hint: true,
              strategy: true,
              commonMistake: true,
              solution: true,
              isNumerical: true,
              options: {
                select: {
                  id: true,
                  content: true,
                  isCorrect: true,
                },
              },
              topic: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          solvedAt: "desc",
        },
      });

      // Get unique recent attempts (keep only latest attempt per question)
      const seenQuestions = new Set<string>();
      const uniqueRecentAttempts = recentAttempts
        .filter(attempt => {
          if (seenQuestions.has(attempt.questionId)) {
            return false;
          }
          seenQuestions.add(attempt.questionId);
          return true;
        })
        .slice(0, 10);

      const attemptedQuestionIds = Array.from(seenQuestions);

      // Fetch unattempted questions for the session
      const unattemptedQuestions = await prisma.question.findMany({
        where: {
          topicId: topic.id,
          isPublished: true,
          difficulty: {
            gte: difficultyRange.min,
            lte: difficultyRange.max,
          },
          id: {
            notIn: attemptedQuestionIds.length > 0 ? attemptedQuestionIds : undefined,
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
          type: true,
          format: true,
          difficulty: true,
          hint: true,
          strategy: true,
          commonMistake: true,
          solution: true,
          isNumerical: true,
          options: {
            select: {
              id: true,
              content: true,
              isCorrect: true,
            },
          },
          topic: {
            select: {
              name: true,
              slug: true,
            },
          },
          subject: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { difficulty: "asc" },
          { createdAt: "desc" },
        ],
        take: isTrial ? 20 : 50, // Limit to 2 questions for trial users and 50 for paid users
      });

      // Combine: recent attempts (in reverse order so oldest comes first) + unattempted questions
      const attemptedQuestionsWithAttempts = uniqueRecentAttempts
        .reverse() // Reverse so oldest attempt is first
        .map(attempt => ({
          question: attempt.question,
          attempt: {
            id: attempt.id,
            answer: attempt.answer,
            questionId: attempt.questionId,
            status: attempt.status,
            timing: attempt.timing,
            mistake: attempt.mistake,
            hintsUsed: attempt.hintsUsed,
            solvedAt: attempt.solvedAt,
          }
        }));

      const unattemptedQuestionsWithoutAttempts = unattemptedQuestions.map(q => ({
        question: q,
        attempt: null,
      }));

      const allQuestions = [
        ...attemptedQuestionsWithAttempts,
        ...unattemptedQuestionsWithoutAttempts,
      ];

      const payload = {
        questions: allQuestions,
        metadata: {
          topicName: topic.name,
          subjectName: topic.subject?.name,
          userGrade,
          difficultyRange,
          totalQuestions: allQuestions.length,
          attemptedCount: attemptedQuestionsWithAttempts.length,
          unattemptedCount: unattemptedQuestionsWithoutAttempts.length,
        },
      };

      ResponseUtil.success(
        res,
        payload,
        "Questions for session fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's recent attempts for a topic
   */
  getRecentAttemptsByTopic = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { topicSlug } = req.params;
      const { limit = 10 } = req.query;
      
      if (!req.user) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "User not authenticated",
          401
        );
      }

      const userId = req.user.id;

      // Fetch topic details
      const topic = await prisma.topic.findFirst({
        where: { slug: topicSlug },
        include: {
          subject: {
            select: { id: true, name: true },
          },
        },
      });

      if (!topic) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          "Topic not found",
          404
        );
      }

      // Get recent attempts with question details - Get all first then filter
      const allAttempts = await prisma.attempt.findMany({
        where: {
          userId,
          question: {
            topicId: topic.id,
          },
        },
        include: {
          question: {
            select: {
              id: true,
              slug: true,
              title: true,
              content: true,
              type: true,
              format: true,
              difficulty: true,
              questionTime: true,
              hint: true,
              strategy: true,
              commonMistake: true,
              pyqYear: true,
              solution: true,
              isNumerical: true,
              options: {
                select: {
                  id: true,
                  content: true,
                  isCorrect: true,
                },
              },
              topic: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          solvedAt: "desc",
        },
      });

      // Get unique questions by keeping only the latest attempt for each question
      const seenQuestions = new Set<string>();
      const attempts = allAttempts
        .filter(attempt => {
          if (seenQuestions.has(attempt.questionId)) {
            return false;
          }
          seenQuestions.add(attempt.questionId);
          return true;
        })
        .slice(0, Number(limit));

      const payload = {
        attempts,
        metadata: {
          topicName: topic.name,
          subjectName: topic.subject?.name,
          totalAttempts: attempts.length,
        },
      };

      ResponseUtil.success(
        res,
        payload,
        "Recent attempts fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

