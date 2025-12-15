import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";

export class ReportController {
  getAllReports = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        page = 1,
        limit = 25,
        type,
        search,
        slug,
      } = req.query;

      const l = Number(limit) || 25;
      const skip = (Number(page) - 1) * l;

      const whereClause: any = {};

      if (type) {
        whereClause.type = type as string;
      }

      if (slug) {
        whereClause.slug = slug as string;
      }

      if (search) {
        whereClause.OR = [
          { feedback: { contains: search as string, mode: "insensitive" } },
          { type: { contains: search as string, mode: "insensitive" } },
          { slug: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const [reports, total] = await Promise.all([
        prisma.reportQuestion.findMany({
          where: whereClause,
          select: {
            id: true,
            slug: true,
            type: true,
            feedback: true,
            createdAt: true,
            userId: true,
          },
          orderBy: { createdAt: "desc" },
          skip: skip as number,
          take: l as number,
        }),
        prisma.reportQuestion.count({ where: whereClause }),
      ]);

      // Get user details for reports
      const userIds = [...new Set(reports.map((r) => r.userId).filter(Boolean))];
      const users = userIds.length > 0 ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }) : [];
      const userMap = new Map(users.map((u) => [u.id, u]));

      // Get question details for each report
      const slugs = [...new Set(reports.map((r) => r.slug))];
      const questions = await prisma.question.findMany({
        where: { slug: { in: slugs } },
        select: {
          slug: true,
          title: true,
          id: true,
          subject: {
            select: { name: true },
          },
          topic: {
            select: { name: true },
          },
        },
      });

      const questionMap = new Map(
        questions.map((q) => [q.slug, q])
      );

      // Get report counts per question
      const reportCounts = await prisma.reportQuestion.groupBy({
        by: ["slug"],
        where: {
          slug: { in: slugs },
        },
        _count: {
          slug: true,
        },
      });

      const reportCountMap = new Map(
        reportCounts.map((rc) => [rc.slug, rc._count.slug])
      );

      const reportsWithDetails = reports.map((report) => ({
        ...report,
        question: questionMap.get(report.slug) || null,
        reportCount: reportCountMap.get(report.slug) || 0,
        user: userMap.get(report.userId) || null,
      }));

      const currentPage = Number(page);
      const totalPages = Math.ceil(total / l);

      const payload = {
        reports: reportsWithDetails,
        currentPage,
        totalPages,
        totalCount: total,
      };

      ResponseUtil.success(
        res,
        payload,
        "Reports fetched successfully",
        200
      );
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
            userId: true,
          },
          orderBy: { createdAt: "desc" },
          skip: skip as number,
          take: l as number,
        }),
        prisma.reportQuestion.count({ where: { slug } }),
      ]);

      // Get user details for reports
      const userIds = [...new Set(reports.map((r) => r.userId).filter(Boolean))];
      const users = userIds.length > 0 ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }) : [];
      const userMap = new Map(users.map((u) => [u.id, u]));

      const reportsWithUsers = reports.map((report) => ({
        ...report,
        user: userMap.get(report.userId) || null,
      }));

      const currentPage = Number(page);
      const totalPages = Math.ceil(total / l);

      const payload = {
        reports: reportsWithUsers,
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

  deleteReport = async (
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
