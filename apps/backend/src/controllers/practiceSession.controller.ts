import { getDayWindow } from "@/lib/dayRange";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";

type SessionType = "all" | "individual" | "today";
export class PracticeSessionController {
  //[GET] /api/practice-session
  getPracticeSessions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { _subjectId, _done_item, _count, _type, _subtopic_limit } =
        req.query;
      const done = _done_item === "true";
      const count = _count ? parseInt(_count as string) : undefined;
      const type = _type as SessionType;
      const subtopicLimit = _subtopic_limit
        ? parseInt(_subtopic_limit as string)
        : 10;
      if (
        count !== undefined &&
        subtopicLimit <= 0 &&
        !["all", "individual", "today"].includes(type)
      ) {
        ResponseUtil.error(res, "Invalid count, type or subtopic_limit", 400);
      }
      let queryWhere: any = {
        userId,
        ...(_subjectId ? { subjectId: _subjectId } : {}),
        ...(done ? { isCompleted: true } : {}),
      };
      if (type === "today") {
        const { from, to } = getDayWindow();
        queryWhere.createdAt = {
          gte: from,
          lt: to,
        };
      }
      const practiceSessions = await prisma.practiceSession.findMany({
        where: queryWhere,
        orderBy: { createdAt: "desc" },
        ...(count ? { take: count } : {}),
        select: {
          id: true,
          createdAt: true,
          correctAnswers: true,
          questionsSolved: true,
          duration: true,
          subjectId: true,
          startTime: true,
          isCompleted: true,
          questions: {
            select: {
              questionId: true,
            },
          },
        },
      });
      if (practiceSessions.length === 0) {
        ResponseUtil.success(res, [], "No practice sessions found", 200);
      }
      const subjectIds = Array.from(
        new Set(practiceSessions.map((s) => s.subjectId).filter(Boolean))
      ) as string[];
      let subjects = [];
      let subjectMap: Record<string, string> = {};

      if (subjectIds.length > 0) {
        subjects = await prisma.subject.findMany({
          where: { id: { in: subjectIds } },
          select: { id: true, name: true },
        });
        subjectMap = subjects.reduce(
          (acc, subject) => {
            acc[subject.id] = subject.name;
            return acc;
          },
          {} as Record<string, string>
        );
      }

      const questionIds = practiceSessions.flatMap(
        (s) => s.questions?.map((q) => q.questionId) || []
      );
      let questions = [];
      let questionsMap: Record<string, any> = {};

      if (questionIds.length > 0) {
        questions = await prisma.question.findMany({
          where: {
            id: { in: questionIds },
          },
          select: {
            id: true,
            difficulty: true,
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
            subTopic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        questionsMap = questions.reduce(
          (acc, q) => {
            acc[q.id] = q;
            return acc;
          },
          {} as Record<string, any>
        );
      }
      const sessionIds = practiceSessions.map((s) => s.id);
      let lastAttemptMap: Record<string, Date> = {};

      if (sessionIds.length > 0) {
        const lastAttempts = await prisma.attempt.findMany({
          where: {
            practiceSessionId: { in: sessionIds },
          },
          orderBy: {
            solvedAt: "desc",
          },
          distinct: ["practiceSessionId"],
          select: {
            practiceSessionId: true,
            solvedAt: true,
          },
        });

        lastAttemptMap = lastAttempts.reduce(
          (acc, attempt) => {
            if (attempt.practiceSessionId && attempt.solvedAt) {
              acc[attempt.practiceSessionId] = attempt.solvedAt;
            }
            return acc;
          },
          {} as Record<string, Date>
        );
      }

      const formatted = practiceSessions.map((session) => {
        // Safely get session questions
        const sessionQuestions = (session.questions || [])
          .map((q) => questionsMap[q.questionId])
          .filter(Boolean);

        // Group topics and subtopics
        const topicsMap: Record<
          string,
          { id: string; name: string; count: number }
        > = {};
        const subtopicsMap: Record<
          string,
          { id: string; name: string; count: number }
        > = {};

        // Calculate average difficulty
        let totalDifficulty = 0;
        let difficultyCounts = 0;

        sessionQuestions.forEach((question) => {
          if (question?.difficulty && typeof question.difficulty === "number") {
            totalDifficulty += question.difficulty;
            difficultyCounts++;
          }

          // Track topics
          if (question?.topic?.id && question?.topic?.name) {
            const topicId = question.topic.id;
            if (!topicsMap[topicId]) {
              topicsMap[topicId] = {
                id: topicId,
                name: question.topic.name,
                count: 0,
              };
            }
            topicsMap[topicId].count++;
          }

          // Track subtopics
          if (question?.subTopic?.id && question?.subTopic?.name) {
            const subtopicId = question.subTopic.id;
            if (!subtopicsMap[subtopicId]) {
              subtopicsMap[subtopicId] = {
                id: subtopicId,
                name: question.subTopic.name,
                count: 0,
              };
            }
            subtopicsMap[subtopicId].count++;
          }
        });

        // Sort topics and subtopics by count
        const sortedTopics = Object.values(topicsMap).sort(
          (a, b) => b.count - a.count
        );
        const sortedSubtopics = Object.values(subtopicsMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, Math.max(1, subtopicLimit)); // Ensure at least 1 subtopic if available

        const avgDifficulty =
          difficultyCounts > 0
            ? Math.round(((totalDifficulty / difficultyCounts) * 10) / 10)
            : 0;

        const correctAnswers = session.correctAnswers ?? 0;
        const questionsSolved = session.questionsSolved ?? 0;
        const totalQuestions = session.questions?.length ?? 0;

        const score = `${correctAnswers}/${questionsSolved}`;
        const accuracy =
          questionsSolved > 0
            ? Math.round((correctAnswers / questionsSolved) * 100)
            : 0;

        // Base response that all types will have
        const baseResponse = {
          id: session.id,
          date: session.createdAt?.toISOString() || new Date().toISOString(),
          title:
            session.subjectId && subjectMap[session.subjectId]
              ? subjectMap[session.subjectId]
              : "Unknown Subject",
          questionsAttempted: questionsSolved,
          totalQuestions: totalQuestions,
          score,
          accuracy,
          duration: session.duration || 0,
          isCompleted: session.isCompleted ?? false,
        };

        // Type-specific responses
        if (type === "today") {
          return {
            ...baseResponse,
            difficultyLevel: avgDifficulty,
            startTime: session.startTime?.toISOString() || null,
            lastAttempt:
              session.id in lastAttemptMap
                ? lastAttemptMap[session.id].toISOString()
                : null,
            keySubtopics: sortedSubtopics.map((st) => st.name),
            timeRequired: session?.duration || 0,
          };
        } else {
          // "all" or other types
          return {
            ...baseResponse,
            topicName: sortedTopics.length > 0 ? sortedTopics[0].name : "N/A",
            subtopics: sortedSubtopics.map((st) => st.name),
          };
        }
      });
      ResponseUtil.success(
        res,
        formatted,
        "Practice sessions retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/practice-session/ai
  getAiPracticeSessions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { sessionCount } = req.query;
      const count = sessionCount ? parseInt(sessionCount as string) : 12;
      const sessions = await prisma.practiceSession.findMany({
        where: {
          userId: userId.trim(),
        },
        select: {
          id: true,
          userId: true,
          subjectId: true,
          questionsSolved: true,
          correctAnswers: true,
          isCompleted: true,
          createdAt: true,
          attempts: {
            select: {
              timing: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: count,
      });
      const validSessions = sessions.filter((session) => {
        if (!session.id || !session.createdAt) {
          console.warn(
            `Invalid session data found: ${JSON.stringify(session)}`
          );
          return false;
        }
        return true;
      });
      if (validSessions.length === 0) {
        ResponseUtil.success(res, [], "No practice sessions found", 200);
      }
      const subjectIds = validSessions
        .filter(
          (session) =>
            session.subjectId && typeof session.subjectId === "string"
        )
        .map((session) => session.subjectId);
      let subjects = [];
      if (subjectIds.length > 0) {
        subjects = await prisma.subject.findMany({
          where: { id: { in: subjectIds } },
          select: { id: true, name: true },
        });
      }
      const subjectMap = new Map();
      subjects.forEach((subject) => {
        if (subject && subject.id && subject.name) {
          subjectMap.set(subject.id, subject.name);
        }
      });
      const formattedSessions = [];
      for (const session of validSessions) {
        const questionsSolved = Number(session.questionsSolved) || 0;
        const correctAnswers = Number(session.correctAnswers) || 0;

        // Validate that correctAnswers doesn't exceed questionsSolved
        const validCorrectAnswers = Math.min(correctAnswers, questionsSolved);

        // Calculate total time with error handling
        let totalTimeSeconds = 0;
        if (Array.isArray(session.attempts)) {
          totalTimeSeconds = session.attempts.reduce((total, attempt) => {
            const timing = Number(attempt?.timing) || 0;
            return total + Math.max(0, timing); // Ensure non-negative
          }, 0);
        }

        const minutes = Math.floor(totalTimeSeconds / 60);
        const seconds = Math.floor(totalTimeSeconds % 60);

        // Format date with error handling
        let formattedDate;
        try {
          const date = new Date(session.createdAt);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
          }
          formattedDate = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}, ${date.getFullYear()}`;
        } catch (dateError) {
          console.error("Error formatting date:", dateError);
          formattedDate = "Invalid Date";
        }

        // Calculate accuracy with validation
        const accuracy =
          questionsSolved > 0
            ? Math.round((validCorrectAnswers / questionsSolved) * 100)
            : 0;

        // Ensure accuracy is within valid range
        const validAccuracy = Math.max(0, Math.min(100, accuracy));

        // Generate suggestion based on performance
        let suggestion;
        if (validAccuracy >= 90) {
          suggestion = "Mastered";
        } else if (validAccuracy >= 75) {
          suggestion = "Strong";
        } else if (validAccuracy >= 60) {
          suggestion = "Review";
        } else if (validAccuracy >= 40) {
          suggestion = "Practice";
        } else {
          suggestion = "Study";
        }

        const formattedSession = {
          id: session.id,
          subject: subjectMap.get(session.subjectId) || "Unknown Subject",
          date: formattedDate,
          score: `${validCorrectAnswers}/${questionsSolved}`,
          accuracy: validAccuracy,
          time: `${minutes}m ${seconds}s`,
          suggestion: suggestion,
          userId: session.userId,
        };

        formattedSessions.push(formattedSession);
      }
      if (formattedSessions.length === 0) {
        ResponseUtil.success(res, [], "No practice sessions found", 200);
      }
      ResponseUtil.success(
        res,
        formattedSessions,
        "Practice sessions retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/practice-session/ai/[sessionId]
  getAiPracticeSessionById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const practiceSession = await prisma.practiceSession.findUnique({
        where: {
          id: sessionId,
          userId: userId,
        },
        select: {
          id: true,
          userId: true,
          isCompleted: true,

          // minimal question projection
          questions: {
            select: {
              question: {
                select: {
                  id: true,
                  slug: true,
                  content: true,
                  type: true,
                  isNumerical: true,
                  difficulty: true,
                  hint: true,
                  solution: true,
                  strategy: true,
                  commonMistake: true,

                  topic: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },

                  options: {
                    select: {
                      id: true,
                      content: true,
                      isCorrect: true,
                    },
                    orderBy: { id: "asc" }, // keep deterministic order
                  },
                },
              },
            },
          },

          // minimal attempts projection – only what the UI needs
          attempts: {
            select: {
              id: true,
              questionId: true,
              answer: true,
            },
          },
        },
      });
      if (!practiceSession) {
        ResponseUtil.success(res, [], "Practice session not found", 200);
      }
      ResponseUtil.success(
        res,
        practiceSession,
        "Practice session retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}
