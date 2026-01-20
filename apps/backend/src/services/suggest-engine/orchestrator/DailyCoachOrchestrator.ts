import { EnhancedAnalyzer } from "../analyzer/EnhancedAnalyzer";
import { MotivationEngine } from "../engine/MotivationEngine";
import { SuggestionFormatter } from "../formatter/SuggestionFormatter";
import { ActionButtonGenerator } from "../generator/ActionButtonGenerator";
import { CoachSuggestion } from "../types/coach.types";
import { CoachMood } from "../types/extended.types";
import prisma from "@repo/db";
import { SuggestionCategory, SuggestionType } from "@repo/db/enums";


export class DailyCoachOrchestrator {
    private analyzer: EnhancedAnalyzer;
    private motivationEngine: MotivationEngine;
    private formatter: SuggestionFormatter;
    private actionGenerator: ActionButtonGenerator;

    constructor() {
        this.analyzer = new EnhancedAnalyzer();
        this.motivationEngine = new MotivationEngine();
        this.formatter = new SuggestionFormatter();
        this.actionGenerator = new ActionButtonGenerator();
    }


    async orchestrateDailyCoaching(userId: string): Promise<CoachSuggestion[]> {
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

            const userName = user.name || "Student";

            const analysis = await this.analyzer.analyze(userId);

            const mood = this.motivationEngine.determineMood(analysis);

            const greeting = this.generateGreeting(userName, mood);
            suggestions.push(greeting);

            if (!analysis) {
                const noActivitySuggestions = this.generateNoActivitySuggestions(userName, userId);
                suggestions.push(...noActivitySuggestions);
            } else {
                const summary = this.generateDailySummary(analysis, mood);
                suggestions.push(summary);
            }
            const sessionSuggestions = await this.generateSessionSuggestions(
                userId,
                mood
            );
            suggestions.push(...sessionSuggestions);

            if (analysis && analysis.totalQuestions >= 5) {
                const feedback = this.generateFeedback();
                if (feedback) {
                    suggestions.push(feedback);
                }
            }

            return suggestions;
        } catch (error) {
            console.error("Error orchestrating daily coaching:", error);

            return this.generateFallbackSuggestions();
        }
    }

    /**
     * Generate greeting suggestion
     */
    private generateGreeting(userName: string, mood: CoachMood): CoachSuggestion {
        const message = this.formatter.formatGreeting(userName, mood);

        return {
            type: SuggestionType.GUIDANCE,
            category: SuggestionCategory.SUMMARIZATION,
            message,
            priority: 1,
            sequenceOrder: 1,
        };
    }

    private generateDailySummary(
        analysis: any,
        mood: CoachMood
    ): CoachSuggestion {
        const message = this.formatter.formatDailySummary(
            analysis.totalQuestions,
            analysis.correctAnswers,
            analysis.accuracy,
            analysis.totalTimeSpent,
            mood
        );

        return {
            type: mood === "celebratory" ? SuggestionType.CELEBRATION : SuggestionType.GUIDANCE,
            category: SuggestionCategory.SUMMARIZATION,
            message,
            priority: 2,
            sequenceOrder: 2,
        };
    }


    private async generateSessionSuggestions(
        userId: string,
        mood: CoachMood
    ): Promise<CoachSuggestion[]> {
        const suggestions: CoachSuggestion[] = [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const sessions = await prisma.practiceSession.findMany({
            where: {
                userId,
                createdAt: { gte: todayStart, lte: todayEnd },
                isCompleted: false,
            },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
                id: true,
                subjectId: true,
                duration: true,
                questions: {
                    select: {
                        question: {
                            select: {
                                topic: { select: { id: true, name: true } },
                                subTopic: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        });

        if (sessions.length === 0) {
            suggestions.push({
                type: SuggestionType.REMINDER,
                category: SuggestionCategory.PRACTICE_PROMPT,
                message: "No practice sessions scheduled yet. Let's create one! 🎯",
                priority: 3,
                actionName: "Generate Session",
                actionUrl: "/ai-practice",
            });
            return suggestions;
        }


        const subjectIds = sessions.map((s) => s.subjectId).filter(Boolean) as string[];
        const subjects = await prisma.subject.findMany({
            where: { id: { in: subjectIds } },
            select: { id: true, name: true },
        });

        const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

        let priority = 3;

        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            const subjectName = subjectMap.get(session.subjectId || "") || "Unknown Subject";

            const extracted = this.extractSessionTopics(session);

            const studyMessage = this.formatStudyPrompt(
                subjectName,
                extracted.topicMap,
                mood,
                i + 1
            );

            suggestions.push({
                type: SuggestionType.GUIDANCE,
                category: "STUDY_PROMPT",
                message: studyMessage,
                priority: priority++,
                sequenceOrder: priority,
            });

            const practiceMessage = this.formatPracticePrompt(
                subjectName,
                session.questions.length,
                Math.ceil(session.duration / 60),
                mood,
                i + 1
            );

            suggestions.push({
                type: SuggestionType.REMINDER,
                category: SuggestionCategory.PRACTICE_PROMPT,
                message: practiceMessage,
                priority: priority++,
                actionName: "Start Practice",
                actionUrl: `/ai-session/${session.id}`,
                sequenceOrder: priority,
            });
        }

        return suggestions;
    }

    /**
     * Extract topics and subtopics from session
     */
    private extractSessionTopics(session: any): {
        topicMap: Map<string, string[]>;
    } {
        const topicMap = new Map<string, string[]>();

        for (const q of session.questions || []) {
            if (topicMap.get(q.question.topic.name)) {
                topicMap.get(q.question.topic.name)?.push(q.question.subTopic.name);
            } else {
                topicMap.set(q.question.topic.name, [q.question.subTopic.name]);
            }
        }

        return {
            topicMap,
        };
    }

    /**
     * Format study prompt (Encourages studying topics first)
     */
    private formatStudyPrompt(
        subjectName: string,
        topicMap: Map<string, string[]>,
        mood: CoachMood,
        sessionNumber: number
    ): string {
        const emoji = mood === "celebratory" ? "🎯" : mood === "encouraging" ? "💪" : "📚";

        let message = `${emoji} **${subjectName} - Session ${sessionNumber}**\n\n`;

        if (topicMap.size > 0) {
            message += `📖 **Topics to Study:**\n`;
            topicMap.forEach((subtopics, topic) => {
                message += `[${topic}]`;
                subtopics.forEach((subtopic, i) => {
                    message += `[[${subtopic}]]`;
                });
            });
        }

        message += `\n💡 **Pro Tip:** Study these topics for 10-15 minutes before solving. It'll boost your confidence! 🚀`;

        return message;
    }

    /**
     * Format practice prompt (Prompts to solve the session)
     */
    private formatPracticePrompt(
        subjectName: string,
        questionCount: number,
        estimatedMinutes: number,
        mood: CoachMood,
        sessionNumber: number
    ): string {
        const emoji = mood === "celebratory" ? "🔥" : mood === "encouraging" ? "💪" : "✅";

        let message = `${emoji} **Ready to Practice ${subjectName}?**\n\n`;

        message += `📊 **Session Details:**\n`;
        message += `• Questions: ${questionCount}\n`;
        message += `• Estimated Time: ~${estimatedMinutes} minutes\n`;
        message += `• Session: ${sessionNumber}\n\n`;

        if (mood === "celebratory") {
            message += `🎉 You're on fire! Let's crush this practice session! 💪`;
        } else if (mood === "encouraging") {
            message += `🌟 You've got this! Consistent practice = Top rank! 🎯`;
        } else {
            message += `🚀 Let's make today count. Start solving now! 💡`;
        }

        return message;
    }

    /**
     * Generate feedback suggestion
     */
    private generateFeedback(): CoachSuggestion | null {
        const message = this.formatter.formatAnalysisPrompt();

        const actionButton = this.actionGenerator.generateActionButton(
            "VIEW_RESULTS",
            {}
        );

        return {
            type: "GUIDANCE",
            category: "ANALYSIS_PROMPT",
            message,
            priority: 20, // Lower priority (shown last)
            actionName: actionButton.text,
            actionUrl: actionButton.url,
        };
    }

    /**
     * Generate suggestions for users with no activity yesterday
     */
    private generateNoActivitySuggestions(
        userName: string,
        userId: string
    ): CoachSuggestion[] {
        const suggestions: CoachSuggestion[] = [];

        suggestions.push({
            type: "MOTIVATION",
            category: "NO_ACTIVITY",
            message: `No practice yesterday? No worries! Every day is a fresh start. Let's begin today with focused practice. 💪`,
            priority: 2,
            sequenceOrder: 2,
        });


        return suggestions;
    }

    /**
     * Generate fallback suggestions (error case)
     */
    private generateFallbackSuggestions(): CoachSuggestion[] {
        return [
            {
                type: "GUIDANCE",
                category: "FALLBACK",
                message: `Hi! Ready to practice today? Let's make progress together. 📚`,
                priority: 1,
                actionName: "Start Practice",
                actionUrl: "/ai-practice",
            },
        ];
    }
}
