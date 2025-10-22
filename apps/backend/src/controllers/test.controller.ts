import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import {
  AttemptType,
  ExamType,
  Role,
  SubmitStatus,
  SubscriptionStatus,
  TestParticipationStatus,
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
    const { testId } = req.params;
    try {
      const userId = req.user.id;
      let where: any = {
        testId: testId,
      };
      if (req.user.role != Role.ADMIN) {
        where = {
          ...where,
          createdBy: userId,
        };
      }
      const test = await prisma.test.findUnique({
        where: where,
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

  //[GET] /api/test/ai/available
  getAiAvailableTests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { limit, type } = querySchemaAvailableTests.parse(req.query);
    try {
      const userId = req.user.id;
      const examCode = req.user.examCode;
      const subscriptionStatus = req.user.plan.status;

      const hasActiveSubscription =
        subscriptionStatus === SubscriptionStatus.ACTIVE;

      let userTestCount = 0;
      let isLimitExceeded = false;

      if (!hasActiveSubscription) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        userTestCount = await prisma.testParticipation.count({
          where: {
            userId: userId,
            status: "COMPLETED",
            endTime: {
              gte: monthStart,
            },
          },
        });

        isLimitExceeded = userTestCount >= 2;
      }

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
        where: {
          ...whereClause,
          testParticipation: {
            none: {
              userId: userId,
              status: TestParticipationStatus.COMPLETED,
            },
          },
        },
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

      const payload = {
        tests: availableTests,
        isLimitExceeded,
        userTestCount,
        monthlyLimit: 2,
      };

      ResponseUtil.success(res, payload, "Ok", 200);
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

      if (
        req.user.plan.status === SubscriptionStatus.EXPIRED ||
        req.user.plan.status === SubscriptionStatus.CANCELLED
      ) {
        ResponseUtil.error(
          res,
          "Upgrade your plan to get recommended tests",
          403
        );
      }

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
          visibility: Visibility.PUBLIC,
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
      ResponseUtil.success(res, recommendedTest, "Ok", 200, null, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      });
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

  //[GET] /api/test/:testId/analysis
  getTestAnalysisById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { testId } = req.params;
    try {
      const userId = req.user.id;

      // Check if user has participated in this test
      const participant = await prisma.testParticipation.findFirst({
        where: {
          testId: testId,
          userId: userId,
        },
      });

      if (!participant) {
        ResponseUtil.error(res, "You haven't participated in this test", 403);
        return;
      }

      // Get comprehensive test data with all relations
      const testData = await prisma.testParticipation.findFirst({
        where: {
          userId: userId,
          testId: testId,
        },
        include: {
          test: {
            include: {
              testSection: {
                include: {
                  testQuestion: {
                    include: {
                      question: {
                        select: {
                          id: true,
                          slug: true,
                          title: true,
                          content: true,
                          difficulty: true,
                          subject: {
                            select: {
                              id: true,
                              name: true,
                              shortName: true,
                            },
                          },
                          topic: {
                            select: {
                              id: true,
                              name: true,
                              subjectId: true,
                              weightage: true,
                            },
                          },
                          subTopic: {
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
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          attempt: {
            include: {
              question: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  difficulty: true,
                  subject: {
                    select: {
                      id: true,
                      name: true,
                      shortName: true,
                    },
                  },
                  topic: {
                    select: {
                      id: true,
                      name: true,
                      subjectId: true,
                      weightage: true,
                    },
                  },
                  subTopic: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!testData) {
        ResponseUtil.error(res, "Test data not found", 404);
        return;
      }

      // Generate comprehensive analysis
      const analysis = this.generateTestAnalysis(testData);

      ResponseUtil.success(res, analysis, "Test analysis generated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  // Helper method to generate comprehensive test analysis
  private generateTestAnalysis = (testData: any) => {
    const { test, attempt, score, accuracy, timing, startTime, endTime } = testData;
    
    // Section A: Test Overview & Performance Summary
    const sectionA = this.generateSectionA(testData);
    
    // Section B: Performance Metrics & Statistics
    const sectionB = this.generateSectionB(testData);
    
    // Section C: Time Analysis
    const sectionC = this.generateSectionC(testData);
    
    // Section D: Difficulty Analysis
    const sectionD = this.generateSectionD(testData);
    
    // Section E: Subject-wise Analysis
    const sectionE = this.generateSectionE(testData);
    
    // Section F: Question-wise Analysis
    const sectionF = this.generateSectionF(testData);
    
    // Section G: Improvement Recommendations
    const sectionG = this.generateSectionG(testData);
    
    // Section H: Comparative Analysis
    const sectionH = this.generateSectionH(testData);

    return {
      sectionA,
      sectionB,
      sectionC,
      sectionD,
      sectionE,
      sectionF,
      sectionG,
      sectionH,
      metadata: {
        testId: test.testId,
        testTitle: test.title,
        examCode: test.examCode,
        examType: test.examType,
        analysisGeneratedAt: new Date().toISOString(),
      },
    };
  };

  // Section A: Test Overview & Performance Summary
  private generateSectionA = (testData: any) => {
    const { test, attempt, score, accuracy, timing, startTime, endTime } = testData;
    
    const totalQuestions = test.totalQuestions;
    const totalMarks = test.totalMarks;
    const testDuration = test.duration;
    
    // Calculate section-wise performance
    const sectionPerformance = test.testSection.map((section: any) => {
      const sectionQuestionIds = section.testQuestion.map((q: any) => q.questionId);
      const sectionAttempts = attempt.filter((att: any) => 
        sectionQuestionIds.includes(att.questionId)
      );
      
      const correctAttempts = sectionAttempts.filter((att: any) => att.status === 'CORRECT');
      const sectionScore = correctAttempts.length * (section.correctMarks || 0) - 
        (sectionAttempts.length - correctAttempts.length) * (section.negativeMarks || 0);
      
      return {
        sectionName: section.name,
        participantScore: sectionScore,
        totalMarks: section.testQuestion.length * (section.correctMarks || 0),
        correctAnswers: correctAttempts.length,
        totalQuestions: section.testQuestion.length,
        accuracy: sectionAttempts.length > 0 ? (correctAttempts.length / sectionAttempts.length) * 100 : 0,
      };
    });

    return {
      testTitle: test.title,
      examType: test.examType,
      examCode: test.examCode,
      participantScore: score || 0,
      totalMarks: totalMarks,
      accuracy: accuracy || 0,
      timeTaken: timing || 0,
      testDuration: testDuration,
      timeSaved: testDuration - (timing || 0),
      sectionPerformance,
      overallRank: null, // Will be calculated if needed
    };
  };

  // Section B: Performance Metrics & Statistics
  private generateSectionB = (testData: any) => {
    const { test, attempt } = testData;
    
    const totalQuestions = test.totalQuestions;
    const correct = attempt.filter((att: any) => att.status === 'CORRECT').length;
    const incorrect = attempt.filter((att: any) => att.status === 'INCORRECT').length;
    const unattempted = totalQuestions - correct - incorrect;
    
    // Difficulty-wise analysis
    const difficultyAnalysis = {
      easy: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      medium: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      very_hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    };

    attempt.forEach((att: any) => {
      const difficulty = att.question.difficulty;
      const difficultyKey = difficulty === 1 ? 'easy' : 
                           difficulty === 2 ? 'medium' : 
                           difficulty === 3 ? 'hard' : 'very_hard';
      
      difficultyAnalysis[difficultyKey].total++;
      if (att.status === 'CORRECT') {
        difficultyAnalysis[difficultyKey].correct++;
      } else if (att.status === 'INCORRECT') {
        difficultyAnalysis[difficultyKey].incorrect++;
      } else {
        difficultyAnalysis[difficultyKey].unattempted++;
      }
    });

    // Generate AI feedback
    const accuracy = (correct / totalQuestions) * 100;
    let feedback = '';
    let performanceLevel = '';

    if (accuracy >= 90) {
      performanceLevel = 'Excellent';
      feedback = `Outstanding performance! Your ${accuracy.toFixed(1)}% accuracy demonstrates exceptional understanding. You're well-prepared for the actual exam.`;
    } else if (accuracy >= 75) {
      performanceLevel = 'Very Good';
      feedback = `Great job! Your ${accuracy.toFixed(1)}% accuracy shows strong preparation. Focus on the ${unattempted} unattempted questions to maximize your score.`;
    } else if (accuracy >= 60) {
      performanceLevel = 'Good';
      feedback = `Good effort! Your ${accuracy.toFixed(1)}% accuracy indicates decent preparation. Review incorrect answers and practice more to improve.`;
    } else if (accuracy >= 40) {
      performanceLevel = 'Average';
      feedback = `Keep practicing! Your ${accuracy.toFixed(1)}% accuracy suggests you need more preparation. Focus on fundamentals and easier questions first.`;
    } else {
      performanceLevel = 'Needs Improvement';
      feedback = `Don't give up! Your ${accuracy.toFixed(1)}% accuracy indicates you need to strengthen your basics. Start with easier concepts and build up gradually.`;
    }

    return {
      statistics: {
        totalQuestions,
        correct,
        incorrect,
        unattempted,
        accuracy: accuracy.toFixed(1),
        performanceLevel,
      },
      difficultyAnalysis,
      feedback,
      strengths: this.identifyStrengths(difficultyAnalysis),
      weaknesses: this.identifyWeaknesses(difficultyAnalysis),
    };
  };

  // Section C: Time Analysis
  private generateSectionC = (testData: any) => {
    const { test, attempt } = testData;
    
    const examCode = test.examCode;
    const sectionTimings = examCode === "JEE" 
      ? [
          { name: "Physics", totalTime: 0, maxTime: 60, questions: 0 },
          { name: "Chemistry", totalTime: 0, maxTime: 60, questions: 0 },
          { name: "Mathematics", totalTime: 0, maxTime: 60, questions: 0 }
        ]
      : [
          { name: "Physics", totalTime: 0, maxTime: 60, questions: 0 },
          { name: "Chemistry", totalTime: 0, maxTime: 60, questions: 0 },
          { name: "Biology", totalTime: 0, maxTime: 60, questions: 0 }
        ];

    const questionTimings: any[] = [];
    const subjectTimeMap: any = {};

    attempt.forEach((att: any, index: number) => {
      const questionNumber = `Q${index + 1}`;
      const timing = att.timing || 0;
      const subject = att.question.subject.name.toLowerCase();
      
      // Update section timings
      const sectionIndex = sectionTimings.findIndex(
        (section: any) => section.name.toLowerCase() === subject
      );
      if (sectionIndex !== -1) {
        sectionTimings[sectionIndex].totalTime += timing;
        sectionTimings[sectionIndex].questions++;
      }

      // Track subject-wise timing
      if (!subjectTimeMap[subject]) {
        subjectTimeMap[subject] = { totalTime: 0, questionCount: 0 };
      }
      subjectTimeMap[subject].totalTime += timing;
      subjectTimeMap[subject].questionCount++;

      // Create question timing record
      const questionTiming: any = {
        question: questionNumber,
        physics: 0,
        chemistry: 0,
        biology: 0,
        mathematics: 0,
      };

      switch (subject) {
        case 'physics':
          questionTiming.physics = timing;
          break;
        case 'chemistry':
          questionTiming.chemistry = timing;
          break;
        case 'biology':
          questionTiming.biology = timing;
          break;
        case 'mathematics':
          questionTiming.mathematics = timing;
          break;
      }

      questionTimings.push(questionTiming);
    });

    // Calculate time efficiency
    const timeEfficiency = sectionTimings.map((section: any) => ({
      ...section,
      efficiency: section.questions > 0 ? (section.totalTime / section.questions) : 0,
      timeUtilization: (section.totalTime / section.maxTime) * 100,
    }));

    return {
      sectionTimings: timeEfficiency,
      questionTimings,
      subjectTimeMap,
      timeManagement: this.analyzeTimeManagement(sectionTimings),
    };
  };

  // Section D: Difficulty Analysis
  private generateSectionD = (testData: any) => {
    const { attempt } = testData;
    
    const difficultyAnalysis = {
      easy: { total: 0, correct: 0, incorrect: 0, unattempted: 0, avgTime: 0 },
      medium: { total: 0, correct: 0, incorrect: 0, unattempted: 0, avgTime: 0 },
      hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0, avgTime: 0 },
      very_hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0, avgTime: 0 },
    };

    const difficultyMap: any = { 1: "easy", 2: "medium", 3: "hard", 4: "very_hard" };
    const timeByDifficulty: any = { easy: [], medium: [], hard: [], very_hard: [] };

    attempt.forEach((att: any) => {
      const difficulty = difficultyMap[att.question.difficulty];
      if (difficulty) {
        difficultyAnalysis[difficulty].total++;
        timeByDifficulty[difficulty].push(att.timing || 0);
        
        if (att.status === 'CORRECT') {
          difficultyAnalysis[difficulty].correct++;
        } else if (att.status === 'INCORRECT') {
          difficultyAnalysis[difficulty].incorrect++;
        } else {
          difficultyAnalysis[difficulty].unattempted++;
        }
      }
    });

    // Calculate average time for each difficulty
    Object.keys(timeByDifficulty).forEach(difficulty => {
      const times = timeByDifficulty[difficulty];
      difficultyAnalysis[difficulty].avgTime = times.length > 0 
        ? times.reduce((sum: number, time: number) => sum + time, 0) / times.length 
        : 0;
    });

    return {
      difficultyWiseAnalysis: difficultyAnalysis,
      totalQuestions: attempt.length,
      difficultyInsights: this.generateDifficultyInsights(difficultyAnalysis),
    };
  };

  // Section E: Subject-wise Analysis
  private generateSectionE = (testData: any) => {
    const { test, attempt } = testData;
    
    const subjectAnalysis: any = {};
    
    attempt.forEach((att: any) => {
      const subjectName = att.question.subject.name;
      if (!subjectAnalysis[subjectName]) {
        subjectAnalysis[subjectName] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          totalTime: 0,
          avgTime: 0,
          accuracy: 0,
        };
      }
      
      subjectAnalysis[subjectName].total++;
      subjectAnalysis[subjectName].totalTime += att.timing || 0;
      
      if (att.status === 'CORRECT') {
        subjectAnalysis[subjectName].correct++;
      } else if (att.status === 'INCORRECT') {
        subjectAnalysis[subjectName].incorrect++;
      } else {
        subjectAnalysis[subjectName].unattempted++;
      }
    });

    // Calculate averages and accuracy
    Object.keys(subjectAnalysis).forEach(subject => {
      const data = subjectAnalysis[subject];
      data.avgTime = data.total > 0 ? data.totalTime / data.total : 0;
      data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    });

    return {
      subjectWiseAnalysis: subjectAnalysis,
      strongestSubject: this.findStrongestSubject(subjectAnalysis),
      weakestSubject: this.findWeakestSubject(subjectAnalysis),
      subjectRecommendations: this.generateSubjectRecommendations(subjectAnalysis),
    };
  };

  // Section F: Question-wise Analysis
  private generateSectionF = (testData: any) => {
    const { test, attempt } = testData;
    
    const allQuestions = test.testSection.flatMap((section: any) => 
      section.testQuestion.map((q: any) => q.question)
    );

    const questionAnalysis = allQuestions.map((question: any, index: number) => {
      const submission = attempt.find((att: any) => att.questionId === question.id);
      
      let status: 'correct' | 'incorrect' | 'unattempted' = 'unattempted';
      let timeTaken = 0;
      
      if (submission) {
        status = submission.status === 'CORRECT' ? 'correct' : 
                submission.status === 'INCORRECT' ? 'incorrect' : 'unattempted';
        timeTaken = submission.timing || 0;
      }

      return {
        questionNumber: index + 1,
        slug: question.slug,
        title: question.title,
        subject: question.subject.name,
        topic: question.topic.name,
        subTopic: question.subTopic?.name || 'N/A',
        difficulty: question.difficulty,
        status,
        timeTaken,
        isCorrect: status === 'correct',
        needsReview: status === 'incorrect' || status === 'unattempted',
      };
    });

    return {
      questionAnalysis,
      correctQuestions: questionAnalysis.filter((q: any) => q.status === 'correct'),
      incorrectQuestions: questionAnalysis.filter((q: any) => q.status === 'incorrect'),
      unattemptedQuestions: questionAnalysis.filter((q: any) => q.status === 'unattempted'),
      reviewRecommendations: this.generateReviewRecommendations(questionAnalysis),
    };
  };

  // Section G: Improvement Recommendations
  private generateSectionG = (testData: any) => {
    const { test, attempt } = testData;
    
    const recommendations = [];
    const accuracy = (attempt.filter((att: any) => att.status === 'CORRECT').length / attempt.length) * 100;
    
    if (accuracy < 60) {
      recommendations.push({
        type: 'fundamentals',
        priority: 'high',
        title: 'Strengthen Fundamentals',
        description: 'Focus on basic concepts and theory before attempting practice questions.',
        actionItems: [
          'Review NCERT textbooks thoroughly',
          'Practice basic concept questions',
          'Join study groups for doubt clarification',
        ],
      });
    }

    if (accuracy >= 60 && accuracy < 80) {
      recommendations.push({
        type: 'practice',
        priority: 'medium',
        title: 'Increase Practice',
        description: 'You have good fundamentals. Focus on more practice and speed.',
        actionItems: [
          'Solve more practice papers',
          'Work on time management',
          'Focus on weak subjects',
        ],
      });
    }

    if (accuracy >= 80) {
      recommendations.push({
        type: 'advanced',
        priority: 'low',
        title: 'Advanced Preparation',
        description: 'You are well-prepared. Focus on advanced topics and speed.',
        actionItems: [
          'Practice advanced problems',
          'Work on speed and accuracy',
          'Take mock tests regularly',
        ],
      });
    }

    return {
      recommendations,
      studyPlan: this.generateStudyPlan(testData),
      nextSteps: this.generateNextSteps(testData),
    };
  };

  // Section H: Comparative Analysis
  private generateSectionH = (testData: any) => {
    const { test, attempt } = testData;
    
    // This would typically compare with other students or previous attempts
    // For now, we'll provide basic comparative metrics
    
    const accuracy = (attempt.filter((att: any) => att.status === 'CORRECT').length / attempt.length) * 100;
    
    return {
      percentile: null, // Would need more data to calculate
      rank: null, // Would need more data to calculate
      comparisonWithAverage: {
        accuracy: accuracy,
        averageAccuracy: 65, // Placeholder
        performance: accuracy > 65 ? 'above' : 'below',
      },
      historicalComparison: null, // Would need previous test data
    };
  };

  // Helper methods for analysis
  private identifyStrengths = (difficultyAnalysis: any) => {
    const strengths = [];
    Object.keys(difficultyAnalysis).forEach(difficulty => {
      const data = difficultyAnalysis[difficulty];
      if (data.total > 0 && (data.correct / data.total) >= 0.8) {
        strengths.push(difficulty);
      }
    });
    return strengths;
  };

  private identifyWeaknesses = (difficultyAnalysis: any) => {
    const weaknesses = [];
    Object.keys(difficultyAnalysis).forEach(difficulty => {
      const data = difficultyAnalysis[difficulty];
      if (data.total > 0 && (data.correct / data.total) < 0.5) {
        weaknesses.push(difficulty);
      }
    });
    return weaknesses;
  };

  private analyzeTimeManagement = (sectionTimings: any[]) => {
    return sectionTimings.map(section => ({
      ...section,
      efficiency: section.questions > 0 ? (section.totalTime / section.questions) : 0,
      recommendation: section.totalTime > section.maxTime ? 'Spend less time' : 'Good time management',
    }));
  };

  private generateDifficultyInsights = (difficultyAnalysis: any) => {
    const insights = [];
    Object.keys(difficultyAnalysis).forEach(difficulty => {
      const data = difficultyAnalysis[difficulty];
      if (data.total > 0) {
        const accuracy = (data.correct / data.total) * 100;
        insights.push({
          difficulty,
          accuracy,
          insight: accuracy >= 80 ? 'Strong performance' : accuracy >= 60 ? 'Good performance' : 'Needs improvement',
        });
      }
    });
    return insights;
  };

  private findStrongestSubject = (subjectAnalysis: any) => {
    let strongest = null;
    let maxAccuracy = 0;
    Object.keys(subjectAnalysis).forEach(subject => {
      if (subjectAnalysis[subject].accuracy > maxAccuracy) {
        maxAccuracy = subjectAnalysis[subject].accuracy;
        strongest = subject;
      }
    });
    return strongest;
  };

  private findWeakestSubject = (subjectAnalysis: any) => {
    let weakest = null;
    let minAccuracy = 100;
    Object.keys(subjectAnalysis).forEach(subject => {
      if (subjectAnalysis[subject].accuracy < minAccuracy) {
        minAccuracy = subjectAnalysis[subject].accuracy;
        weakest = subject;
      }
    });
    return weakest;
  };

  private generateSubjectRecommendations = (subjectAnalysis: any) => {
    const recommendations = [];
    Object.keys(subjectAnalysis).forEach(subject => {
      const data = subjectAnalysis[subject];
      if (data.accuracy < 60) {
        recommendations.push({
          subject,
          priority: 'high',
          recommendation: `Focus more on ${subject}. Your accuracy is ${data.accuracy.toFixed(1)}%`,
        });
      }
    });
    return recommendations;
  };

  private generateReviewRecommendations = (questionAnalysis: any[]) => {
    return questionAnalysis
      .filter(q => q.needsReview)
      .slice(0, 10) // Top 10 questions to review
      .map(q => ({
        questionNumber: q.questionNumber,
        subject: q.subject,
        topic: q.topic,
        reason: q.status === 'incorrect' ? 'Incorrect answer' : 'Not attempted',
      }));
  };

  private generateStudyPlan = (testData: any) => {
    return {
      daily: 'Solve 20-30 practice questions daily',
      weekly: 'Take 2-3 mock tests per week',
      monthly: 'Review and analyze performance monthly',
    };
  };

  private generateNextSteps = (testData: any) => {
    return [
      'Review incorrect answers',
      'Practice weak subjects',
      'Take more mock tests',
      'Focus on time management',
    ];
  };
}
