import { DifficultyDistribution } from "@/types/exam.type";

export const subjectDifficultyWt = (
  difficulty: number,
  subjectDistribution: DifficultyDistribution
): number => {
  switch (difficulty) {
    case 1:
      return (subjectDistribution.easy_pct || 40.0) / 100;
    case 2:
      return (subjectDistribution.medium_pct || 40.0) / 100;
    case 3:
      return (subjectDistribution.hard_pct || 15.0) / 100;
    case 4:
      return (subjectDistribution.very_hard_pct || 5.0) / 100;
    default:
      return 0;
  }
};
