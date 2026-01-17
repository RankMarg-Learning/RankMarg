import { CoachMood, ToneStyle } from "../types/extended.types";
import { EnhancedAnalysis } from "../types/coach.types";
import { ExamPhase } from "@repo/db/enums";

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

    /**
     * Select tone style based on phase and performance
     */
    selectTone(phase: string, performance: number): ToneStyle {
        // Final prep: Professional and focused
        if (phase === "final_prep") {
            return "professional";
        }

        // High performance: Energetic
        if (performance >= 75) {
            return "energetic";
        }

        // Low performance: Calm and supportive
        if (performance < 50) {
            return "calm";
        }

        // Default: Friendly
        return "friendly";
    }

    /**
     * Add motivational context to suggestion
     */
    addMotivationalContext(suggestion: string, mood: CoachMood): string {
        const prefix = this.getMotivationalPrefix(mood);
        const suffix = this.getMotivationalSuffix(mood);

        return `${prefix}${suggestion}${suffix}`;
    }

    /**
     * Get motivational prefix based on mood
     */
    private getMotivationalPrefix(mood: CoachMood): string {
        const prefixes: Record<CoachMood, string[]> = {
            encouraging: [
                "💪 ",
                "🎯 ",
                "📚 ",
                "✨ ",
                "",
            ],
            celebratory: [
                "🎉 ",
                "🌟 ",
                "🏆 ",
                "🔥 ",
                "⭐ ",
            ],
            corrective: [
                "⚠️ ",
                "📊 ",
                "🎓 ",
                "",
            ],
            motivating: [
                "🚀 ",
                "💯 ",
                "⚡ ",
                "🎯 ",
                "",
            ],
        };

        const options = prefixes[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Get motivational suffix based on mood
     */
    private getMotivationalSuffix(mood: CoachMood): string {
        const suffixes: Record<CoachMood, string[]> = {
            encouraging: [
                " Keep going!",
                " You've got this!",
                " Stay consistent!",
                "",
            ],
            celebratory: [
                " Amazing work!",
                " Keep it up!",
                " Fantastic!",
                " Outstanding!",
                "",
            ],
            corrective: [
                " Let's fix this.",
                " Time to improve.",
                " Focus needed.",
                "",
            ],
            motivating: [
                " Let's do this!",
                " Time to shine!",
                " Make it count!",
                " Push harder!",
                "",
            ],
        };

        const options = suffixes[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Generate personalized greeting based on time and mood
     */
    generateGreeting(userName: string, mood: CoachMood): string {
        const hour = new Date().getHours();
        let timeGreeting = "Hello";

        if (hour < 12) {
            timeGreeting = "Good morning";
        } else if (hour < 17) {
            timeGreeting = "Good afternoon";
        } else {
            timeGreeting = "Good evening";
        }

        const greetings: Record<CoachMood, string[]> = {
            encouraging: [
                `${timeGreeting}, ${userName}! Ready to learn today?`,
                `Hey ${userName}! Let's make today count.`,
                `${timeGreeting}! Time for some focused practice, ${userName}.`,
            ],
            celebratory: [
                `${timeGreeting}, ${userName}! You're on fire! 🔥`,
                `Hey superstar! Great to see you, ${userName}!`,
                `${timeGreeting}, ${userName}! Your progress is amazing!`,
            ],
            corrective: [
                `${timeGreeting}, ${userName}. Let's get back on track.`,
                `Hey ${userName}, time to refocus and improve.`,
                `${timeGreeting}. Let's work on those gaps, ${userName}.`,
            ],
            motivating: [
                `${timeGreeting}, ${userName}! Let's crush today's goals!`,
                `Hey ${userName}! Time to level up!`,
                `${timeGreeting}! Ready to dominate, ${userName}?`,
            ],
        };

        const options = greetings[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Generate encouragement based on streak
     */
    generateStreakEncouragement(streak: number): string {
        if (streak === 0) {
            return "Start your streak today!";
        }

        if (streak === 1) {
            return "Great start! Keep the momentum going.";
        }

        if (streak < 7) {
            return `${streak} days strong! Don't break the chain.`;
        }

        if (streak < 30) {
            return `Wow! ${streak} days streak! You're building a habit.`;
        }

        return `Incredible ${streak} days streak! You're unstoppable! 🔥`;
    }

    /**
     * Generate exam proximity message
     */
    generateExamProximityMessage(daysUntilExam: number): string {
        if (daysUntilExam <= 30) {
            return `⏰ Just ${daysUntilExam} days until your exam! Every question counts.`;
        }

        if (daysUntilExam <= 60) {
            return `📅 ${daysUntilExam} days to go. Time to intensify your prep!`;
        }

        if (daysUntilExam <= 90) {
            return `🎯 ${daysUntilExam} days remaining. Build strong foundations now.`;
        }

        return `📚 ${daysUntilExam} days ahead. Focus on consistent practice.`;
    }

    /**
     * Generate performance-based encouragement
     */
    generatePerformanceMessage(accuracy: number, improvement: number): string {
        if (accuracy >= 80) {
            return "Excellent accuracy! You're mastering the concepts.";
        }

        if (accuracy >= 60) {
            if (improvement > 5) {
                return `Good progress! Your accuracy improved by ${improvement}%. Keep it up!`;
            }
            return "Solid performance. Let's aim for 80%+.";
        }

        if (accuracy >= 40) {
            if (improvement > 0) {
                return `You're improving! Up ${improvement}%. Stay focused.`;
            }
            return "Room for improvement. Focus on understanding concepts.";
        }

        return "Let's work on building stronger foundations. You can do this!";
    }
}
