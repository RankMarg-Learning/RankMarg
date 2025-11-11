import { SessionConfig } from "../../types/session.api.types";
import { GradeEnum, QCategory } from "@repo/db/enums";
import { exam } from "../../constant/examJson";

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
    subjectwiseQuestions: getSubjectwiseQuestions(examCode,totalQuestions),
    attempts: {
      nDays: nDays,
      questionIds: [],
    },
    distribution: {
      currentTopic: 0.65,
      weakConcepts: 0.35,
      revisionTopics: 0.35,
    },
    questionCategoriesDistribution: getQuestionCategoriesByGrade(grade),
    difficultyDistribution: getDifficultyDistributionByGrade(
      grade,
      totalQuestions,
      examCode,
      undefined
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


export function getSubjectwiseQuestions(examCode: string,totalQuestions: number): { subjectId: string, questions: number }[] {
  const examData = exam[examCode as keyof typeof exam];
  return examData.subjects.map(subject => {
    return {
      subjectId: subject.id,
      questions: Math.round(totalQuestions * subject.share_percentage / 100),
    }
  });
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
  totalQuestions: number,
  examCode: string,
  subjectId?: string | undefined
): { difficulty: number[] } {

  const percentMap: Record<GradeEnum, number[]> = {
    D: [0.4, 0.35, 0.2, 0.05],
    C: [0.35, 0.35, 0.2, 0.1],
    B: [0.25, 0.4, 0.25, 0.1],
    A: [0.2, 0.3, 0.3, 0.2],
    A_PLUS: [0.15, 0.25, 0.3, 0.3],
  };

  const gradePercentages = percentMap[grade] || percentMap["C"];
  const gradeBlendWeight = 0.3;

  const examData = exam[examCode as keyof typeof exam];
  
  if (examData) {
    let difficultyDistribution;
    
    if (subjectId) {
      const subject = examData.subjects.find(sub => sub.id === subjectId);
      if (subject) {
        difficultyDistribution = subject.difficulty_distribution;
      }
    }
    
    if (!difficultyDistribution) {
      difficultyDistribution = examData.global_difficulty_bias;
    }
    
    if (difficultyDistribution) {
      const examPercentages = [
        difficultyDistribution.easy_pct / 100,
        difficultyDistribution.medium_pct / 100,
        difficultyDistribution.hard_pct / 100,
        difficultyDistribution.very_hard_pct / 100,
      ];

      const percentages = examPercentages.map(
        (p, i) => p * (1 - gradeBlendWeight) + gradePercentages[i] * gradeBlendWeight
      );
      
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
  }
  
  const percentages = gradePercentages;

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
  examCode: string,
  totalQuestions: number
): Record<string, number> {
  let distribution: Record<string, number> = {};

  if (examCode === "JEE") {
    distribution = {
      Physics: Math.floor(totalQuestions * 0.33),
      Chemistry: Math.floor(totalQuestions * 0.33),
      Mathematics: Math.floor(totalQuestions * 0.34),
    };
  } else if (examCode === "NEET") {
    distribution = {
      Physics: Math.floor(totalQuestions * 0.25),
      Chemistry: Math.floor(totalQuestions * 0.25),
      Biology: Math.floor(totalQuestions * 0.5),
    };
  }

  return distribution;
}
