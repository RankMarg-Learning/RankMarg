import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { Prisma } from "@prisma/client";
import prisma from "@repo/db";
import {
  QCategory,
  QuestionFormat,
  QuestionType,
  Role,
  SubmitStatus,
} from "@repo/db/enums";
import { NextFunction, Response } from "express";

interface WhereClauseProps {
  subjectId?: {in: string[]};
  topicId?: string;
  subtopicId?: string;
  difficulty?: number;
  category?: Prisma.QuestionCategoryListRelationFilter;
  type?: QuestionType;
  OR?: Array<Prisma.QuestionWhereInput>;
  pyqYear?: string;
  isPublished?: boolean;
  slug?: { in: string[] };
  createdBy?: string;
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
        examCode,
        isPublished,
        page = 1,
        limit = 25,
        questionFilter = "my-questions",
      } = req.query;
      const userID = req.user.id;
      const userRole = req.user.role;
      const l = Number(limit) || 25;
      const skip = (Number(page) - 1) * l;
      const whereClause: WhereClauseProps = {};
      
      
      if (subjectId) {
        const subjectIds  = Array.isArray(subjectId) 
        ? subjectId as string[]
        : typeof subjectId === 'string' && subjectId.includes(',')
        ? subjectId.split(',').map(id => id.trim()).filter(id => id.length > 0)
        : [subjectId as string];
        whereClause.subjectId = {
          in: subjectIds,
        };
      }else{
        if(examCode){
          const examSubject = await prisma.examSubject.findMany({
            where: {
              examCode: examCode as string,
            },
            select: {
              subjectId: true,
            },
          });
          whereClause.subjectId = {
            in: examSubject.map(subject => subject.subjectId),
          };
        }
      }
      if (topicId) whereClause.topicId = topicId as string;
      if (subtopicId) whereClause.subtopicId = subtopicId as string;
      if (difficulty) whereClause.difficulty = Number(difficulty);
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
            subject:{
              name: { contains: search as string, mode: "insensitive" },
            }
          },
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
      if (userRole !== Role.ADMIN && questionFilter === "my-questions") {
        whereClause.createdBy = userID;
        
      } else if (userRole === Role.ADMIN && questionFilter === "all") {
        whereClause.OR = [
          { isPublished: true },
          { createdBy: userID },
        ];
      }

      const [questions] = await Promise.all([
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
            
            topic: {
              select: { name: true },
            },
            subject: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const totalFiltered = questions.length;
      const paginatedQuestions = questions.slice(skip, skip + l);

      const currentPage = Number(page);
      const totalPages = Math.ceil(totalFiltered / l);
      const payload = {
        questions: paginatedQuestions,
        currentPage,
        totalPages,
        totalCount: totalFiltered,
        accessRole: userRole,
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
      
      // Validate required fields
      if (!title || !content || !solution || !type || !difficulty || !subjectId || !topicId || !subtopicId) {
         ResponseUtil.error(res, "Missing required fields", 400);
      }

      // Validate category array
      if (!category || !Array.isArray(category) || category.length === 0) {
         ResponseUtil.error(res, "At least one category is required", 400);
      }

      const userID = req.user.id;
      
      await prisma.question.create({
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
            create: (options || []).map((option: Option) => ({
              content: option.content,
              isCorrect: option.isCorrect,
            })),
          },
        },
      });
      ResponseUtil.success(res, null, "Question created successfully", 200);
    } catch (error) {
      console.error("Error creating question:", error);
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
      const question = await prisma.question.findFirst({
        where: { 
          OR: [
            { slug: slug },
            { id: slug },
          ]
        },
        include: {
          options: true,
          topic: { select: { name: true } },
          category: { select: { category: true } },
        },
      }) || null;
      if (!question) {
        ResponseUtil.error(res, "Question not found", 404);
        return;
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
      const body = req.body;
      
      // Validate required fields
      if (!body.title || !body.content || !body.solution) {
         ResponseUtil.error(res, "Missing required fields: title, content, or solution", 400);
      }

      // Prepare update data with only valid fields
      const updateData: any = {
        title: body.title,
        content: body.content,
        type: body.type,
        format: body.format,
        difficulty: body.difficulty,
        subjectId: body.subjectId,
        topicId: body.topicId,
        subtopicId: body.subtopicId,
        pyqYear: body.pyqYear || null,
        book: body.book || null,
        hint: body.hint || null,
        solution: body.solution,
        strategy: body.strategy || null,
        commonMistake: body.commonMistake || null,
        questionTime: body.questionTime,
        isNumerical: body.isNumerical,
        isPublished: body.isPublished,
      };

      // Handle options update if provided
      if (body.options && Array.isArray(body.options)) {
        updateData.options = {
          deleteMany: {},
          create: body.options.map((option: any) => ({
            content: option.content,
            isCorrect: option.isCorrect,
          })),
        };
      }

      // Handle category update if provided
      if (body.category && Array.isArray(body.category)) {
        updateData.category = {
          deleteMany: {},
          create: body.category.map((category: QCategory) => ({
            category: category,
          })),
        };
      }

      await prisma.question.update({
        where: {
          slug,
        },
        data: updateData,
      });
      
      ResponseUtil.success(res, null, "Question updated successfully", 200);
    } catch (error) {
      console.error("Error updating question:", error);
      next(error);
    }
  };
  migrateAttempts = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { sourceQuestionId, targetQuestionId } = req.body;

      if (!sourceQuestionId || !targetQuestionId) {
        ResponseUtil.error(res, "Both sourceQuestionId and targetQuestionId are required", 400);
        return;
      }

      if (sourceQuestionId === targetQuestionId) {
        ResponseUtil.error(res, "Source and target question IDs must be different", 400);
        return;
      }

      // Verify both questions exist
      const [sourceQuestion, targetQuestion] = await Promise.all([
        prisma.question.findUnique({ where: { id: sourceQuestionId } }),
        prisma.question.findUnique({ where: { id: targetQuestionId } }),
      ]);

      if (!sourceQuestion) {
        ResponseUtil.error(res, "Source question not found", 404);
        return;
      }

      if (!targetQuestion) {
        ResponseUtil.error(res, "Target question not found", 404);
        return;
      }

      await prisma.attempt.updateMany({
        where: { questionId: sourceQuestionId },
        data: { questionId: targetQuestionId },
      });

      ResponseUtil.success(res, null, "Attempts migrated successfully", 200);
    } catch (error) {
      console.error("Error migrating attempts:", error);
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
  reportQuestion = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      const { type, feedback } = req.body as { type: string; feedback: string };
      const userId = req.user.id;

      const created = await prisma.reportQuestion.create({
        data: {
          userId,
          slug: slug,
          type,
          feedback,
        },
      });

      ResponseUtil.success(res, created, "Report submitted", 201);
    } catch (error) {
      next(error);
    }
  };

  getReportsByQuestionSlug = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 25 } = req.query;

      const l = Number(limit) || 25;
      const skip = (Number(page) - 1) * l;

      const [reports, total] = await Promise.all([
        prisma.reportQuestion.findMany({
          where: { slug },
          select: {
            id: true,
            type: true,
            feedback: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip: skip as number,
          take: l as number,
        }),
        prisma.reportQuestion.count({ where: { slug } }),
      ]);

      const currentPage = Number(page);
      const totalPages = Math.ceil(total / l);

      const payload = {
        reports,
        currentPage,
        totalPages,
        total,
        slug,
      };

      ResponseUtil.success(
        res,
        payload,
        "Question reports fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  deleteReportQuestion = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      await prisma.reportQuestion.delete({
        where: { id },
      });

      ResponseUtil.success(res, null, "Report deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
