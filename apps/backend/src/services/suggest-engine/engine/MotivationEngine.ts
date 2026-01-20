import { CoachMood } from "../types/extended.types";
import { EnhancedAnalysis } from "../types/coach.types";

export class MotivationEngine {

    determineMood(analysis: EnhancedAnalysis): CoachMood {
        if (!analysis) {
            return "encouraging";
        }
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
