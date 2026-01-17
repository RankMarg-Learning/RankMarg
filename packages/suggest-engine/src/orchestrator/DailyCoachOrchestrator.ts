import { EnhancedAnalyzer } from "../analyzer/EnhancedAnalyzer";
import { CurriculumTracker } from "../analyzer/CurriculumTracker";
import { RankCoachEngine } from "../engine/RankCoachEngine.js";
import { SessionBuilder } from "../engine/SessionBuilder.js";
import { MotivationEngine } from "../engine/MotivationEngine.js";
import { SuggestionFormatter } from "../formatter/SuggestionFormatter";
import { ActionButtonGenerator } from "../generator/ActionButtonGenerator";
import { CoachSuggestion } from "../types/coach.types";
import { CoachMood, SessionMetadata } from "../types/extended.types";
import prisma from "../lib/prisma";

/**
 * DailyCoachOrchestrator
 * 
 * Orchestrates the complete daily coaching flow (5-6 suggestions).
 * Coordinates all components to generate personalized coaching messages.
 */
export class DailyCoachOrchestrator {
    private analyzer: EnhancedAnalyzer;
    private curriculumTracker: CurriculumTracker;
    private coachEngine: RankCoachEngine;
    private sessionBuilder: SessionBuilder;
    private motivationEngine: MotivationEngine;
    private formatter: SuggestionFormatter;
    private actionGenerator: ActionButtonGenerator;

    constructor() {
        this.analyzer = new EnhancedAnalyzer();
        this.curriculumTracker = new CurriculumTracker();
        this.coachEngine = new RankCoachEngine();
        this.sessionBuilder = new SessionBuilder();
        this.motivationEngine = new MotivationEngine();
        this.formatter = new SuggestionFormatter();
        this.actionGenerator = new ActionButtonGenerator();
    }

    /**
     * Orchestrate complete daily coaching flow
     * Returns 5-6 suggestions in sequence
     */
    async orchestrateDailyCoaching(userId: string): Promise<CoachSuggestion[]> {
        const suggestions: CoachSuggestion[] = [];

        try {
            // Get user info
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    examRegistrations: true,
                },
            });

            if (!user) {
                throw new Error(`User not found: ${userId}`);
            }

            const userName = user.name || "Student";
            const examCode = user.examRegistrations[0]?.examCode || "JEE";

            // Analyze yesterday's performance
            const analysis = await this.analyzer.analyze(userId);

            if (!analysis) {
                // No activity - generate motivational suggestions
                return this.generateNoActivitySuggestions(userName);
            }

            // Get curriculum alignment
            const curriculumAlignment = await this.curriculumTracker.getCurriculumAlignment(
                userId,
                examCode
            );

            // Determine mood
            const mood = this.motivationEngine.determineMood(analysis);

            // 1. GREETING (First chat)
            const greeting = this.generateGreeting(userName, mood);
            suggestions.push(greeting);

            // 2. DAILY SUMMARY (Second chat)
            const summary = this.generateDailySummary(analysis, mood);
            suggestions.push(summary);

            // 3. SUBJECT SESSIONS (Third, Fourth, Fifth chats)
            const sessions = await this.generateSubjectSessions(
                analysis,
                examCode,
                mood
            );
            suggestions.push(...sessions);

            // 4. FEEDBACK/ANALYSIS (Sixth chat - conditional)
            const feedback = this.generateFeedback(analysis, mood);
            if (feedback) {
                suggestions.push(feedback);
            }

            // 5. CURRICULUM GUIDANCE (Optional - if needed)
            if (curriculumAlignment.completionPercentage < 80) {
                const curriculumGuidance = this.generateCurriculumGuidance(
                    curriculumAlignment,
                    mood
                );
                if (curriculumGuidance) {
                    suggestions.push(curriculumGuidance);
                }
            }

            return suggestions;
        } catch (error) {
            console.error("Error orchestrating daily coaching:", error);
            // Return fallback suggestion
            return this.generateFallbackSuggestions();
        }
    }

    /**
     * Generate greeting suggestion
     */
    private generateGreeting(userName: string, mood: CoachMood): CoachSuggestion {
        const message = this.formatter.formatGreeting(userName, mood);

        return {
            type: "MOTIVATION",
            category: "GREETING",
            message,
            priority: 1,
        };
    }

    /**
     * Generate daily summary suggestion
     */
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
            type: mood === "celebratory" ? "CELEBRATION" : "GUIDANCE",
            category: "DAILY_SUMMARY",
            message,
            priority: 2,
        };
    }

    /**
     * Generate subject session suggestions (3 sessions)
     */
    private async generateSubjectSessions(
        analysis: any,
        examCode: string,
        mood: CoachMood
    ): Promise<CoachSuggestion[]> {
        const suggestions: CoachSuggestion[] = [];

        // Get exam subjects
        const examSubjects = await prisma.examSubject.findMany({
            where: { examCode },
            include: { subject: true },
            orderBy: { weightage: "desc" },
            take: 3,
        });

        for (let i = 0; i < examSubjects.length; i++) {
            const examSubject = examSubjects[i];
            const subjectId = examSubject.subjectId;

            // Build session metadata
            const topics = await this.sessionBuilder.selectTopicsForSession(
                analysis,
                subjectId,
                3
            );

            const questionCount = 10; // Default 10 questions per subject
            const priority = this.sessionBuilder["determinePriority"](analysis, subjectId);

            const metadata: SessionMetadata = await this.sessionBuilder.buildSessionMetadata(
                subjectId,
                topics,
                questionCount,
                priority
            );

            // Format session message
            const message = this.formatter.formatSessionSuggestion(
                metadata,
                mood,
                i + 1
            );

            // Create practice session in database
            const session = await this.createPracticeSession(
                analysis.userId,
                subjectId,
                topics.map((t) => t.topicId),
                questionCount
            );

            // Generate action button
            const actionButton = this.actionGenerator.generateActionButton(
                "START_PRACTICE",
                {
                    sessionId: session.id,
                    subjectName: examSubject.subject.name,
                    questionCount,
                }
            );

            suggestions.push({
                type: "GUIDANCE",
                category: "SUBJECT_SESSION",
                message,
                priority: 3 + i,
                actionName: actionButton.text,
                actionUrl: actionButton.url,
            });
        }

        return suggestions;
    }

    /**
     * Generate feedback suggestion
     */
    private generateFeedback(analysis: any, mood: CoachMood): CoachSuggestion | null {
        // Check if user has time for analysis
        if (analysis.totalQuestions < 5) {
            return null; // Too few questions to give meaningful feedback
        }

        const message = this.formatter.formatAnalysisPrompt();

        const actionButton = this.actionGenerator.generateActionButton(
            "VIEW_RESULTS",
            {}
        );

        return {
            type: "GUIDANCE",
            category: "ANALYSIS_PROMPT",
            message,
            priority: 6,
            actionName: actionButton.text,
            actionUrl: actionButton.url,
        };
    }

    /**
     * Generate curriculum guidance suggestion
     */
    private generateCurriculumGuidance(
        curriculumAlignment: any,
        mood: CoachMood
    ): CoachSuggestion | null {
        if (curriculumAlignment.nextRecommendedTopics.length === 0) {
            return null;
        }

        const nextTopics = curriculumAlignment.nextRecommendedTopics
            .slice(0, 3)
            .map((t: any) => t.topicName);

        const message = this.formatter.formatCurriculumGuidance(
            curriculumAlignment.completionPercentage,
            nextTopics,
            mood
        );

        const actionButton = this.actionGenerator.generateActionButton(
            "CHANGE_CURRICULUM",
            {}
        );

        return {
            type: "GUIDANCE",
            category: "CURRICULUM_GUIDANCE",
            message,
            priority: 7,
            actionName: actionButton.text,
            actionUrl: actionButton.url,
        };
    }

    /**
     * Generate suggestions for users with no activity
     */
    private generateNoActivitySuggestions(userName: string): CoachSuggestion[] {
        const suggestions: CoachSuggestion[] = [];

        // Greeting
        suggestions.push({
            type: "MOTIVATION",
            category: "GREETING",
            message: `Hi ${userName}! 👋`,
            priority: 1,
        });

        // Motivational message
        suggestions.push({
            type: "MOTIVATION",
            category: "NO_ACTIVITY",
            message: `No practice yesterday? No problem! Every day is a fresh start. Let's begin today with focused practice. 💪`,
            priority: 2,
        });

        // Action prompt
        const actionButton = this.actionGenerator.generateActionButton(
            "VIEW_RESULTS",
            {}
        );

        suggestions.push({
            type: "REMINDER",
            category: "START_PRACTICE",
            message: `Start with a quick session today and build momentum. Consistency is key! 🎯`,
            priority: 3,
            actionName: "Start Practice",
            actionUrl: "/ai-practice",
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

    /**
     * Create practice session in database
     */
    private async createPracticeSession(
        userId: string,
        subjectId: string,
        topicIds: string[],
        questionCount: number
    ) {
        // Get questions for topics
        const questions = await prisma.question.findMany({
            where: {
                subjectId,
                topicId: {
                    in: topicIds,
                },
                isPublished: true,
            },
            take: questionCount,
            orderBy: {
                difficulty: "asc",
            },
        });

        // Create session
        const session = await prisma.practiceSession.create({
            data: {
                userId,
                subjectId,
                questionsSolved: 0,
                correctAnswers: 0,
                duration: questionCount * 90, // 90 seconds per question
                questions: {
                    create: questions.map((q) => ({
                        questionId: q.id,
                    })),
                },
            },
        });

        return session;
    }
}
