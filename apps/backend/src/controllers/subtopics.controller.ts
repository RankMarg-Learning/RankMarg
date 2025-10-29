import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { Role } from "@repo/db/enums";
import { NextFunction, Response } from "express";

export class SubtopicsController {
  getSubtopics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const topicId = req.query.topicId as string;
    try {
      const subtopics = await prisma.subTopic.findMany({
        where: topicId ? { topicId } : undefined,
        include: {
          topic: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: {
          orderIndex: "asc",
        },
      });
      ResponseUtil.success(
        res,
        subtopics,
        "Subtopics fetched successfully",
        200,
        undefined,
        req.user.role !== Role.ADMIN ? 
        {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
          Vary: "Authorization",
        } : undefined
      );
    } catch (error) {
      next(error);
    }
  };
  createSubtopic = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { name, topicId, slug, orderIndex, estimatedMinutes } = req.body;
    try {
      const subtopic = await prisma.subTopic.create({
        data: { name, topicId, slug, orderIndex, estimatedMinutes },
      });
      ResponseUtil.success(res, subtopic, "Subtopic created successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  getSubtopicById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      const subtopic = await prisma.subTopic.findUnique({
        where: { id },
      });
      if (!subtopic) {
        ResponseUtil.error(res, "Subtopic not found", 404);
        return;
      }
      ResponseUtil.success(
        res,
        subtopic,
        "Subtopic fetched successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };
  updateSubtopicById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { name, topicId, slug, orderIndex, estimatedMinutes } = req.body;
    try {
      const subtopic = await prisma.subTopic.update({
        where: { id },
        data: { name, topicId, slug, orderIndex, estimatedMinutes },
      });
      ResponseUtil.success(res, subtopic, "Subtopic updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  deleteSubtopicById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      if (req.user.role === Role.ADMIN) {
        await prisma.subTopic.delete({
          where: { id },
        });
      } else {
        ResponseUtil.error(
          res,
          "You are not authorized to delete this subtopic",
          403
        );
      }
      ResponseUtil.success(res, null, "Subtopic deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
