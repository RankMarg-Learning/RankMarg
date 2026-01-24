import { getDayWindow } from "@/lib/dayRange";
import { EnhancedAnalyzer } from "../analyzer/EnhancedAnalyzer";
import { MotivationEngine } from "../engine/MotivationEngine";
import { SuggestionFormatter } from "../formatter/SuggestionFormatter";
import { ActionButtonGenerator } from "../generator/ActionButtonGenerator";
import { MessageTemplateGenerator } from "../generator/MessageTemplateGenerator";
import { CoachSuggestion, EnhancedAnalysis } from "../types/coach.types";
import { CoachMood, ActionButton, ActionType } from "../types/extended.types";
import prisma from "@repo/db";
import { SuggestionCategory, SuggestionType } from "@repo/db/enums";


export class DailyCoachOrchestrator {
    private analyzer: EnhancedAnalyzer;
    private motivationEngine: MotivationEngine;
    private formatter: SuggestionFormatter;
    private actionGenerator: ActionButtonGenerator;
    private messageTemplateGenerator: MessageTemplateGenerator;

    constructor() {
        this.analyzer = new EnhancedAnalyzer();
        this.motivationEngine = new MotivationEngine();
        this.formatter = new SuggestionFormatter();
        this.actionGenerator = new ActionButtonGenerator();
        this.messageTemplateGenerator = new MessageTemplateGenerator();
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
                const noActivitySuggestions = this.generateNoActivitySuggestions();
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

            return suggestions;
        } catch (error) {
            console.error("Error orchestrating daily coaching:", error);

            return this.generateFallbackSuggestions();
        }
    }


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
        analysis: EnhancedAnalysis,
        mood: CoachMood
    ): CoachSuggestion {
        const message = this.formatter.formatDailySummary(
            analysis,
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


    async generateSessionSuggestions(
        userId: string,
        mood: CoachMood
    ): Promise<CoachSuggestion[]> {
        const suggestions: CoachSuggestion[] = [];

        const { from, to } = getDayWindow()

        const sessions = await prisma.practiceSession.findMany({
            where: {
                userId,
                createdAt: { gte: from, lte: to },
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
            const actionButton = this.actionGenerator.generateActionButton("MOCK_TEST", {})
            suggestions.push({
                type: SuggestionType.REMINDER,
                category: SuggestionCategory.PRACTICE_PROMPT,
                message: "New Some Mock Tests are available for you to practice. Give them a try! 🎯",
                priority: 3,
                actionName: actionButton.text,
                actionUrl: actionButton.url,
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
                category: SuggestionCategory.STUDY_PROMPT,
                message: studyMessage,
                priority: priority++,
                sequenceOrder: priority,
            });

            const practiceMessage = this.formatPracticePrompt(
                subjectName,
                session.questions.length,
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

        const template = this.messageTemplateGenerator.getStudyPromptTemplate(
            subjectName,
            mood,
            sessionNumber
        );

        let message = `${template.emoji} ${template.header}\n\n`;

        if (topicMap.size > 0) {
            message += `${template.topicsLabel}`;
            topicMap.forEach((subtopics, topic) => {
                message += `\n [${topic}]: \n`;
                subtopics.forEach((subtopic, i) => {
                    message += `[[${subtopic}]]`;
                });
            });
        }

        message += `\n${template.tip}`;

        return message;
    }

    /**
     * Format practice prompt (Prompts to solve the session)
     */
    private formatPracticePrompt(
        subjectName: string,
        questionCount: number,
        mood: CoachMood,
        sessionNumber: number
    ): string {

        const template = this.messageTemplateGenerator.getPracticePromptTemplate(
            subjectName,
            mood,
            sessionNumber
        );

        let message = `${template.emoji} ${template.intro}\n\n`;

        message += `${template.detailsLabel}\n`;
        message += `• Questions: ${questionCount}\n`;

        message += template.motivational;

        return message;
    }



    /**
     * Generate suggestions for users with no activity yesterday
     */
    private generateNoActivitySuggestions(): CoachSuggestion[] {
        const suggestions: CoachSuggestion[] = [];

        suggestions.push({
            type: SuggestionType.MOTIVATION,
            category: SuggestionCategory.OTHER,
            message: this.messageTemplateGenerator.getNoYesterdayPracticeMessage(),
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
