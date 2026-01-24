import prisma from "@repo/db";
import { SuggestionType, SuggestionCategory, TriggerType } from "@repo/db/enums";
import { CoachSuggestion } from "../types/coach.types";
import { SuggestionHandler } from "../types";
import { DailyCoachOrchestrator } from "../orchestrator/DailyCoachOrchestrator";


export class NewUserSuggestionHandler implements SuggestionHandler {
    async generate(userId: string): Promise<void> {
        try {
            const suggestions = await this.generateOnboardingSuggestions(userId);

            const suggestionData = suggestions.map((suggestion, index) => ({
                userId,
                type: suggestion.type,
                triggerType: TriggerType.ONBOARDING,
                suggestion: suggestion.message,
                category: suggestion.category,
                priority: suggestion.priority ?? index + 1,
                sequenceOrder: suggestion.sequenceOrder ?? index + 1,
                actionName: suggestion.actionName,
                actionUrl: suggestion.actionUrl,
                status: "ACTIVE",
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
            }));

            await prisma.studySuggestion.createMany({
                data: suggestionData,
            });

            console.log(`[NewUserSuggestionHandler] Generated ${suggestions.length} onboarding suggestions for user ${userId}`);
        } catch (error) {
            console.error(`[NewUserSuggestionHandler] Error generating onboarding suggestions for user ${userId}:`, error);
            throw error;
        }
    }

    private async generateOnboardingSuggestions(userId: string): Promise<CoachSuggestion[]> {
        const suggestions: CoachSuggestion[] = [];

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    name: true,
                },
            });

            if (!user) {
                throw new Error(`User not found: ${userId}`);
            }

            const userName = user?.name || "Student";

            suggestions.push({
                type: SuggestionType.CELEBRATION,
                category: SuggestionCategory.SUMMARIZATION,
                message: `🎉 Welcome to RankMarg, ${userName}!\n\nYour personalized learning journey starts today. We've analyzed your goals and created practice sessions tailored just for you. Let's make every question count! 💪`,
                priority: 1,
                sequenceOrder: 1,
            });

            suggestions.push({
                type: SuggestionType.GUIDANCE,
                category: SuggestionCategory.SUMMARIZATION,
                message: `📚 **How Practice Sessions Work**\n\nEach session is designed to build your understanding step by step:\n• Start with theory revision of the topics\n• Solve handpicked questions at your level\n• Learn from mistakes with detailed solutions\n• Track your progress in real-time\n\nReady to begin?`,
                priority: 2,
                sequenceOrder: 2,
            });

            const sessionSuggestions = new DailyCoachOrchestrator()
            const session = await sessionSuggestions.generateSessionSuggestions(userId, "encouraging");
            if (session.length > 0) {
                let priority = 3;
                session.forEach(suggestion => {
                    suggestions.push({
                        ...suggestion,
                        priority: priority,
                        sequenceOrder: priority + 1,
                    });
                    priority++;
                });

                suggestions.push({
                    type: SuggestionType.MOTIVATION,
                    category: SuggestionCategory.SUMMARIZATION,
                    message: `🌟 **Your Journey Begins Now**\n\nRemember: Every expert was once a beginner. Consistency beats perfection. Start with just one session today, and you're already ahead of yesterday.\n\nWe're here to support you every step of the way. Let's achieve your goals together! 💪`,
                    priority: priority,
                    sequenceOrder: priority + 1,
                });
            } else {
                suggestions.push({
                    type: SuggestionType.GUIDANCE,
                    category: SuggestionCategory.PRACTICE_PROMPT,
                    message: `🚀 **Let's Get Started!**\n\nYour profile is set up! Now let's create your first practice session.\n\nHead to the practice section to generate a personalized session based on your topics of interest.`,
                    priority: 2,
                    actionName: "Create Session",
                    actionUrl: "/ai-practice",
                    sequenceOrder: 2,
                });

                suggestions.push({
                    type: SuggestionType.MOTIVATION,
                    category: SuggestionCategory.SUMMARIZATION,
                    message: `💡 **Pro Tip**\n\nStart with topics you're comfortable with to build momentum. As you progress, we'll gradually introduce more challenging content.\n\nYou've got this! 🌟`,
                    priority: 3,
                    sequenceOrder: 3,
                });
            }

            return suggestions;
        } catch (error) {
            console.error("[NewUserSuggestionHandler] Error in generateOnboardingSuggestions:", error);

            return [
                {
                    type: SuggestionType.CELEBRATION,
                    category: SuggestionCategory.SUMMARIZATION,
                    message: `🎉 Welcome to RankMarg! Your personalized learning journey starts now. Let's make every practice count! 💪`,
                    priority: 1,
                    sequenceOrder: 1,
                },
                {
                    type: SuggestionType.GUIDANCE,
                    category: SuggestionCategory.PRACTICE_PROMPT,
                    message: `🚀 Ready to start practicing? Head to the practice section to begin your first session!`,
                    priority: 2,
                    actionName: "Start Practice",
                    actionUrl: "/ai-practice",
                    sequenceOrder: 2,
                },
            ];
        }
    }
}
