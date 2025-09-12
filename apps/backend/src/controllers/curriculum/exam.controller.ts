import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { Response, NextFunction } from "express";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
export class ExamController {
  //GET /api/exams
  getExams = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { category, isActive } = req.query;
      const exams = await prisma.exam.findMany({
        where: {
          ...(category && { category: category as string }),
          ...(isActive !== null && { isActive: isActive === "true" }),
        },
        include: {
          examSubjects: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      ResponseUtil.success(res, exams, "Exams fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //POST /api/exams
  createExam = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        code,
        name,
        fullName,
        description,
        category,
        minDifficulty,
        maxDifficulty,
        totalMarks,
        duration,
        negativeMarking,
        negativeMarkingRatio,
        isActive,
        registrationStartAt,
        registrationEndAt,
        examDate,
      } = req.body;

      const exam = await prisma.exam.create({
        data: {
          code,
          name,
          fullName,
          description,
          category,
          minDifficulty,
          maxDifficulty,
          totalMarks,
          duration,
          negativeMarking,
          negativeMarkingRatio,
          isActive,
          registrationStartAt: registrationStartAt
            ? new Date(registrationStartAt)
            : null,
          registrationEndAt: registrationEndAt
            ? new Date(registrationEndAt)
            : null,
          examDate: examDate ? new Date(examDate) : null,
        },
        include: {
          examSubjects: {
            include: {
              subject: true,
            },
          },
        },
      });
      ResponseUtil.success(res, exam, "Exam created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  //GET /api/exams/[id]
  getExamById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const exam = await prisma.exam.findUnique({
        where: { code: id },
        include: {
          examSubjects: {
            include: {
              subject: true,
            },
          },
        },
      });

      if (!exam) {
        ResponseUtil.error(res, "Exam not found", 404);
      }
      ResponseUtil.success(res, exam, "Exam fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //PUT /api/exams/[id]
  updateExamById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const {
        name,
        fullName,
        description,
        category,
        minDifficulty,
        maxDifficulty,
        totalMarks,
        duration,
        negativeMarking,
        negativeMarkingRatio,
        isActive,
        registrationStartAt,
        registrationEndAt,
        examDate,
      } = req.body;
      const exam = await prisma.exam.update({
        where: { code: id },
        data: {
          name,
          fullName,
          description,
          category,
          minDifficulty,
          maxDifficulty,
          totalMarks,
          duration,
          negativeMarking,
          negativeMarkingRatio,
          isActive,
          registrationStartAt: registrationStartAt
            ? new Date(registrationStartAt)
            : null,
          registrationEndAt: registrationEndAt
            ? new Date(registrationEndAt)
            : null,
          examDate: examDate ? new Date(examDate) : null,
        },
        include: {
          examSubjects: {
            include: {
              subject: true,
            },
          },
        },
      });
      ResponseUtil.success(res, exam, "Exam updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //DELETE /api/exams/[id]
  deleteExamById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const existingExam = await prisma.exam.findUnique({
        where: { code: id },
      });
      if (!existingExam) {
        ResponseUtil.error(res, "Exam not found", 404);
      }
      const exam = await prisma.exam.delete({
        where: { code: id },
      });
      ResponseUtil.success(res, exam, "Exam deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
