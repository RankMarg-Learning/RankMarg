/**
 * Adaptive Learning System - Rule Book & Configuration
 * 
 * This file contains all constants, rules, and configuration for the
 * intelligent adaptive question selection system. The system analyzes
 * user performance in real-time and adjusts question difficulty accordingly.
 * 
 * @version 1.0.0
 * @author RankMarg Development Team
 */

// ============================================================================
// PERFORMANCE ANALYSIS CONFIGURATION
// ============================================================================

/**
 * Number of recent attempts to analyze for performance calculation
 * Higher values = more stable but slower adaptation
 * Lower values = faster adaptation but more volatile
 */
export const PERFORMANCE_WINDOW = 5;

/**
 * Minimum number of attempts required before adaptive selection kicks in
 * Below this threshold, questions are served in default order
 */
export const MIN_ATTEMPTS_FOR_ADAPTATION = 2;

// ============================================================================
// DIFFICULTY ADJUSTMENT THRESHOLDS
// ============================================================================

/**
 * Consecutive correct answers needed to trigger difficulty increase
 * When user answers this many questions correctly in a row,
 * the system will start suggesting harder questions
 */
export const DIFFICULTY_JUMP_THRESHOLD = 3;

/**
 * Consecutive wrong answers that trigger difficulty decrease
 * When user gets this many questions wrong in a row,
 * the system will start suggesting easier questions
 */
export const DIFFICULTY_DROP_THRESHOLD = 2;

/**
 * Performance score threshold for increasing difficulty
 * Score ranges from -1 (struggling) to 1 (excelling)
 */
export const PERFORMANCE_BOOST_THRESHOLD = 0.6;

/**
 * Performance score threshold for decreasing difficulty
 * Below this score, easier questions will be prioritized
 */
export const PERFORMANCE_DROP_THRESHOLD = -0.4;

// ============================================================================
// DIFFICULTY LEVELS
// ============================================================================

export enum DifficultyLevel {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  VERY_HARD = 4,
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: "Easy",
  [DifficultyLevel.MEDIUM]: "Medium",
  [DifficultyLevel.HARD]: "Hard",
  [DifficultyLevel.VERY_HARD]: "Very Hard",
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: "text-green-600",
  [DifficultyLevel.MEDIUM]: "text-blue-600",
  [DifficultyLevel.HARD]: "text-orange-600",
  [DifficultyLevel.VERY_HARD]: "text-red-600",
};

export const DIFFICULTY_BG_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: "bg-green-50",
  [DifficultyLevel.MEDIUM]: "bg-blue-50",
  [DifficultyLevel.HARD]: "bg-orange-50",
  [DifficultyLevel.VERY_HARD]: "bg-red-50",
};

// ============================================================================
// SCORING WEIGHTS FOR QUESTION SELECTION
// ============================================================================

/**
 * Weights for different factors in adaptive question selection
 * All weights should sum to 1.0
 */
export const SELECTION_WEIGHTS = {
  /** Weight for how well question difficulty matches user's current level */
  DIFFICULTY_MATCH: 0.6,
  
  /** Weight for progressive learning (preference for nearby questions) */
  PROXIMITY: 0.2,
  
  /** Weight for variety (trying different approaches when stuck) */
  VARIETY: 0.2,
} as const;

// ============================================================================
// PERFORMANCE SCORING RULES
// ============================================================================

/**
 * Points awarded for each correct answer in performance calculation
 */
export const CORRECT_ANSWER_POINTS = 1;

/**
 * Points deducted for each wrong answer in performance calculation
 */
export const WRONG_ANSWER_POINTS = -1;

/**
 * Bonus points for maintaining a winning streak
 */
export const STREAK_BONUS = 2;

/**
 * Penalty points for having a losing streak
 */
export const STREAK_PENALTY = -2;

/**
 * Maximum performance score (normalized)
 */
export const MAX_PERFORMANCE_SCORE = 1;

/**
 * Minimum performance score (normalized)
 */
export const MIN_PERFORMANCE_SCORE = -1;

// ============================================================================
// ADAPTIVE SELECTION RULES
// ============================================================================

export const ADAPTIVE_RULES = {
  /**
   * When user is excelling (high performance score),
   * target difficulty increases by this amount
   */
  EXCELLENCE_DIFFICULTY_BOOST: 1,
  
  /**
   * When user is struggling (low performance score),
   * target difficulty decreases by this amount
   */
  STRUGGLE_DIFFICULTY_REDUCTION: 1,
  
  /**
   * Threshold for considering user to be "stuck" on current difficulty
   * If user has this many consecutive wrong answers, variety is prioritized
   */
  STUCK_THRESHOLD: 3,
  
  /**
   * When stuck, this multiplier is applied to variety score
   */
  VARIETY_BOOST_WHEN_STUCK: 1.5,
  
  /**
   * Maximum difficulty jump in a single adaptation
   */
  MAX_DIFFICULTY_JUMP: 2,
  
  /**
   * Minimum difficulty the system will suggest
   */
  MIN_DIFFICULTY: DifficultyLevel.EASY,
  
  /**
   * Maximum difficulty the system will suggest
   */
  MAX_DIFFICULTY: DifficultyLevel.VERY_HARD,
} as const;

// ============================================================================
// UI/UX CONFIGURATION
// ============================================================================

/**
 * Whether to auto-navigate to next adaptive question after submission
 */
export const AUTO_NAVIGATE_ENABLED = false;

/**
 * Delay (in milliseconds) before auto-navigating to next question
 */
export const AUTO_NAVIGATE_DELAY = 2000;

/**
 * Whether to show performance indicators in the UI
 */
export const SHOW_PERFORMANCE_INDICATOR = true;

/**
 * Whether to show difficulty level badge on questions
 */
export const SHOW_DIFFICULTY_BADGE = true;

/**
 * Whether to show adaptive suggestions tooltip
 */
export const SHOW_ADAPTIVE_TOOLTIP = true;

// ============================================================================
// ADAPTIVE LEARNING ALGORITHMS
// ============================================================================

export const ALGORITHMS = {
  /**
   * Algorithm: Performance Score Calculation
   * 
   * Formula:
   * score = (correct_count - wrong_count) / PERFORMANCE_WINDOW
   * 
   * With bonuses:
   * - If consecutive_correct >= DIFFICULTY_JUMP_THRESHOLD: score += STREAK_BONUS
   * - If consecutive_wrong >= DIFFICULTY_DROP_THRESHOLD: score += STREAK_PENALTY
   * 
   * Finally normalized to range [-1, 1]
   */
  PERFORMANCE_CALCULATION: "weighted_recent_with_streaks",
  
  /**
   * Algorithm: Target Difficulty Calculation
   * 
   * Formula:
   * target_difficulty = average_recent_difficulty + performance_score
   * 
   * Clamped to range [MIN_DIFFICULTY, MAX_DIFFICULTY]
   */
  TARGET_DIFFICULTY: "performance_adjusted_average",
  
  /**
   * Algorithm: Question Selection Scoring
   * 
   * Each question gets a score based on:
   * 1. Difficulty Match Score = 1 - |question_diff - target_diff| / 3
   * 2. Proximity Score = 1 - (question_index - current_index) / total_questions
   * 3. Variety Score = bonus if different difficulty when struggling
   * 
   * Total Score = (match * 0.6) + (proximity * 0.2) + (variety * 0.2)
   * 
   * Highest scoring question is selected
   */
  QUESTION_SELECTION: "multi_factor_weighted_scoring",
} as const;

// ============================================================================
// LEARNING PATTERNS & RECOMMENDATIONS
// ============================================================================

export const LEARNING_PATTERNS = {
  /**
   * Excelling Pattern: 
   * - Performance > 0.6
   * - 3+ consecutive correct
   * Action: Increase difficulty to maintain challenge
   */
  EXCELLING: {
    minScore: PERFORMANCE_BOOST_THRESHOLD,
    minStreak: DIFFICULTY_JUMP_THRESHOLD,
    action: "increase_difficulty",
    description: "User is performing well, increase challenge level",
  },
  
  /**
   * Struggling Pattern:
   * - Performance < -0.4
   * - 2+ consecutive wrong
   * Action: Decrease difficulty to build confidence
   */
  STRUGGLING: {
    maxScore: PERFORMANCE_DROP_THRESHOLD,
    minStreak: DIFFICULTY_DROP_THRESHOLD,
    action: "decrease_difficulty",
    description: "User needs support, provide easier questions",
  },
  
  /**
   * Stuck Pattern:
   * - Same difficulty, multiple failures
   * - Low performance for extended period
   * Action: Introduce variety, try different approach
   */
  STUCK: {
    maxScore: -0.5,
    sameErrorCount: 3,
    action: "introduce_variety",
    description: "User is stuck, try different question types or difficulty",
  },
  
  /**
   * Steady Pattern:
   * - Performance between -0.4 and 0.6
   * - Mixed results
   * Action: Maintain current difficulty level
   */
  STEADY: {
    minScore: PERFORMANCE_DROP_THRESHOLD,
    maxScore: PERFORMANCE_BOOST_THRESHOLD,
    action: "maintain_difficulty",
    description: "User is progressing steadily, continue current level",
  },
} as const;

// ============================================================================
// DEBUGGING & MONITORING
// ============================================================================

/**
 * Enable console logging for adaptive learning decisions
 * Set to true in development, false in production
 */
export const DEBUG_MODE = process.env.NODE_ENV === "development";

/**
 * Log levels for different types of information
 */
export const LOG_LEVELS = {
  PERFORMANCE: DEBUG_MODE,
  SELECTION: DEBUG_MODE,
  NAVIGATION: DEBUG_MODE,
  SCORING: DEBUG_MODE,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get difficulty label from difficulty number
 */
export const getDifficultyLabel = (difficulty: number): string => {
  return DIFFICULTY_LABELS[difficulty as DifficultyLevel] || "Unknown";
};

/**
 * Get difficulty color class from difficulty number
 */
export const getDifficultyColor = (difficulty: number): string => {
  return DIFFICULTY_COLORS[difficulty as DifficultyLevel] || "text-gray-600";
};

/**
 * Get difficulty background color class from difficulty number
 */
export const getDifficultyBgColor = (difficulty: number): string => {
  return DIFFICULTY_BG_COLORS[difficulty as DifficultyLevel] || "bg-gray-50";
};

/**
 * Determine learning pattern from performance metrics
 */
export const identifyLearningPattern = (
  performanceScore: number,
  consecutiveCorrect: number,
  consecutiveWrong: number
): keyof typeof LEARNING_PATTERNS => {
  if (
    performanceScore >= LEARNING_PATTERNS.EXCELLING.minScore &&
    consecutiveCorrect >= LEARNING_PATTERNS.EXCELLING.minStreak
  ) {
    return "EXCELLING";
  }
  
  if (
    performanceScore <= LEARNING_PATTERNS.STRUGGLING.maxScore &&
    consecutiveWrong >= LEARNING_PATTERNS.STRUGGLING.minStreak
  ) {
    return "STRUGGLING";
  }
  
  if (
    performanceScore <= LEARNING_PATTERNS.STUCK.maxScore &&
    consecutiveWrong >= LEARNING_PATTERNS.STUCK.sameErrorCount
  ) {
    return "STUCK";
  }
  
  return "STEADY";
};

/**
 * Calculate difficulty adjustment based on performance
 */
export const calculateDifficultyAdjustment = (
  performanceScore: number
): number => {
  if (performanceScore >= PERFORMANCE_BOOST_THRESHOLD) {
    return ADAPTIVE_RULES.EXCELLENCE_DIFFICULTY_BOOST;
  }
  
  if (performanceScore <= PERFORMANCE_DROP_THRESHOLD) {
    return -ADAPTIVE_RULES.STRUGGLE_DIFFICULTY_REDUCTION;
  }
  
  return 0;
};

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export const ADAPTIVE_LEARNING_CONFIG = {
  PERFORMANCE_WINDOW,
  MIN_ATTEMPTS_FOR_ADAPTATION,
  DIFFICULTY_JUMP_THRESHOLD,
  DIFFICULTY_DROP_THRESHOLD,
  PERFORMANCE_BOOST_THRESHOLD,
  PERFORMANCE_DROP_THRESHOLD,
  SELECTION_WEIGHTS,
  ADAPTIVE_RULES,
  LEARNING_PATTERNS,
  AUTO_NAVIGATE_ENABLED,
  AUTO_NAVIGATE_DELAY,
  SHOW_PERFORMANCE_INDICATOR,
  SHOW_DIFFICULTY_BADGE,
  SHOW_ADAPTIVE_TOOLTIP,
  DEBUG_MODE,
  LOG_LEVELS,
} as const;

export default ADAPTIVE_LEARNING_CONFIG;

