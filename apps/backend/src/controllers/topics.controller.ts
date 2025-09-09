import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";

export class TopicsController {
  getTopics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const subjectId = req.query.subjectId as string;
    try {
      const topics = await prisma.topic.findMany({
        where: subjectId ? { subjectId } : {},
        orderBy: {
          orderIndex: "asc",
        },
      });
      ResponseUtil.success(res, topics, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
        Vary: "Authorization",
      });
    } catch (error) {
      next(error);
    }
  };
  createTopic = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { name, subjectId, weightage, slug, orderIndex, estimatedMinutes } =
      req.body;
    try {
      const topic = await prisma.topic.create({
        data: {
          name,
          subjectId,
          weightage,
          slug,
          orderIndex,
          estimatedMinutes,
        },
      });
      ResponseUtil.success(res, topic, "Topic created successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  getTopicById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      const topic = await prisma.topic.findUnique({
        where: { id },
      });
      if (!topic) {
        ResponseUtil.error(res, "Topic not found", 404);
      }
      ResponseUtil.success(
        res,
        topic,
        "Topic fetched successfully",
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
  updateTopicById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { name, subjectId, weightage, slug, orderIndex, estimatedMinutes } =
      req.body;
    try {
      const topic = await prisma.topic.update({
        where: { id },
        data: {
          name,
          subjectId,
          weightage,
          slug,
          orderIndex,
          estimatedMinutes,
        },
      });
      ResponseUtil.success(res, topic, "Topic updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  deleteTopicById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    try {
      await prisma.topic.delete({
        where: { id },
      });
      ResponseUtil.success(res, null, "Topic deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
