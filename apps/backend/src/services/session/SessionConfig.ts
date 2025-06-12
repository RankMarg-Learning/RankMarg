import { SessionConfig } from "../../type/session.api.types";
import { QCategory, Stream } from "@prisma/client";

export function createDefaultSessionConfig(
  stream: Stream,
  grade: string,
  totalQuestions: number
): SessionConfig {
  const config: SessionConfig = {
    distribution: {
      currentTopic: 0.4,
      weakConcepts: 0.3,
      revisionTopics: 0.3,
    },
    stream: stream,
    totalQuestions: totalQuestions,
    questionCategoriesDistribution: getQuestionCategoriesByGrade(grade),
    difficultyDistribution: getDifficultyDistributionByGrade(
      grade,
      totalQuestions
    ),
  };

  return config;
}

export function getQuestionCategoriesByGrade(
  grade: string
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
    A_PLUS: [
      "TRAP",
      "MULTI_STEP",
      "OUT_OF_THE_BOX",
      "TRICKY",
      "HIGH_WEIGHTAGE",
      "CALCULATION",
    ],
  };

  return {
    grade: categories[grade] || categories["C"],
  };
}

export function getDifficultyDistributionByGrade(
  grade: string,
  totalQuestions: number
): { difficulty: number[] } {
  const percentMap: Record<string, number[]> = {
    D: [0.4, 0.35, 0.2, 0.05],
    C: [0.35, 0.35, 0.2, 0.1],
    B: [0.25, 0.35, 0.25, 0.15],
    A: [0.2, 0.3, 0.3, 0.2],
    "A+": [0.15, 0.25, 0.3, 0.3],
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

export function getSubjectDistribution(
  stream: Stream,
  totalQuestions: number
): Record<string, number> {
  let distribution: Record<string, number> = {};

  if (stream === "JEE") {
    distribution = {
      Physics: Math.floor(totalQuestions * 0.33),
      Chemistry: Math.floor(totalQuestions * 0.33),
      Mathematics: Math.floor(totalQuestions * 0.34),
    };
  } else if (stream === "NEET") {
    distribution = {
      Physics: Math.floor(totalQuestions * 0.25),
      Chemistry: Math.floor(totalQuestions * 0.25),
      Biology: Math.floor(totalQuestions * 0.5),
    };
  }

  return distribution;
}
