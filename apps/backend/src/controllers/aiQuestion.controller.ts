import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { RedisCacheService } from "@/services/redisCache.service";
import { ResponseUtil } from "@/utils/response.util";
import { ApiError, ErrorCode } from "@/types/common";
import prisma from "@repo/db";
import { GradeEnum, SubmitStatus } from "@repo/db/enums";
import { NextFunction, Response } from "express";

interface AIQuestionFilters {
  topicSlug: string;
  subjectId?: string;
  userGrade: GradeEnum;
  userId: string;
  page: number;
  limit: number;
}

interface QuestionWithMetadata {
  id: string;
  slug: string;
  title: string;
  content: string;
  type: string;
  format: string;
  difficulty: number;
  questionTime: number;
  hint?: string | null;
  strategy?: string | null;
  commonMistake?: string | null;
  pyqYear?: string | null;
  options: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  topic: {
    name: string;
    slug: string | null;
  } | null;
  subject: {
    name: string;
  } | null;
  category: Array<{
    category: string;
  }>;
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
        return ResponseUtil.success(
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
        questions: this.formatQuestionsResponse(questions),
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
  ): Promise<QuestionWithMetadata[]> {
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
        questionTime: true,
        hint: true,
        strategy: true,
        commonMistake: true,
        pyqYear: true,
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
        category: {
          select: {
            category: true,
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
   * Format questions response to hide correct answers
   */
  private formatQuestionsResponse(questions: QuestionWithMetadata[]) {
    return questions.map((question) => ({
      id: question.id,
      slug: question.slug,
      title: question.title,
      content: question.content,
      type: question.type,
      format: question.format,
      difficulty: question.difficulty,
      questionTime: question.questionTime,
      hint: question.hint,
      strategy: question.strategy,
      commonMistake: question.commonMistake,
      pyqYear: question.pyqYear,
      options: question.options.map((opt) => ({
        id: opt.id,
        content: opt.content,
        // Don't send isCorrect to client for security
      })),
      topic: question.topic,
      subject: question.subject,
      categories: question.category.map((cat) => cat.category),
    }));
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
   * Get user's AI question statistics
   */
  getUserAIQuestionStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new ApiError(
          ErrorCode.UNAUTHORIZED,
          "User not authenticated",
          401
        );
      }

      const userId = req.user.id;

      const [userGrade, totalAttempted, correctAttempts, subjectWiseStats] =
        await Promise.all([
          this.getUserGrade(userId),
          prisma.attempt.count({
            where: { userId },
          }),
          prisma.attempt.count({
            where: {
              userId,
              status: SubmitStatus.CORRECT,
            },
          }),
          prisma.attempt.groupBy({
            by: ["questionId"],
            where: { userId },
            _count: {
              questionId: true,
            },
          }),
        ]);

      const accuracy =
        totalAttempted > 0 ? (correctAttempts / totalAttempted) * 100 : 0;

      ResponseUtil.success(
        res,
        {
          userGrade,
          totalAttempted,
          correctAttempts,
          accuracy: Math.round(accuracy * 100) / 100,
          uniqueQuestionsAttempted: subjectWiseStats.length,
        },
        "User stats fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

