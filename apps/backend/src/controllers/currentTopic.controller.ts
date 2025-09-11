import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { NextFunction, Response } from "express";

export class CurrentTopicController {
  getCurrentTopics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { subjectId, isCompleted, isCurrent } = req.query;
      const where: any = {};
      if (subjectId) where.subjectId = subjectId;
      if (isCurrent !== undefined) where.isCurrent = isCurrent === "true";
      if (isCompleted !== undefined) where.isCompleted = isCompleted === "true";
      if (userId) where.userId = userId;

      const topics = await prisma.currentStudyTopic.findMany({
        where,
        select: {
          isCurrent: true,
          isCompleted: true,
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          startedAt: true,
        },
        orderBy: { startedAt: "desc" },
      });
      //filter such that data will give proper json like subjectName, topicName, topicId, isCurrent, isCompleted, startedAt
      const uniqueSubjects = topics.map((subject: any) => {
        subject.topicName = subject.topic.name;
        subject.topicId = subject.topic.id;
        subject.subjectName = subject.subject.name;
        subject.subjectId = subject.subject.id;
        subject.isCurrent = subject.isCurrent;
        subject.isCompleted = subject.isCompleted;
        subject.startedAt = subject.startedAt;
        delete subject.subject;
        delete subject.topic;
        return subject;
      });
      ResponseUtil.success(
        res,
        uniqueSubjects,
        "Current topics fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
  getCurrentTopicsBySubjectId = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subjectId = req.params.subjectId;
      const userId = req.user.id;

      const topics = await prisma.currentStudyTopic.findMany({
        where: {
          userId,
          subjectId,
        },
        select: {
          topicId: true,
          isCurrent: true,
          isCompleted: true,
        },
        orderBy: { startedAt: "desc" },
      });
      ResponseUtil.success(
        res,
        topics,
        "Current topics fetched successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };
  updateCurrentTopicBySubjectId = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { subjectId, topicId } = req.body;
      if (!subjectId || !topicId) {
        ResponseUtil.error(res, "Subject and topic are required", 400);
      }
      const userId = req.user.id;
      const existingCurrentTopic = await prisma.currentStudyTopic.findFirst({
        where: { userId, subjectId, topicId, isCurrent: true },
      });
      if (existingCurrentTopic) {
        ResponseUtil.error(
          res,
          "This is already your current topic for this subject",
          400
        );
      }
      const isTargetAlreadyCurrent = await prisma.currentStudyTopic.findUnique({
        where: { userId_subjectId_topicId: { userId, subjectId, topicId } },
        select: { isCurrent: true },
      });
      const currentCountForSubject = await prisma.currentStudyTopic.count({
        where: { userId, subjectId, isCurrent: true },
      });
      if (currentCountForSubject >= 2 && !isTargetAlreadyCurrent?.isCurrent) {
        ResponseUtil.error(
          res,
          "You can have at most 2 current topics in this subject.",
          400
        );
      }

      // Upsert the selected topic as current without demoting others
      await prisma.currentStudyTopic.upsert({
        where: {
          userId_subjectId_topicId: { userId, subjectId, topicId },
        },
        update: {
          isCurrent: true,
          isCompleted: false,
          startedAt: new Date(),
        },
        create: {
          userId,
          subjectId,
          topicId,
          isCurrent: true,
          isCompleted: false,
          startedAt: new Date(),
        },
      });
      ResponseUtil.success(
        res,
        null,
        "Current topic updated successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };
  updateCurrentTopicBySubjectIdIsCompleted = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { subjectId, topicId, isCompleted } = req.body;
      if (!subjectId || !topicId || typeof isCompleted !== "boolean") {
        ResponseUtil.error(
          res,
          "Missing subject, topic, or isCompleted flag",
          400
        );
      }
      const userId = req.user.id;
      await prisma.currentStudyTopic.upsert({
        where: {
          userId_subjectId_topicId: { userId, subjectId, topicId },
        },
        update: {
          isCompleted,
          ...(isCompleted ? { isCurrent: false } : {}),
        },
        create: {
          userId,
          subjectId,
          topicId,
          isCurrent: false,
          isCompleted,
          startedAt: new Date(),
        },
      });
      ResponseUtil.success(
        res,
        null,
        "Current topic updated successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };
}
