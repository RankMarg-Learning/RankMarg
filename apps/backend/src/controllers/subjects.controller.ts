import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
  Vary: "Authorization",
} as const;

export class SubjectsController {
  getSubjects = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const examCode = req.query.examCode as string;

      let subjects;

      if (examCode && examCode !== "undefined") {
        const examSubjects = await prisma.examSubject.findMany({
          where: { examCode },
          select: { subject: true },
        });
        subjects = examSubjects.map((es) => es.subject);
      } else {
        subjects = await prisma.subject.findMany({
          orderBy: { name: "asc" },
        });
      }

      ResponseUtil.success(
        res,
        subjects,
        "Subjects fetched successfully",
        200,
        undefined,
        CACHE_HEADERS
      );
    } catch (error) {
      next(error);
    }
  };
  createSubject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, shortName } = req.body;

      const subject = await prisma.subject.create({
        data: { name, shortName },
      });

      ResponseUtil.success(res, subject, "Subject created successfully", 201);
    } catch (error) {
      next(error);
    }
  };
  getSubjectById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const subject = await prisma.subject.findUnique({
        where: { id },
      });

      if (!subject) {
        ResponseUtil.error(res, "Subject not found", 404);
        return;
      }

      ResponseUtil.success(
        res,
        subject,
        "Subject fetched successfully",
        200,
        undefined,
        CACHE_HEADERS
      );
    } catch (error) {
      next(error);
    }
  };
  updateSubjectById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, shortName } = req.body;

      const subject = await prisma.subject.update({
        where: { id },
        data: { name, shortName },
      });

      ResponseUtil.success(res, subject, "Subject updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  deleteSubjectById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      await prisma.subject.delete({
        where: { id },
      });

      ResponseUtil.success(res, null, "Subject deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
