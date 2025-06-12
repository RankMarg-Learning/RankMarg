import prisma from "../../lib/prisma";
import { MetricType } from "@prisma/client";
import { StudentGradeCalculator } from "../session/StudentGradeCalculator";

interface PracticeSession {
  startTime: Date | null;
  duration: number | null;
}

export class PerformanceService {
  async processAllUsers() {
    const batchSize = 100;
    let offset = 0;

    while (true) {
      const userCount = await prisma.user.count();
      if (offset >= userCount) break;

      await this.processUserBatch(batchSize, offset);
      offset += batchSize;
    }
  }

  async processUserBatch(batchSize: number, offset: number) {
    const users = await prisma.user.findMany({
      select: { id: true },
      skip: offset,
      take: batchSize,
    });

    for (const user of users) {
      await this.updateUserPerformance(user.id);
    }
  }

  public async updateUserPerformance(userId: string) {
    const [
      attemptsData,
      correctAttemptsCount,
      testParticipations,
      subjectMasteries,
      recentPracticeSessions,
    ] = await Promise.all([
      prisma.attempt.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { timing: true },
      }),
      prisma.attempt.count({
        where: { userId, status: "CORRECT" },
      }),
      prisma.testParticipation.findMany({
        where: { userId, status: "COMPLETED" },
        select: {
          score: true,
          accuracy: true,
          timing: true,
          endTime: true,
        },
        orderBy: { endTime: "desc" },
        take: 10,
      }),
      prisma.subjectMastery.findMany({
        where: { userId },
        include: { subject: true },
      }),
      prisma.practiceSession.findMany({
        where: {
          userId,
          isCompleted: true,
          startTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          duration: true,
          startTime: true,
        },
      }),
    ]);

    const totalAttempts = attemptsData._count.id || 0;
    const accuracy =
      totalAttempts > 0 ? (correctAttemptsCount / totalAttempts) * 100 : 0;

    const recentTestScores = testParticipations.reverse().map((test) => ({
      score: test.score,
      accuracy: test.accuracy,
      timing: test.timing,
      date: test.endTime,
    }));

    const avgScore =
      testParticipations.length > 0
        ? testParticipations.reduce((sum, test) => sum + (test.score || 0), 0) /
          testParticipations.length
        : 0;

    const highestScore =
      testParticipations.length > 0
        ? Math.max(...testParticipations.map((test) => test.score || 0))
        : 0;

    const lowestScore =
      testParticipations.length > 0
        ? Math.min(...testParticipations.map((test) => test.score || 0))
        : 0;

    const lastExamDate =
      testParticipations.length > 0 ? testParticipations[0].endTime : null;

    const subjectWiseAccuracy = {} as Record<
      string,
      {
        accuracy: number;
        totalAttempts: number;
        correctAttempts: number;
        masteryLevel: number;
      }
    >;

    for (const mastery of subjectMasteries) {
      const subjectAccuracy =
        mastery.totalAttempts > 0
          ? (mastery.correctAttempts / mastery.totalAttempts) * 100
          : 0;

      subjectWiseAccuracy[mastery.subject.name] = {
        accuracy: subjectAccuracy,
        totalAttempts: mastery.totalAttempts,
        correctAttempts: mastery.correctAttempts,
        masteryLevel: mastery.masteryLevel,
      };
    }

    const avgDailyStudyHours = this.calculateAverageDailyStudyHours(
      recentPracticeSessions
    );

    const avgMasteryLevel =
      subjectMasteries.length > 0
        ? Math.round(
            subjectMasteries.reduce((sum, sm) => sum + sm.masteryLevel, 0) /
              subjectMasteries.length
          )
        : 0;

    const avgTestScore = Math.round(avgScore);

    const gradeCalculator = new StudentGradeCalculator();
    const studentGrade = await gradeCalculator.calculateGrade(userId);

    const tx = await prisma.$transaction(
      async (prisma) => {
        const updatedPerformance = await prisma.userPerformance.upsert({
          where: { userId },
          update: {
            totalAttempts,
            correctAttempts: correctAttemptsCount,
            accuracy,
            subjectWiseAccuracy,
            recentTestScores,
            highestScore,
            lowestScore,
            avgScore,
            lastExamDate,
            avgDailyStudyHours,
          },
          create: {
            userId,
            totalAttempts,
            correctAttempts: correctAttemptsCount,
            accuracy,
            subjectWiseAccuracy,
            recentTestScores,
            highestScore,
            lowestScore,
            avgScore,
            lastExamDate,
            avgDailyStudyHours,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { grade: studentGrade },
        });

        return {
          userPerformance: updatedPerformance,
          metrics: {
            TOTAL_QUESTIONS: totalAttempts,
            CORRECT_ATTEMPTS: correctAttemptsCount,
            MASTERY_LEVEL: avgMasteryLevel,
            TEST_SCORE: avgTestScore,
          },
        };
      },
      {
        timeout: 10000,
      }
    );

    await Promise.all([
      this.updateMetric(userId, "TOTAL_QUESTIONS", totalAttempts),
      this.updateMetric(userId, "CORRECT_ATTEMPTS", correctAttemptsCount),
      this.updateMetric(userId, "MASTERY_LEVEL", avgMasteryLevel),
      this.updateMetric(userId, "TEST_SCORE", avgTestScore),
    ]);

    return tx;
  }

  public async updateMetric(
    userId: string,
    metricType: MetricType,
    currentValue: number
  ) {
    const existingMetric = await prisma.metric.findFirst({
      where: { userId, metricType },
    });

    if (existingMetric) {
      await prisma.metric.update({
        where: { id: existingMetric.id },
        data: { currentValue },
      });
    } else {
      await prisma.metric.create({
        data: {
          userId,
          metricType,
          currentValue,
          previousValue: 0,
        },
      });
    }
  }

  public calculateAverageDailyStudyHours(practiceSessions: PracticeSession[]) {
    if (!practiceSessions || practiceSessions.length === 0) {
      return 0;
    }

    const sessionsByDay: Record<string, number> = {};
    practiceSessions.forEach((session) => {
      const day = session.startTime?.toISOString().split("T")[0];
      if (day) {
        if (!sessionsByDay[day]) {
          sessionsByDay[day] = 0;
        }
        sessionsByDay[day] += (session.duration || 0) / 60;
      }
    });

    const totalDays = Object.keys(sessionsByDay).length;
    const totalHours: number = Object.values(sessionsByDay).reduce(
      (sum: number, hours) => sum + Number(hours as number),
      0
    ) as number;

    return totalDays > 0 ? totalHours / totalDays : 0;
  }
}
