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
  };
  spaceReviewBonus: number;
  maxSpaceReviewBonusPerWindow: number;
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
  };
  public readonly spaceReviewBonus: number;
  public readonly maxSpaceReviewBonusPerWindow: number;

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
  }
}


export const masteryConfig = new MasteryConfig({
  decayFactor: 0.15, // Lambda value for exponential decay
  timeWindow: 7, // Days to consider for mastery calculation
  freshDataThreshold: 7, // Recent days that might need special handling
  minAttempts: 2, // Minimum attempts needed for a valid mastery score
  maxTimingOutlier: 300, // Maximum seconds for a valid attempt timing
  minTimingOutlier: 5, // Minimum seconds for a valid attempt timing
  masteryThresholds: {
    weak: 0.48, // Below this is considered weak
    strong: 0.82, // Above this is considered strong
  },
  spaceReviewBonus: 0.1, // Bonus for spaced reviews
  maxSpaceReviewBonusPerWindow: 0.25, // Cap on spaced review bonus
});
