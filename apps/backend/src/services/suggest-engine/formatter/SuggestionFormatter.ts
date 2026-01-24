import { ActionButtonGenerator } from "../generator/ActionButtonGenerator";
import { CoachSuggestion, EnhancedAnalysis } from "../types/coach.types";
import { CoachMood, SessionMetadata } from "../types/extended.types";

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
        analysis: EnhancedAnalysis,
        mood: CoachMood
    ): string {
        const {
            totalQuestions,
            correctAnswers,
            accuracy,
            totalTimeSpent,
            mistakeClassification,
            subjectBreakdown,
            consistencyMetrics,
            examPhase
        } = analysis;

        const accuracyPercent = Math.round(accuracy);
        const timeInMinutes = Math.round(totalTimeSpent);
        const wrongAnswers = totalQuestions - correctAnswers;

        // 1. Identify dominant mistake pattern
        let mistakeInsight = "";
        if (mistakeClassification.totalMistakes > 0) {
            const { sillyMistakes, conceptualMistakes, speedMistakes } = mistakeClassification;
            if (sillyMistakes > conceptualMistakes && sillyMistakes > speedMistakes) {
                mistakeInsight = `*Watch out:* Silly errors detected—read questions more carefully`;
            } else if (conceptualMistakes > sillyMistakes && conceptualMistakes > speedMistakes) {
                mistakeInsight = `*Focus needed:* Strengthen core concepts in weak areas`;
            } else if (speedMistakes > 0) {
                mistakeInsight = `*Slow down:* You might be rushing—accuracy > speed`;
            }
        }

        // 2. Identify weak subject
        let subjectInsight = "";
        let weakSubject: EnhancedAnalysis['subjectBreakdown'][0] | undefined;

        if (subjectBreakdown.length > 0) {
            weakSubject = [...subjectBreakdown].sort((a, b) => a.accuracy - b.accuracy)[0];
            if (weakSubject && weakSubject.accuracy < 60) {
                subjectInsight = `**${weakSubject.subjectName}** needs attention [[${Math.round(weakSubject.accuracy)}% accuracy]]`;
            }
        }

        // 3. Streak badge
        const streakBadge = consistencyMetrics.currentStreak > 2
            ? `[[${consistencyMetrics.currentStreak}-Day Streak 🔥]]`
            : "";

        // 4. Construct message based on mood
        switch (mood) {
            case "celebratory":
                return [
                    `[ **Yesterday's Performance** ]\n**${totalQuestions}** questions • **${accuracyPercent}%** accuracy • ${timeInMinutes} mins\n\n🎉 *Outstanding work!* ${streakBadge}\n${mistakeInsight ? "\n💡 " + mistakeInsight : "Keep this momentum going!"}`,

                    `[ **Daily Summary** ]\n✅ Correct: **${correctAnswers}/${totalQuestions}**\n⏱️ Time: ${timeInMinutes} minutes\n\n🌟 *Amazing progress!* ${streakBadge}\n${mistakeInsight || "Your hard work is paying off—stay consistent!"}`,

                    `[ **Practice Report** ]\n**${accuracyPercent}%** accuracy achieved! 🚀\n\n${streakBadge ? streakBadge + "\n" : ""}*Fantastic performance!* You're on the right track.\n${subjectInsight ? "\n📌 " + subjectInsight : ""}`
                ][Math.floor(Math.random() * 3)];

            case "corrective":
                return [
                    `[ **Yesterday's Analysis** ]\n📊 **${totalQuestions}** questions attempted\n✅ Correct: ${correctAnswers} | ❌ Wrong: ${wrongAnswers}\n📈 Accuracy: **${accuracyPercent}%**\n\n⚠️ *Action needed:*\n${mistakeInsight || "Review your mistakes carefully"}\n${subjectInsight ? "• " + subjectInsight : ""}`,

                    `[ **Performance Review** ]\n**${correctAnswers}/${totalQuestions}** correct answers\n\n🎯 *Focus areas:*\n${subjectInsight ? "• " + subjectInsight + "\n" : ""}${mistakeInsight ? "• " + mistakeInsight : "• Analyze incorrect answers systematically"}\n\n💪 Let's turn this around today!`,

                    `[ **Gap Analysis** ]\nAccuracy: [[${accuracyPercent}%]] • Time: ${timeInMinutes} mins\n\n📚 *Improvement plan:*\n${mistakeInsight || "Focus on conceptual clarity"}\n${subjectInsight ? "\n🔴 Priority: " + subjectInsight : ""}\n\n*Quality over quantity—let's improve!*`
                ][Math.floor(Math.random() * 3)];

            case "encouraging":
                return [
                    `[ **Yesterday's Practice** ]\n**${totalQuestions}** questions • **${accuracyPercent}%** accuracy\n⏱️ ${timeInMinutes} minutes invested\n\n${streakBadge ? streakBadge + "\n" : ""}📈 *Good effort!* ${subjectInsight || "Consistency is building your foundation."}\n${mistakeInsight ? "\n� Tip: " + mistakeInsight : ""}`,

                    `[ **Daily Progress** ]\n✅ **${correctAnswers}** correct | ❌ ${wrongAnswers} wrong\n\n💪 *You're building momentum!*\n${mistakeInsight || "Keep practicing with focus"}\n${subjectInsight ? "\n📌 Next: " + subjectInsight : ""}`,

                    `[ **Practice Summary** ]\n${timeInMinutes} mins of focused practice ✨\n**${totalQuestions}** questions completed\n\n${streakBadge ? streakBadge + " " : ""}*Solid work!*\n${subjectInsight ? "\n🎯 " + subjectInsight : "Step by step, you're getting better!"}`
                ][Math.floor(Math.random() * 3)];

            case "motivating":
            default:
                return [
                    `[ **Yesterday's Stats** ]\n**${totalQuestions}** questions • **${accuracyPercent}%** accuracy\n\n${streakBadge ? streakBadge + "\n" : ""}🚀 *Today's mission:* Beat yesterday's score!\n${mistakeInsight ? "\n⚡ " + mistakeInsight : "Push yourself harder!"}`,

                    `[ **Performance Snapshot** ]\n✅ **${correctAnswers}** correct answers\n\n💯 *Let's dominate today!*\n${mistakeInsight || "Focus + Speed = Success"}\n${subjectInsight ? "\n🎯 Target: " + subjectInsight : ""}`,

                    `[ **Daily Recap** ]\n${accuracyPercent}% accuracy • ${timeInMinutes} mins\n\n⚡ *Yesterday is done—today is your opportunity!*\n${subjectInsight || "Every question counts toward your rank"}\n${streakBadge ? "\n" + streakBadge : ""}`
                ][Math.floor(Math.random() * 3)];
        }
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
