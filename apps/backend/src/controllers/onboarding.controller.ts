import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { AuthUtil } from "@/utils/auth.util";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";
import { NotificationService } from "@/services/notification.service";

export class OnboardingController {
  createOnboarding = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        phone,
        examCode,
        gradeLevel,
        targetYear,
        studyHoursPerDay,
        selectedTopics,
      } = req.body;

      const userId = req.user.id;
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          phone: phone || null,
          standard: gradeLevel,
          targetYear,
          studyHoursPerDay,
          onboardingCompleted: true,
          examRegistrations: {
            create: {
              examCode,
            },
          },
        },
        select: { name: true },
      });
      if (
        selectedTopics &&
        Array.isArray(selectedTopics) &&
        selectedTopics.length > 0
      ) {
        const topicIds = selectedTopics.map((topic) => topic.id);
        const topicsData = await prisma.topic.findMany({
          where: { id: { in: topicIds } },
          select: { id: true, subjectId: true },
        });

        const topicSubjectMap = Object.fromEntries(
          topicsData.map((topic) => [topic.id, topic.subjectId])
        );

        const currentStudyTopicsData = selectedTopics
          .filter((topic) => topicSubjectMap[topic.id])
          .map((topic) => ({
            userId: userId,
            subjectId: topicSubjectMap[topic.id],
            topicId: topic.id,
            isCurrent: true,
            isCompleted: false,
            startedAt: new Date(),
          }));

        if (currentStudyTopicsData.length > 0) {
          await prisma.currentStudyTopic.deleteMany({
            where: {
              userId: userId,
              topicId: { in: topicIds },
            },
          });

          await prisma.currentStudyTopic.createMany({
            data: currentStudyTopicsData,
          });
        }
      }

      //*NOTE:update token in cookie

      AuthUtil.updateTokenCookie(req, res, (payload) => ({
        ...payload,
        isNewUser: false,
        examCode: examCode,
      }));

      // Send welcome notification
      try {
        const template = NotificationService.templates.welcomeUser(user.name);
        await NotificationService.createAndDeliverToUser(
          userId,
          template.type,
          template.title,
          template.message
        );
      } catch (notificationError) {
        console.error("Error sending welcome notification:", notificationError);
      }

      ResponseUtil.success(
        res,
        null,
        "Onboarding information saved successfully",
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
  createOnboardingSession = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const currentTopics = await prisma.currentStudyTopic.findMany({
        where: {
          userId: userId,
          isCurrent: true,
          isCompleted: false,
        },
        select: {
          subjectId: true,
          topicId: true,
        },
      });
      if (!currentTopics.length) {
        ResponseUtil.error(res, "No current topic found", 404);
      }
      const subjectTopicsMap = new Map<string, { topicIds: string[] }>();
      currentTopics.forEach((cst) => {
        if (!subjectTopicsMap.has(cst.subjectId)) {
          subjectTopicsMap.set(cst.subjectId, {
            topicIds: [],
          });
        }
        subjectTopicsMap.get(cst.subjectId)?.topicIds.push(cst.topicId);
      });
      const createdSessionIds: string[] = [];
      const sessionErrors: Array<{ subjectId: string; error: string }> = [];

      await Promise.all(
        Array.from(subjectTopicsMap.entries()).map(
          async ([subjectId, subjectData]) => {
            try {
              const questionsFromTopics = await prisma.question.findMany({
                where: {
                  topicId: { in: subjectData.topicIds },
                  isPublished: true,
                  difficulty: { lte: 2 },
                },
                select: { id: true },
                take: 5,
                orderBy: { createdAt: "desc" },
              });
              const remainingCount = Math.max(
                0,
                5 - questionsFromTopics.length
              );
              const questionsFromSubject =
                remainingCount > 0
                  ? await prisma.question.findMany({
                      where: {
                        subjectId,
                        isPublished: true,
                        difficulty: { lte: 2 },
                        id: { notIn: questionsFromTopics.map((q) => q.id) },
                      },
                      select: { id: true },
                      take: remainingCount,
                      orderBy: { createdAt: "desc" },
                    })
                  : [];
              const subjectQuestionIds = [
                ...questionsFromTopics,
                ...questionsFromSubject,
              ].map((q) => q.id);
              if (!subjectQuestionIds.length) {
                console.warn(`No questions found for subject: ${subjectId}`);
              }
              const practiceSession = await prisma.practiceSession.create({
                data: {
                  userId: userId,
                  subjectId,
                  questionsSolved: 0,
                  correctAnswers: 0,
                  isCompleted: false,
                  startTime: new Date(),
                  duration: subjectQuestionIds.length * 2,
                },
              });
              await prisma.practiceSessionQuestions.createMany({
                data: subjectQuestionIds.map((questionId) => ({
                  practiceSessionId: practiceSession.id,
                  questionId,
                })),
              });
              createdSessionIds.push(practiceSession.id);
            } catch (error) {
              console.error(
                `Error creating session for subject ${subjectId}:`,
                error
              );
              sessionErrors.push({
                subjectId,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            }
          }
        )
      );
      if (createdSessionIds.length === 0) {
        ResponseUtil.error(res, "Failed to create any practice sessions", 500);
      }
      ResponseUtil.success(
        res,
        createdSessionIds,
        "Practice sessions created successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}
