export type CoreMetrics = {
  accuracy: number;
  hintDependency: number;
  streakScore: number;
  totalAttempts: number;
  correctAttempts: number;
};

export type TrendMetrics = {
  consistency: number;
  improvement: number;
};

export type DifficultyMetrics = {
  difficultyScore: number;
  difficultyPerformance: {
    [difficulty: number]: number;
  };
  difficultyCounts: {
    [difficulty: number]: number;
  };
  subjectWeightedScores: {
    [subject: string]: number;
  };
  subjectDifficultyPerformance: {
    [subject: string]: {
      [difficulty: number]: number;
    };
  };
  subjectDifficultyCounts: {
    [subject: string]: {
      [difficulty: number]: number;
    };
  };
};

export type SpeedMetrics = {
  speedScore: number;
  avgTiming: number;
  avgReactionTime: number;
  optimalTiming: number;
};
