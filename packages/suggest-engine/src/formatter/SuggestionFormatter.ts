import { CoachMood, ToneStyle, SessionMetadata } from "../types/extended.types";
import { SubjectBreakdown } from "../types/coach.types";

/**
 * SuggestionFormatter
 * 
 * Formats suggestions with varied tones, styles, and personalization
 * to create chat-like coaching messages.
 */
export class SuggestionFormatter {
    /**
     * Format greeting message
     */
    formatGreeting(userName: string, mood: CoachMood): string {
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
                `${timeGreeting}, ${userName}! 📚 Ready to learn today?`,
                `Hey ${userName}! Let's make today count. 💪`,
                `${timeGreeting}! Time for some focused practice, ${userName}. 🎯`,
                `Hi ${userName}! Let's build on yesterday's work. ✨`,
            ],
            celebratory: [
                `${timeGreeting}, ${userName}! You're on fire! 🔥`,
                `Hey superstar! Great to see you, ${userName}! 🌟`,
                `${timeGreeting}, ${userName}! Your progress is amazing! 🎉`,
                `Wow ${userName}! You're crushing it! Keep going! 🏆`,
            ],
            corrective: [
                `${timeGreeting}, ${userName}. Let's get back on track. 📊`,
                `Hey ${userName}, time to refocus and improve. 🎓`,
                `${timeGreeting}. Let's work on those gaps, ${userName}. 💡`,
                `Hi ${userName}. Time to turn things around. 🔄`,
            ],
            motivating: [
                `${timeGreeting}, ${userName}! Let's crush today's goals! 🚀`,
                `Hey ${userName}! Time to level up! ⚡`,
                `${timeGreeting}! Ready to dominate, ${userName}? 💯`,
                `Hi ${userName}! Let's make every question count! 🎯`,
            ],
        };

        const options = greetings[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Format daily summary message
     */
    formatDailySummary(
        totalQuestions: number,
        correctAnswers: number,
        accuracy: number,
        timeSpent: number,
        mood: CoachMood
    ): string {
        const accuracyPercent = Math.round(accuracy);
        const timeInMinutes = Math.round(timeSpent);

        const summaries: Record<CoachMood, string[]> = {
            encouraging: [
                `Yesterday, you solved ${totalQuestions} questions with ${accuracyPercent}% accuracy in ${timeInMinutes} minutes. Let's keep building! 📈`,
                `You practiced ${totalQuestions} questions yesterday (${correctAnswers} correct). Good effort! Time to improve further. 💪`,
                `${totalQuestions} questions, ${accuracyPercent}% accuracy, ${timeInMinutes} minutes of practice. Solid work! Let's continue. ✨`,
            ],
            celebratory: [
                `Wow! ${totalQuestions} questions with ${accuracyPercent}% accuracy yesterday! You're doing great! 🎉`,
                `Amazing! ${correctAnswers}/${totalQuestions} correct yesterday. Your hard work is paying off! 🌟`,
                `Fantastic performance! ${accuracyPercent}% accuracy on ${totalQuestions} questions. Keep this momentum! 🔥`,
            ],
            corrective: [
                `Yesterday: ${totalQuestions} questions, ${accuracyPercent}% accuracy. We need to improve this. Let's focus on understanding concepts. 📊`,
                `You attempted ${totalQuestions} questions but only ${correctAnswers} were correct. Time to identify and fix mistakes. 🎓`,
                `${accuracyPercent}% accuracy needs work. Let's analyze what went wrong and improve today. 💡`,
            ],
            motivating: [
                `${totalQuestions} questions done! Now let's push for higher accuracy today. You can do this! 🚀`,
                `Yesterday's ${accuracyPercent}% is just the start. Let's aim higher today! 💯`,
                `${correctAnswers} correct out of ${totalQuestions}. Time to beat that score! ⚡`,
            ],
        };

        const options = summaries[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Format session suggestion message
     */
    formatSessionSuggestion(
        metadata: SessionMetadata,
        mood: CoachMood,
        sequenceNumber: number
    ): string {
        const { subjectName, topics, questionCount, estimatedDuration } = metadata;

        // Build topic list
        const topicList = topics.map((t) => t.topicName).join(", ");
        const topicCount = topics.length;

        const suggestionsByMood: Record<CoachMood, string[]> = {
            encouraging: [
                `📚 **${subjectName}** (${questionCount} Questions, ~${estimatedDuration} min)\\n\\nTopics: ${topicList}\\n\\nLet's strengthen these concepts today!`,
                `🎯 Time for **${subjectName}**!\\n\\n${questionCount} questions covering ${topicCount} topic${topicCount > 1 ? 's' : ''}: ${topicList}\\n\\nYou've got this!`,
                `💪 **${subjectName} Practice**\\n\\n${topicCount} topic${topicCount > 1 ? 's' : ''} to master: ${topicList}\\n${questionCount} questions • ${estimatedDuration} minutes\\n\\nLet's do this!`,
            ],
            celebratory: [
                `🌟 **${subjectName}** - You're doing great!\\n\\n${questionCount} questions on: ${topicList}\\n\\nKeep the momentum going!`,
                `🔥 **${subjectName}** awaits!\\n\\nTopics: ${topicList}\\n${questionCount}Q • ${estimatedDuration}min\\n\\nYou're on a roll!`,
                `⭐ **${subjectName}** time!\\n\\n${topicList}\\n\\n${questionCount} questions to ace. Let's go!`,
            ],
            corrective: [
                `📊 **${subjectName}** - Focus needed\\n\\nTopics with errors: ${topicList}\\n${questionCount} questions • ${estimatedDuration} min\\n\\nLet's fix these gaps.`,
                `🎓 **${subjectName}** improvement session\\n\\n${topicList}\\n\\n${questionCount} questions to master. Time to improve.`,
                `💡 **${subjectName}** - Work on these\\n\\nWeak areas: ${topicList}\\n${questionCount}Q • ${estimatedDuration}min\\n\\nFocus and improve.`,
            ],
            motivating: [
                `🚀 **${subjectName}** - Let's dominate!\\n\\n${topicList}\\n\\n${questionCount} questions • ${estimatedDuration} minutes\\n\\nMake every question count!`,
                `💯 **${subjectName}** challenge!\\n\\nTopics: ${topicList}\\n${questionCount}Q to conquer\\n\\nPush yourself!`,
                `⚡ **${subjectName}** power session\\n\\n${topicCount} topics: ${topicList}\\n${questionCount} questions\\n\\nTime to shine!`,
            ],
        };

        const suggestions = suggestionsByMood[mood];
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    /**
     * Format feedback message (after session completion)
     */
    formatFeedback(
        completedSessions: number,
        totalSessions: number,
        mood: CoachMood
    ): string {
        if (completedSessions === totalSessions) {
            return this.formatCompletionFeedback(totalSessions, mood);
        } else if (completedSessions > 0) {
            return this.formatPartialFeedback(completedSessions, totalSessions, mood);
        } else {
            return this.formatNoCompletionFeedback(mood);
        }
    }

    /**
     * Format completion feedback (all sessions done)
     */
    private formatCompletionFeedback(totalSessions: number, mood: CoachMood): string {
        const feedbacks: Record<CoachMood, string[]> = {
            encouraging: [
                `🎉 Amazing! You completed all ${totalSessions} sessions today! Great dedication. Now review your mistakes and learn from them.`,
                `💪 All ${totalSessions} sessions done! Excellent work. Take a moment to analyze your performance.`,
                `✨ Fantastic! ${totalSessions}/${totalSessions} sessions completed. You're building strong habits!`,
            ],
            celebratory: [
                `🏆 INCREDIBLE! All ${totalSessions} sessions crushed! You're unstoppable! 🔥`,
                `🌟 WOW! ${totalSessions}/${totalSessions} complete! This is the kind of dedication that gets results! 🎉`,
                `⭐ OUTSTANDING! Every single session done! You're on the path to success! 💯`,
            ],
            corrective: [
                `✅ All ${totalSessions} sessions completed. Good. Now focus on understanding your mistakes thoroughly.`,
                `${totalSessions}/${totalSessions} done. Volume is good, but let's work on accuracy next time.`,
                `Sessions complete. Now the real work begins - analyze and learn from errors.`,
            ],
            motivating: [
                `🚀 ${totalSessions}/${totalSessions} DONE! This is the energy we need! Keep pushing! 💯`,
                `⚡ ALL SESSIONS COMPLETE! You're building momentum! Don't stop now! 🔥`,
                `💪 ${totalSessions} sessions conquered! This is how champions prepare! Keep going! 🏆`,
            ],
        };

        const options = feedbacks[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Format partial feedback (some sessions done)
     */
    private formatPartialFeedback(
        completed: number,
        total: number,
        mood: CoachMood
    ): string {
        const remaining = total - completed;

        const feedbacks: Record<CoachMood, string[]> = {
            encouraging: [
                `Good start! ${completed}/${total} sessions done. ${remaining} more to go. You can finish this! 💪`,
                `Nice work on ${completed} sessions! ${remaining} remaining. Keep the momentum going! 📚`,
            ],
            celebratory: [
                `Great job! ${completed}/${total} complete! Finish the remaining ${remaining} and celebrate! 🎉`,
                `Awesome! ${completed} down, ${remaining} to go! You're doing great! 🌟`,
            ],
            corrective: [
                `${completed}/${total} done. You need to complete all ${remaining} remaining sessions. Stay focused.`,
                `Partial completion (${completed}/${total}). Finish the remaining ${remaining} for full benefit.`,
            ],
            motivating: [
                `${completed}/${total}! Don't stop now! ${remaining} more to dominate! 🚀`,
                `${completed} conquered! ${remaining} left! Finish strong! ⚡`,
            ],
        };

        const options = feedbacks[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Format no completion feedback
     */
    private formatNoCompletionFeedback(mood: CoachMood): string {
        const feedbacks: Record<CoachMood, string[]> = {
            encouraging: [
                `You haven't started today's sessions yet. No worries! Start now and build momentum. 💪`,
                `Sessions are waiting for you! Start with just one and see how it goes. 📚`,
            ],
            celebratory: [
                `Ready to continue your winning streak? Start your first session now! 🌟`,
                `Let's keep that energy going! Begin your practice now! 🎉`,
            ],
            corrective: [
                `No sessions completed yet. Time to start. Consistency is key. 📊`,
                `You need to practice today. Start your first session now. 🎓`,
            ],
            motivating: [
                `Time to take action! Start your first session and dominate! 🚀`,
                `Let's go! Your sessions are ready. Start now and crush them! ⚡`,
            ],
        };

        const options = feedbacks[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Format curriculum guidance message
     */
    formatCurriculumGuidance(
        completionPercentage: number,
        nextTopics: string[],
        mood: CoachMood
    ): string {
        const topicList = nextTopics.slice(0, 3).join(", ");

        const guidances: Record<CoachMood, string[]> = {
            encouraging: [
                `📚 Curriculum Progress: ${completionPercentage}%\\n\\nNext recommended topics: ${topicList}\\n\\nKeep moving forward!`,
                `You've covered ${completionPercentage}% of your syllabus. Great progress!\\n\\nUp next: ${topicList}`,
            ],
            celebratory: [
                `🎉 ${completionPercentage}% syllabus complete! Amazing!\\n\\nNext conquests: ${topicList}`,
                `Wow! ${completionPercentage}% done! You're making excellent progress!\\n\\nNext: ${topicList}`,
            ],
            corrective: [
                `Syllabus coverage: ${completionPercentage}%. Need to accelerate.\\n\\nPriority topics: ${topicList}`,
                `${completionPercentage}% complete. Focus on these next: ${topicList}`,
            ],
            motivating: [
                `🚀 ${completionPercentage}% conquered! Let's dominate these next:\\n\\n${topicList}`,
                `${completionPercentage}% down! Time to attack: ${topicList}`,
            ],
        };

        const options = guidances[mood];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Format analysis prompt message
     */
    formatAnalysisPrompt(): string {
        const prompts = [
            `📊 If you have time, review your recent practice sessions to identify patterns and improve faster.`,
            `💡 Take a moment to analyze your recent attempts. Understanding mistakes is key to improvement.`,
            `🎯 Review your practice history to see your progress and areas needing focus.`,
            `📈 Check your recent results to track your improvement journey.`,
        ];

        return prompts[Math.floor(Math.random() * prompts.length)];
    }
}
