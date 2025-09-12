import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import {
  AttemptType,
  ExamType,
  SubmitStatus,
  TestStatus,
  Visibility,
} from "@repo/db/enums";
import { NextFunction, Response } from "express";
import z from "zod";

export interface TestSection {
  id?: string;
  testId?: string;
  name: string;
  isOptional: boolean;
  maxQuestions?: number;
  correctMarks?: number;
  negativeMarks?: number;
  testQuestion?: TestQuestion[];
}
export interface TestQuestion {
  id: string;
  title?: string;
  testSectionId?: string;
}

const querySchemaAvailableTests = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.nativeEnum(ExamType).optional(),
});

export class TestController {
  //[POST] /api/test
  createTest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        title,
        description,
        examCode,
        duration,
        testKey,
        testSection,
        startTime,
        endTime,
        examType,
        difficulty,
        status,
        visibility,
      } = req.body;

      const calculateTotalMarks = (
        testSections: {
          testQuestion: { id: string }[];
          maxQuestions?: number;
          isOptional: boolean;
          correctMarks: number;
        }[]
      ) => {
        return testSections.reduce((total, section) => {
          const consideredQuestions = section.isOptional
            ? Math.min(section.testQuestion.length, section.maxQuestions)
            : section.testQuestion.length;

          return total + consideredQuestions * section.correctMarks;
        }, 0);
      };
      const totalMarks = calculateTotalMarks(
        testSection.map((section) => ({
          testQuestion: section.testQuestion || [],
          maxQuestions: section.maxQuestions,
          isOptional: section.isOptional,
          correctMarks: section.correctMarks || 0,
        }))
      );
      const totalQuestions = testSection.reduce(
        (total, section) => total + section.testQuestion.length,
        0
      );

      await prisma.test.create({
        data: {
          title,
          description,
          examCode,
          totalMarks,
          totalQuestions,
          status,
          visibility,
          testKey,
          difficulty,
          examType,
          duration: duration,
          startTime: startTime,
          endTime: endTime,
          createdBy: req.user.id,
          testSection: {
            create: testSection.map((section: TestSection) => ({
              name: section.name,
              isOptional: section.isOptional,
              maxQuestions: section.maxQuestions,
              correctMarks: section.correctMarks,
              negativeMarks: section.negativeMarks,
              testQuestion: {
                create: section.testQuestion.map((question: TestQuestion) => ({
                  questionId: question.id,
                })),
              },
            })),
          },
        },
      });
      ResponseUtil.success(res, null, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test
  getTests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tests = await prisma.test.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      ResponseUtil.success(res, tests, "Tests fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  //[POST] /api/test/ai/join
  joinTest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { testId } = req.body;
      const userId = req.user.id;
      const isReJoin = await prisma.testParticipation.findFirst({
        where: {
          userId: userId,
          testId: testId,
        },
      });
      if (!isReJoin) {
        await prisma.testParticipation.create({
          data: {
            testId: testId,
            userId: userId,
          },
          include: {
            test: true,
            user: true,
          },
        });
      }

      await prisma.testParticipation.update({
        where: {
          userId_testId: {
            userId: userId,
            testId: testId,
          },
        },
        data: {
          status: "STARTED",
        },
      });
      ResponseUtil.success(res, null, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/:testId
  getTestById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.params;
    try {
      const test = await prisma.test.findUnique({
        where: {
          testId: testId,
        },
        include: {
          testSection: {
            include: {
              testQuestion: {
                select: {
                  question: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!test) {
        ResponseUtil.error(res, "Test not found", 404);
      }
      const formattedTest = {
        ...test,
        testSection: test?.testSection.map((section) => ({
          ...section,
          testQuestion: section.testQuestion.map((q) => ({
            id: q.question.id,
            title: q.question.title,
          })),
        })),
      };
      ResponseUtil.success(res, formattedTest, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[PUT] /api/test/:testId
  updateTestById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.params;
    const {
      title,
      description,
      examCode,
      duration,
      testKey,
      testSection,
      startTime,
      endTime,
      examType,
      difficulty,
      status,
      visibility,
    } = req.body;

    try {
      const calculateTotalMarks = (
        testSections: {
          testQuestion: { id: string }[];
          maxQuestions?: number;
          isOptional: boolean;
          correctMarks: number;
        }[]
      ) => {
        return testSections.reduce((total, section) => {
          const consideredQuestions = section.isOptional
            ? Math.min(section.testQuestion.length, section.maxQuestions)
            : section.testQuestion.length;

          return total + consideredQuestions * section.correctMarks;
        }, 0);
      };
      const totalMarks = calculateTotalMarks(
        testSection.map((section) => ({
          testQuestion: section.testQuestion || [],
          maxQuestions: section.maxQuestions,
          isOptional: section.isOptional,
          correctMarks: section.correctMarks || 0,
        }))
      );
      const totalQuestions = testSection.reduce(
        (total, section) => total + section.testQuestion.length,
        0
      );
      await prisma.test.update({
        where: { testId },
        data: {
          title,
          description,
          examCode,
          totalMarks,
          totalQuestions,
          status,
          visibility,
          testKey,
          difficulty,
          examType,
          duration,
          startTime,
          endTime,

          // Handle TestSection updates
          testSection: {
            deleteMany: {}, // Remove existing sections
            create: testSection.map((section: TestSection) => ({
              name: section.name,
              isOptional: section.isOptional,
              maxQuestions: section.maxQuestions,
              correctMarks: section.correctMarks,
              negativeMarks: section.negativeMarks,
              testQuestion: {
                create: section.testQuestion.map((question: TestQuestion) => ({
                  questionId: question.id,
                })),
              },
            })),
          },
        },
      });
      ResponseUtil.success(res, null, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[DELETE] /api/test/:testId
  deleteTestById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.body;
    try {
      const userId = req.user.id;
      const test = await prisma.test.findUnique({
        where: {
          testId: testId,
          createdBy: userId,
        },
      });

      if (!test) {
        ResponseUtil.error(res, "Test not found", 404);
      }

      await prisma.test.delete({
        where: {
          testId: test.testId,
        },
      });
      ResponseUtil.success(res, null, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/:testId/details
  getTestDetailsById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.params;
    try {
      const userId = req.user.id;
      const participant = await prisma.testParticipation.upsert({
        where: {
          userId_testId: {
            userId: userId,
            testId: testId,
          },
        },
        update: {},
        create: {
          testId: testId,
          userId: userId,
          status: "STARTED",
        },
      });
      if (!participant) {
        ResponseUtil.error(res, "Unauthorized", 401);
      }
      const test = await prisma.test.findUnique({
        where: {
          testId: testId,
        },
        include: {
          testSection: {
            include: {
              testQuestion: {
                include: {
                  question: {
                    include: {
                      options: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!test) {
        ResponseUtil.error(res, "Test not found", 404);
      }
      ResponseUtil.success(
        res,
        { ...test, testStatus: participant.status },
        "Ok",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/:testId/participant
  getTestParticipantById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.params;
    try {
      const userId = req.user.id;
      const participant = await prisma.testParticipation.findFirst({
        where: {
          testId: testId,
          userId: userId,
        },
      });
      if (!participant) {
        ResponseUtil.error(res, "Unauthorized", 401);
      }
      ResponseUtil.success(res, participant.status, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[POST] /api/test/:testId/submit
  submitTest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.params;
    const { submissions, marks, timing, counts, minimizeCount } = req.body;
    try {
      const userId = req.user.id;
      const participation = await prisma.testParticipation.findUnique({
        where: {
          userId_testId: {
            userId: userId,
            testId: testId,
          },
        },
        include: {
          test: {
            select: {
              endTime: true,
            },
          },
        },
      });
      if (!participation) {
        ResponseUtil.error(res, "Unauthorized", 401);
      }
      const answeredQuestions = submissions.filter(
        (q) =>
          q.status === SubmitStatus.CORRECT ||
          q.status === SubmitStatus.INCORRECT
      );
      const correctAnswers = submissions.filter(
        (q) => q.status === SubmitStatus.CORRECT
      );
      const accuracy =
        answeredQuestions.length > 0
          ? (correctAnswers.length / answeredQuestions.length) * 100
          : 0;
      const submissionsToStore = submissions.map((submission) => ({
        userId: userId,
        testParticipationId: participation.id,
        questionId: submission.questionId,
        type: AttemptType.TEST,
        answer: submission.answer,
        timing: submission.timing || 0,
        reactionTime: submission.timing ? submission.timing * 0.8 : 0,
        solvedAt: submission.submittedAt,
        status: submission.status,
      }));
      await prisma.attempt.createMany({
        data: submissionsToStore,
      });
      await prisma.testParticipation.update({
        where: {
          id: participation.id,
        },
        data: {
          status: "COMPLETED",
          endTime: new Date(),
          score: marks,
          timing,
          accuracy,
          cntAnswered: counts.cntAnswered,
          cntNotAnswered: counts.cntNotAnswered,
          cntMarkForReview: counts.cntMarkForReview,
          cntAnsweredMark: counts.cntAnsweredMark,
          cntMinmize: minimizeCount,
        },
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          coins: {
            increment: 5,
          },
        },
      });
      ResponseUtil.success(
        res,
        { TestEnd: participation.test.endTime },
        "Ok",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/ai/available
  getAiAvailableTests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { limit, type } = querySchemaAvailableTests.parse(req.query);
    try {
      const examCode = req.user.examCode;
      const whereClause = {
        status: TestStatus.ACTIVE,
        visibility: Visibility.PUBLIC,
        ...(type
          ? { examType: type }
          : {
              examType: {
                in: [ExamType.FULL_LENGTH, ExamType.SUBJECT_WISE, ExamType.PYQ],
              },
            }),
        ...(examCode && { examCode }),
      };
      const availableTests = await prisma.test.findMany({
        where: whereClause,
        select: {
          testId: true,
          title: true,
          description: true,
          totalMarks: true,
          totalQuestions: true,
          difficulty: true,
          duration: true,
          examType: true,
          startTime: true,
          endTime: true,
          createdAt: true,
          examCode: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      ResponseUtil.success(res, availableTests, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/ai/recommended
  getAiRecommendedTests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const weakestSubject = await prisma.subjectMastery.findFirst({
        where: { userId },
        orderBy: { masteryLevel: "asc" },
        select: {
          subject: {
            select: {
              id: true,
            },
          },
        },
      });
      const weakestSubjectId = weakestSubject?.subject?.id;

      const recommendedTest = await prisma.test.findFirst({
        where: {
          ...(weakestSubjectId
            ? {
                testSection: {
                  some: {
                    testQuestion: {
                      some: {
                        question: {
                          subjectId: weakestSubjectId,
                        },
                      },
                    },
                  },
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        select: {
          testId: true,
          title: true,
          description: true,
          totalMarks: true,
          totalQuestions: true,
          difficulty: true,
          duration: true,
          status: true,
          visibility: true,
          examType: true,
          startTime: true,
          endTime: true,
          createdAt: true,
          updatedAt: true,
          examCode: true,
        },
      });
      if (!recommendedTest) {
        ResponseUtil.success(res, null, "No recommended tests found", 200);
      }
      ResponseUtil.success(res, recommendedTest, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/ai/results
  getAiTestResults = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { limit: limitParam } = req.query;
    try {
      const userId = req.user.id;
      const limit = parseInt(limitParam as string) || 10;
      const testResults = await prisma.testParticipation.findMany({
        where: {
          userId,
          status: "COMPLETED",
        },
        include: {
          test: {
            select: {
              testId: true,
              title: true,
              description: true,
              examCode: true,
              totalMarks: true,
              totalQuestions: true,
              difficulty: true,
              duration: true,
              examType: true,
            },
          },
        },
        orderBy: {
          endTime: "desc",
        },
        take: limit,
      });
      if (testResults.length === 0) {
        ResponseUtil.success(res, null, "No completed tests found", 200);
      }
      ResponseUtil.success(res, testResults, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/test/ai/scheduled
  getAiScheduledTests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const examCode = req.user.examCode;
      const now = new Date();

      const upcomingTests = await prisma.test.findMany({
        where: {
          examCode,
          startTime: { gt: now },
          status: "ACTIVE",
          visibility: "PUBLIC",
        },
        orderBy: { startTime: "asc" },
        select: {
          testId: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          difficulty: true,
          duration: true,
          totalMarks: true,
          totalQuestions: true,
          examType: true,
        },
      });
      if (upcomingTests.length === 0) {
        ResponseUtil.success(res, null, "No upcoming tests found", 200);
      }
      ResponseUtil.success(res, upcomingTests, "Ok", 200);
    } catch (error) {
      next(error);
    }
  };
}
