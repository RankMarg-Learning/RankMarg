export interface MasteryConfigOptions {
  decayFactor: number;
  timeWindow: number;
  freshDataThreshold: number;
  minAttempts: number;
  maxTimingOutlier: number;
  minTimingOutlier: number;
  masteryThresholds: {
    weak: number;
    strong: number;
    expert: number;
  };
  spaceReviewBonus: number;
  maxSpaceReviewBonusPerWindow: number;
  examCode?: string;
  adaptiveLearningFactor: number;
  difficultyWeighting: {
    easy: number;
    medium: number;
    hard: number;
  };
  userProfileWeighting: {
    studyHoursWeight: number;
    targetYearWeight: number;
    gradeWeight: number;
  };
  forgettingCurveParams: {
    initialRetention: number;
    decayRate: number;
    reviewBoost: number;
  };
  performanceMetrics: {
    accuracyWeight: number;
    speedWeight: number;
    consistencyWeight: number;
    improvementWeight: number;
  };
  examSpecificConfig: Record<
    string,
    {
      idealTimePerQuestion: number;
      difficultyMultiplier: number;
      masteryThresholdAdjustment: number;
    }
  >;
}

export class MasteryConfig {
  public readonly decayFactor: number;
  public readonly timeWindow: number;
  public readonly freshDataThreshold: number;
  public readonly minAttempts: number;
  public readonly maxTimingOutlier: number;
  public readonly minTimingOutlier: number;
  public readonly masteryThresholds: {
    weak: number;
    strong: number;
    expert: number;
  };
  public readonly spaceReviewBonus: number;
  public readonly maxSpaceReviewBonusPerWindow: number;
  public examCode: string;

  public readonly adaptiveLearningFactor: number;
  public readonly difficultyWeighting: {
    easy: number;
    medium: number;
    hard: number;
  };
  public readonly userProfileWeighting: {
    studyHoursWeight: number;
    targetYearWeight: number;
    gradeWeight: number;
  };
  public readonly forgettingCurveParams: {
    initialRetention: number;
    decayRate: number;
    reviewBoost: number;
  };
  public readonly performanceMetrics: {
    accuracyWeight: number;
    speedWeight: number;
    consistencyWeight: number;
    improvementWeight: number;
  };
  public readonly examSpecificConfig: Record<
    string,
    {
      idealTimePerQuestion: number;
      difficultyMultiplier: number;
      masteryThresholdAdjustment: number;
    }
  >;

  constructor(options: MasteryConfigOptions) {
    this.decayFactor = options.decayFactor;
    this.timeWindow = options.timeWindow;
    this.freshDataThreshold = options.freshDataThreshold;
    this.minAttempts = options.minAttempts;
    this.maxTimingOutlier = options.maxTimingOutlier;
    this.minTimingOutlier = options.minTimingOutlier;
    this.masteryThresholds = options.masteryThresholds;
    this.spaceReviewBonus = options.spaceReviewBonus;
    this.maxSpaceReviewBonusPerWindow = options.maxSpaceReviewBonusPerWindow;
    this.examCode = options.examCode ?? "DEFAULT";
    this.adaptiveLearningFactor = options.adaptiveLearningFactor;
    this.difficultyWeighting = options.difficultyWeighting;
    this.userProfileWeighting = options.userProfileWeighting;
    this.forgettingCurveParams = options.forgettingCurveParams;
    this.performanceMetrics = options.performanceMetrics;
    this.examSpecificConfig = options.examSpecificConfig;
  }

  public getDifficultyWeight(difficulty: number): number {
    if (difficulty <= 2) return this.difficultyWeighting.easy;
    if (difficulty <= 4) return this.difficultyWeighting.medium;
    return this.difficultyWeighting.hard;
  }

  public getExamConfig(examCode: string) {
    return (
      this.examSpecificConfig[examCode] ||
      this.examSpecificConfig.DEFAULT || {
        idealTimePerQuestion: 90,
        difficultyMultiplier: 1.0,
        masteryThresholdAdjustment: 0.0,
      }
    );
  }

  public calculateForgettingCurve(daysSinceLastAttempt: number): number {
    const { initialRetention, decayRate } = this.forgettingCurveParams;
    return initialRetention * Math.exp(-decayRate * daysSinceLastAttempt);
  }
}

export const masteryConfig = new MasteryConfig({
  decayFactor: 0.15,
  timeWindow: 7,
  freshDataThreshold: 7,
  minAttempts: 2,
  maxTimingOutlier: 300,
  minTimingOutlier: 5,
  masteryThresholds: {
    weak: 0.48,
    strong: 0.82,
    expert: 0.95,
  },
  spaceReviewBonus: 0.1,
  maxSpaceReviewBonusPerWindow: 0.25,
  examCode: "NEET",
  adaptiveLearningFactor: 0.3,
  difficultyWeighting: {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
  },
  userProfileWeighting: {
    studyHoursWeight: 0.2,
    targetYearWeight: 0.15,
    gradeWeight: 0.1,
  },
  forgettingCurveParams: {
    initialRetention: 0.9,
    decayRate: 0.1,
    reviewBoost: 0.15,
  },
  performanceMetrics: {
    accuracyWeight: 0.4,
    speedWeight: 0.2,
    consistencyWeight: 0.25,
    improvementWeight: 0.15,
  },
  examSpecificConfig: {
    JEE: {
      idealTimePerQuestion: 144,
      difficultyMultiplier: 1.2,
      masteryThresholdAdjustment: 0.05,
    },
    NEET: {
      idealTimePerQuestion: 70,
      difficultyMultiplier: 1.0,
      masteryThresholdAdjustment: 0.0,
    },
    DEFAULT: {
      idealTimePerQuestion: 90,
      difficultyMultiplier: 1.0,
      masteryThresholdAdjustment: 0.0,
    },
  },
});
