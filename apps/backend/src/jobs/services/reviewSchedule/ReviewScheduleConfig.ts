/**
 * Configuration constants for Review Schedule Service
 * Optimized for Competitive Exams (NEET/JEE)
 */

export const PHASE_CONFIG = {
  ACQUISITION: {
    name: 'ACQUISITION',
    baseInterval: 0.25, // 6 hours
    maxInterval: 3,
    requiredReviews: 3,
    masteryThreshold: 30,
    intervalProgression: [0.25, 0.5, 1, 2, 3], // 6h, 12h, 1d, 2d, 3d
  },
  CONSOLIDATION: {
    name: 'CONSOLIDATION',
    baseInterval: 3,
    maxInterval: 10,
    requiredReviews: 5,
    masteryThreshold: 50,
    intervalProgression: [3, 5, 7, 10], // 3d, 5d, 7d, 10d
  },
  PROFICIENCY: {
    name: 'PROFICIENCY',
    baseInterval: 10,
    maxInterval: 21,
    requiredReviews: 7,
    masteryThreshold: 70,
    intervalProgression: [10, 14, 18, 21], // 10d, 2w, 2.5w, 3w
  },
  MASTERY: {
    name: 'MASTERY',
    baseInterval: 21,
    maxInterval: 45,
    requiredReviews: 10,
    masteryThreshold: 85,
    intervalProgression: [21, 30, 38, 45], // 3w, 1m, 5w, 6w
  },
  MAINTENANCE: {
    name: 'MAINTENANCE',
    baseInterval: 45,
    maxInterval: 90,
    requiredReviews: 15,
    masteryThreshold: 95,
    intervalProgression: [45, 60, 75, 90], // 6w, 2m, 2.5m, 3m
  },
} as const;

export const EXAM_URGENCY_WINDOWS = {
  CRITICAL: { days: 7, name: 'CRITICAL' as const },
  HIGH: { days: 21, name: 'HIGH' as const },
  MEDIUM: { days: 45, name: 'MEDIUM' as const },
  LOW: { days: 90, name: 'LOW' as const },
} as const;

export const EF_MIN = 1.2;
export const EF_MAX = 3.8;
export const EF_INITIAL = 2.5;

export const PERFORMANCE_WEIGHTS = {
  accuracy: 0.35,
  speed: 0.20,
  consistency: 0.20,
  confidence: 0.15,
  velocity: 0.10,
} as const;

export const MAX_DAILY_NEW_TOPICS = 5;
export const OPTIMAL_DAILY_REVIEWS = 15;
export const MAX_DAILY_REVIEWS = 30;

export type LearningPhase = 'ACQUISITION' | 'CONSOLIDATION' | 'PROFICIENCY' | 'MASTERY' | 'MAINTENANCE';
export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

