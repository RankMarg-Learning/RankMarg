import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { Prisma } from "@prisma/client";
import prisma from "@repo/db";
import {
  QCategory,
  QuestionFormat,
  QuestionType,
  SubmitStatus,
} from "@repo/db/enums";
import { NextFunction, Response } from "express";

interface WhereClauseProps {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  difficulty?: number;
  category?: Prisma.QuestionCategoryListRelationFilter;
  type?: QuestionType;
  OR?: Array<Prisma.QuestionWhereInput>;
  pyqYear?: string;
  isPublished?: boolean;
}

interface Question {
  id: string;
  title: string;
  slug: string;
  type: QuestionType;
  format: QuestionFormat;
  content: string;
  difficulty: number;
  category?: QCategory[];
  subtopicId?: string;
  topicId?: string;
  subjectId?: string;
  pyqYear?: string;
  book?: string;
  commonMistake?: string;
  isNumerical?: number;
  solution?: string;
  questionTime?: number;
  hint?: string;
  strategy?: string;
  isPublished?: boolean;
  options: Option[];
  createdBy?: string;
  createdAt: string;
  QusetionInsights?: QuestionInsights;
}
interface QuestionInsights {
  id: string;
  questionId: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  avgHintsUsed: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
}
interface Option {
  id?: string;
  content: string;
  isCorrect: boolean;
  questionId?: string;
}
export class QuestionController {
  getQuestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        subjectId,
        topicId,
        subtopicId,
        difficulty,
        category,
        pyqYear,
        type,
        search,
        isPublished,
        page = 1,
        limit = 25,
      } = req.query;
      const userID = req.user.id;
      const l = Number(limit) || 25;
      const skip = (Number(page) - 1) * l;
      const whereClause: WhereClauseProps = {};
      if (subjectId) whereClause.subjectId = subjectId as string;
      if (topicId) whereClause.topicId = topicId as string;
      if (subtopicId) whereClause.subtopicId = subtopicId as string;
      if (difficulty) whereClause.difficulty = difficulty as unknown as number;
      if (category)
        whereClause.category =
          category as Prisma.QuestionCategoryListRelationFilter;
      if (pyqYear) whereClause.pyqYear = pyqYear as string;
      if (type) whereClause.type = type as QuestionType;
      if (search)
        whereClause.OR = [
          { content: { contains: search as string, mode: "insensitive" } },
          { title: { contains: search as string, mode: "insensitive" } },
          {
            topic: {
              name: { contains: search as string, mode: "insensitive" },
            },
          },
          {
            subTopic: {
              name: { contains: search as string, mode: "insensitive" },
            },
          },
        ];
      if (isPublished) {
        whereClause.isPublished = isPublished === "true";
      }
      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            format: true,
            content: true,
            difficulty: true,
            isPublished: true,

            pyqYear: true,
            createdBy: true,
            createdAt: true,
            attempts: {
              where: { userId: userID, status: SubmitStatus.CORRECT }, // TODO: WATCHDOG
              select: { id: true },
            },
            topic: {
              select: { name: true },
            },
            subTopic: {
              select: { name: true },
            },
            subject: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: skip as number,
          take: l as number,
        }),
        prisma.question.count({ where: whereClause }),
      ]);

      const currentPage = Math.ceil(total / l);
      const totalPages = Math.ceil(total / l);
      const payload = {
        questions,
        currentPage,
        totalPages,
      };
      ResponseUtil.success(res, payload, "Questions fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  createQuestion = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        slug,
        title,
        content,
        type,
        format,
        difficulty,
        subjectId,
        topicId,
        subtopicId,
        category,
        pyqYear,
        book,
        hint,
        solution,
        strategy,
        commonMistake,
        questionTime,
        isNumerical,
        isPublished,
        options,
      }: Question = req.body;
      const userID = req.user.id;
      const question = await prisma.question.create({
        data: {
          slug,
          title,
          content,
          type,
          format,
          difficulty,
          subjectId,
          topicId,
          subtopicId,
          category: {
            create: category.map((category: QCategory) => ({ category })),
          },
          pyqYear,
          book,
          hint,
          solution,
          strategy,
          commonMistake,
          questionTime,
          isNumerical,
          isPublished,
          createdBy: userID,
          options: {
            create: options.map((option: Option) => ({
              content: option.content,
              isCorrect: option.isCorrect,
            })),
          },
        },
      });
      ResponseUtil.success(res, question, "Question created successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  getQuestionById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { slug } = req.params;
    try {
      const question = await prisma.question.findUnique({
        where: { slug },
        include: {
          options: true,
          topic: { select: { name: true } },
          category: { select: { category: true } },
        },
      });
      if (!question) {
        ResponseUtil.error(res, "Question not found", 404);
      }
      const formattedQuestion = {
        ...question,
        category: question?.category.map((cat) => cat.category) || [],
      };
      ResponseUtil.success(res, formattedQuestion, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };
  updateQuestionById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      const { body } = req.body;
      await prisma.question.update({
        where: {
          slug,
        },
        data: {
          ...body,

          options: {
            deleteMany: {},
            create: body.options?.map((option) => ({
              content: option.content,
              isCorrect: option.isCorrect,
            })),
          },
          category: {
            deleteMany: {},
            create: body.category.map((category: QCategory) => ({
              category: category,
            })),
          },
        },
      });
      ResponseUtil.success(res, null, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };
  deleteQuestionById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      await prisma.question.delete({
        where: { slug },
      });
      ResponseUtil.success(res, null, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };
}
