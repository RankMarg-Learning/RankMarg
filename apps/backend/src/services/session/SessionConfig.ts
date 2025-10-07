import { prisma } from "@/lib/prisma";
import { SessionConfig } from "../../types/session.api.types";
import { GradeEnum, QCategory } from "@repo/db/enums";
import { exam } from "@/constant/examJson";
import { Constraints } from "@/types/exam.type";

export function createDefaultSessionConfig(
  userId: string,
  isPaidUser: boolean,
  examCode: string,
  totalQuestions: number,
  grade: GradeEnum,
  nDays: number = 28
): SessionConfig {
  const config: SessionConfig = {
    userId: userId,
    isPaidUser: isPaidUser,
    examCode,
    grade: grade,
    totalQuestions: totalQuestions,
    attempts: {
      nDays: nDays,
      questionIds: [],
    },
    distribution: {
      currentTopic: 0.5,
      weakConcepts: 0.3,
      revisionTopics: 0.2,
    },
    questionCategoriesDistribution: getQuestionCategoriesByGrade(grade),
    subjectDistribution: {},
    difficultyDistribution: getDifficultyDistributionByGrade(
      grade,
      totalQuestions
    ),
    preferences: {
      singleTopicPerWeakConcepts: true,
      singleTopicPerRevision: true,
      weakTopicStrategy: "mixed",
      revisionTopicStrategy: "due_first",
    },
  };

  return config;
}

export function getQuestionCategoriesByGrade(
  grade: GradeEnum
): Record<string, QCategory[]> {
  const categories: Record<string, QCategory[]> = {
    D: [
      "CONFIDENCE_BASED",
      "MEMORY_BASED",
      "FORMULA_BASED",
      "THEORETICAL",
      "FACTUAL",
    ],
    C: [
      "CONCEPTUAL",
      "APPLICATION",
      "FORMULA_BASED",
      "CONFIDENCE_BASED",
      "MEMORY_BASED",
    ],
    B: ["CONCEPTUAL", "MULTI_STEP", "ELIMINATION_BASED", "CALCULATION", "TRAP"],
    A: [
      "TRAP",
      "APPLICATION",
      "TRICKY",
      "OUT_OF_THE_BOX",
      "CALCULATION",
      "MULTI_STEP",
    ],
    A_PLUS: ["TRAP", "MULTI_STEP", "OUT_OF_THE_BOX", "TRICKY", "CALCULATION"],
  };

  return {
    grade: categories[grade] || categories["C"],
  };
}

export function getDifficultyDistributionByGrade(
  grade: GradeEnum,
  totalQuestions: number
): { difficulty: number[] } {
  const percentMap: Record<GradeEnum, number[]> = {
    D: [0.4, 0.35, 0.2, 0.05],
    C: [0.35, 0.35, 0.2, 0.1],
    B: [0.25, 0.4, 0.25, 0.1],
    A: [0.2, 0.3, 0.3, 0.2],
    A_PLUS: [0.15, 0.25, 0.3, 0.3],
  };

  const percentages = percentMap[grade] || percentMap["C"];

  const raw = percentages.map((p) => p * totalQuestions);
  const base = raw.map(Math.floor);
  const remainder = totalQuestions - base.reduce((sum, val) => sum + val, 0);

  const indicesByFraction = raw
    .map((val, i) => ({ i, frac: val - base[i] }))
    .sort((a, b) => b.frac - a.frac);

  for (let i = 0; i < remainder; i++) {
    base[indicesByFraction[i].i]++;
  }

  return { difficulty: base };
}

export async function getSubjectDistributionAdaptive(
  userId: string,
  examCode: string,
  grade: GradeEnum
): Promise<Record<string, number>> {
  const questionCount = await getAdaptiveQuestionCount(
    userId,
    15,
    examCode,
    grade
  );
  const examData = exam[examCode];

  const constraints = examData.constraints as Constraints;
  const minSubjectQuestions = constraints.min_subject_questions;
  const maxSubjectQuestions = constraints.max_subject_questions;

  const subjectDistribution: Record<string, number> = examData.subjects.reduce(
    (acc, subject) => {
      acc[subject.id] = Math.floor(
        (subject.share_percentage / 100) * questionCount
      );
      if (acc[subject.id] < minSubjectQuestions) {
        acc[subject.id] = minSubjectQuestions;
      }
      if (acc[subject.id] > maxSubjectQuestions) {
        acc[subject.id] = maxSubjectQuestions;
      }
      return acc;
    },
    {} as Record<string, number>
  );
  return subjectDistribution;
}

export async function getAdaptiveQuestionCount(
  userId: string,
  defaultQuestions: number = 15,
  examCode: string,
  grade: GradeEnum
): Promise<number> {
  const examData = exam[examCode];
  const constraints = examData.constraints;

  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  const recentAttempts = await prisma.attempt.findMany({
    where: {
      userId: userId,
      solvedAt: {
        gte: fourDaysAgo,
      },
    },
    select: {
      status: true,
      solvedAt: true,
    },
  });

  if (recentAttempts.length === 0) {
    return defaultQuestions;
  }

  const totalAttempts = recentAttempts.length;
  const correctAttempts = recentAttempts.filter(
    (attempt) => attempt.status === "CORRECT"
  ).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  const daysActive = Math.max(
    1,
    Math.ceil((Date.now() - fourDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avgAttemptsPerDay = totalAttempts / daysActive;

  const gradeThresholds = {
    D: { minAccuracy: 0.4, minAttemptsPerDay: 3, maxIncrease: 0.3 },
    C: { minAccuracy: 0.5, minAttemptsPerDay: 4, maxIncrease: 0.4 },
    B: { minAccuracy: 0.6, minAttemptsPerDay: 5, maxIncrease: 0.5 },
    A: { minAccuracy: 0.7, minAttemptsPerDay: 6, maxIncrease: 0.6 },
    A_PLUS: { minAccuracy: 0.8, minAttemptsPerDay: 7, maxIncrease: 0.7 },
  };

  const thresholds =
    gradeThresholds[grade as keyof typeof gradeThresholds] || gradeThresholds.C;

  let adaptiveMultiplier = 1.0;

  const meetsAccuracyThreshold = accuracy >= thresholds.minAccuracy;
  const meetsAttemptsThreshold =
    avgAttemptsPerDay >= thresholds.minAttemptsPerDay;

  if (meetsAccuracyThreshold && meetsAttemptsThreshold) {
    const accuracyBonus = Math.min(
      (accuracy - thresholds.minAccuracy) / (1 - thresholds.minAccuracy),
      1
    );
    const attemptsBonus = Math.min(
      (avgAttemptsPerDay - thresholds.minAttemptsPerDay) /
        (thresholds.minAttemptsPerDay * 0.5),
      1
    );

    const combinedBonus = (accuracyBonus + attemptsBonus) / 2;
    adaptiveMultiplier = 1 + combinedBonus * thresholds.maxIncrease;
  } else if (accuracy < thresholds.minAccuracy * 0.7) {
    adaptiveMultiplier = 0.8;
  }

  const adaptiveQuestions = Math.round(defaultQuestions * adaptiveMultiplier);

  const minQuestions = Math.max(
    constraints.min_questions,
    Math.floor(defaultQuestions * 0.5)
  );
  const maxQuestions = Math.min(
    constraints.max_questions,
    Math.floor(defaultQuestions * 2)
  );

  return Math.max(minQuestions, Math.min(maxQuestions, adaptiveQuestions));
}
