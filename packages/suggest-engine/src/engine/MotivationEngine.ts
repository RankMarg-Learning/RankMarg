import { CoachMood } from "../types/extended.types";
import { EnhancedAnalysis } from "../types/coach.types";

/**
 * MotivationEngine
 * 
 * Adds motivational intelligence to suggestions based on student state.
 * Determines mood, tone, and adds context-aware motivational elements.
 */
export class MotivationEngine {
    /**
     * Determine coaching mood based on analysis
     */
    determineMood(analysis: EnhancedAnalysis): CoachMood {
        // Celebratory: High accuracy + good streak
        if (
            analysis.accuracy >= 75 &&
            analysis.consistencyMetrics.currentStreak >= 3
        ) {
            return "celebratory";
        }

        // Corrective: Low accuracy or many skipped days
        if (
            analysis.accuracy < 50 ||
            analysis.consistencyMetrics.missedDays >= 3
        ) {
            return "corrective";
        }

        // Motivating: Exam proximity or phase transition
        if (
            analysis.daysUntilExam <= 90 ||
            analysis.examPhase === "final_prep"
        ) {
            return "motivating";
        }

        // Default: Encouraging
        return "encouraging";
    }
}
