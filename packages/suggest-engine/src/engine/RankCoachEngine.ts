import { SuggestionType, TriggerType } from "@repo/db/enums";
import {
    EnhancedAnalysis,
    RankCoachGuidance,
    CoachSuggestion,
} from "../types/coach.types";

/**
 * Rank Coach Engine
 * 
 * Philosophy: Strategic decisions, NOT teaching
 * - Decides WHAT to study (priority topics)
 * - Controls HOW MUCH (volume)
 * - Selects DIFFICULTY
 * - Blocks low-ROI activities
 * - Manages mistakes behaviorally
 * - Enforces discipline
 * 
 * Output: Maximum 2-3 concise suggestions per day
 */
export class RankCoachEngine {
    /**
     * Generate daily coaching guidance
     * Returns max 2-3 high-impact suggestions
     */
    generateCoaching(analysis: EnhancedAnalysis): RankCoachGuidance {
        const allSuggestions: CoachSuggestion[] = [];

        // Run all 10 coaching decision engines
        const whatToStudy = this.decideWhatToStudy(analysis);
        const howMuch = this.decideHowMuch(analysis);
        const difficulty = this.decideDifficulty(analysis);
        const whatToAvoid = this.decideWhatToAvoid(analysis);
        const mistakeAction = this.decideMistakeAction(analysis);
        const revision = this.decideRevision(analysis);
        const examPhase = this.decideExamPhase(analysis);
        const consistency = this.enforceConsistency(analysis);
        const sessionBuild = this.buildTodaySession(analysis);

        // Collect all non-null suggestions
        if (whatToStudy) allSuggestions.push(whatToStudy);
        if (howMuch) allSuggestions.push(howMuch);
        if (difficulty) allSuggestions.push(difficulty);
        if (whatToAvoid) allSuggestions.push(whatToAvoid);
        if (mistakeAction) allSuggestions.push(mistakeAction);
        if (revision) allSuggestions.push(revision);
        if (examPhase) allSuggestions.push(examPhase);
        if (consistency) allSuggestions.push(consistency);
        if (sessionBuild) allSuggestions.push(sessionBuild);

        // Sort by priority and take top 2-3
        const topSuggestions = allSuggestions
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 3);

        return {
            userId: analysis.userId,
            date: analysis.date,
            phase: analysis.examPhase,
            suggestions: topSuggestions,
        };
    }

    /**
     * 1. WHAT to Study (Priority Guidance)
     * Focus on high-ROI topics
     */
    private decideWhatToStudy(analysis: EnhancedAnalysis): CoachSuggestion | null {
        // Get top 2 high-ROI topics
        const topROI = analysis.topicROI.slice(0, 2);

        if (topROI.length === 0) return null;

        // Only suggest if ROI is significant
        if (topROI[0].roi < 0.1) return null;

        const topicNames = topROI.map((t) => t.topicName).join(" and ");
        const subjectName = topROI[0].subjectName;

        return {
            type: SuggestionType.GUIDANCE,
            category: "PRIORITY_FOCUS",
            message: `Today, focus on ${topicNames}. These topics matter most for your rank.`,
            priority: 1,
            actionName: "Start Practice",
            actionUrl: `https://www.rankmarg.in/ai-questions/${topROI[0].subjectId}/${this.slugify(topROI[0].topicName)}`,
        };
    }

    /**
     * 2. HOW MUCH to Study (Load Control)
     * Prevent burnout or under-practice
     */
    private decideHowMuch(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { volumeMetrics, accuracy } = analysis;

        // Over-practice detection
        if (volumeMetrics.yesterdayQuestions > 50 && accuracy < 70) {
            return {
                type: SuggestionType.WARNING,
                category: "VOLUME_CONTROL",
                message: `Stop after 25 questions today. Quality > quantity when accuracy drops.`,
                priority: 2,
                actionName: "View Analytics",
                actionUrl: "https://www.rankmarg.in/analytics",
            };
        }

        // Under-practice detection
        if (volumeMetrics.last7DaysAvg < 15 && accuracy > 75) {
            return {
                type: SuggestionType.GUIDANCE,
                category: "VOLUME_INCREASE",
                message: `Aim for 30 questions today. You're ready for more volume.`,
                priority: 3,
            };
        }

        return null;
    }

    /**
     * 3. DIFFICULTY SELECTION
     * Lock or unlock difficulty based on performance
     */
    private decideDifficulty(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { difficultyMetrics, subjectBreakdown } = analysis;

        // Find subject with low accuracy on current difficulty
        const weakSubject = subjectBreakdown.find(
            (s) => s.accuracy < 50 && s.questionsAttempted >= 5
        );

        if (weakSubject && difficultyMetrics.avgDifficulty > 2) {
            return {
                type: SuggestionType.WARNING,
                category: "DIFFICULTY_LOCK",
                message: `Locked to medium difficulty in ${weakSubject.subjectName}. Master basics first.`,
                priority: 2,
                actionName: "Practice Medium",
                actionUrl: `https://www.rankmarg.in/ai-questions/${weakSubject.subjectId}`,
            };
        }

        // Unlock harder questions if consistent high accuracy
        if (analysis.accuracy > 85 && difficultyMetrics.avgDifficulty < 3) {
            return {
                type: SuggestionType.CELEBRATION,
                category: "DIFFICULTY_UNLOCK",
                message: `Hard questions unlocked! Your ${analysis.accuracy.toFixed(0)}% accuracy earned it.`,
                priority: 3,
            };
        }

        return null;
    }

    /**
     * 4. WHAT to AVOID (Negative Guidance)
     * Block low-ROI activities
     */
    private decideWhatToAvoid(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { topicROI, difficultyMetrics, examPhase } = analysis;

        // Block over-revision of mastered topics
        const masteredTopics = topicROI.filter(
            (t) => t.masteryLevel > 80 && t.errorFrequency === 0
        );

        if (masteredTopics.length > 0 && examPhase !== 'final_prep') {
            return {
                type: SuggestionType.WARNING,
                category: "AVOID_REVISION",
                message: `Skip ${masteredTopics[0].topicName} this week. You've mastered it.`,
                priority: 4,
            };
        }

        // Block easy questions if accuracy is high
        if (difficultyMetrics.easyPercentage > 60 && analysis.accuracy > 85) {
            return {
                type: SuggestionType.WARNING,
                category: "AVOID_EASY",
                message: `Stop solving easy questions. Challenge yourself with medium/hard.`,
                priority: 3,
            };
        }

        return null;
    }

    /**
     * 5. MISTAKE MANAGEMENT
     * Behavioral adjustments, not teaching
     */
    private decideMistakeAction(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { mistakeClassification, questionsWithoutMistakeReason } = analysis;

        // Priority: Missing mistake reasons
        if (questionsWithoutMistakeReason > 0) {
            return {
                type: SuggestionType.REMINDER,
                category: "MISTAKE_REVIEW",
                message: `Mark mistake reasons for ${questionsWithoutMistakeReason} questions. Pattern recognition starts here.`,
                priority: 1,
                actionName: "Review Mistakes",
                actionUrl: "https://www.rankmarg.in/analytics",
            };
        }

        // Silly mistakes > 60%
        if (
            mistakeClassification.totalMistakes > 0 &&
            mistakeClassification.sillyMistakes / mistakeClassification.totalMistakes > 0.6
        ) {
            return {
                type: SuggestionType.WARNING,
                category: "MISTAKE_BEHAVIOR",
                message: `60% silly mistakes. Slow down to 3 minutes per question today.`,
                priority: 2,
            };
        }

        // Conceptual mistakes > 50%
        if (
            mistakeClassification.totalMistakes > 0 &&
            mistakeClassification.conceptualMistakes / mistakeClassification.totalMistakes > 0.5
        ) {
            return {
                type: SuggestionType.WARNING,
                category: "MISTAKE_BEHAVIOR",
                message: `Conceptual gaps detected. Reduce volume to 15 questions, focus on understanding.`,
                priority: 2,
            };
        }

        return null;
    }

    /**
     * 6. REVISION DECISIONING
     * What to revise vs ignore
     */
    private decideRevision(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { examPhase, topicROI, daysUntilExam } = analysis;

        // Final prep: Only revise weak high-weightage topics
        if (examPhase === 'final_prep') {
            const weakHighROI = topicROI.filter(
                (t) => t.masteryLevel < 60 && t.examWeightage > 0.1
            );

            if (weakHighROI.length > 0) {
                return {
                    type: SuggestionType.GUIDANCE,
                    category: "REVISION_DECISION",
                    message: `Revise only ${weakHighROI[0].topicName} for next 3 days. Exam is close.`,
                    priority: 1,
                    actionName: "Revise Now",
                    actionUrl: `https://www.rankmarg.in/ai-questions/${weakHighROI[0].subjectId}/${this.slugify(weakHighROI[0].topicName)}`,
                };
            }
        }

        // Block revision if exam is far and mastery is good
        if (daysUntilExam > 60 && analysis.accuracy > 75) {
            return {
                type: SuggestionType.GUIDANCE,
                category: "REVISION_BLOCK",
                message: `No revision today. Focus on new topics instead.`,
                priority: 4,
            };
        }

        return null;
    }

    /**
     * 7. EXAM-PHASE GUIDANCE
     * Rules change by phase
     */
    private decideExamPhase(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { examPhase, daysUntilExam } = analysis;

        // Final prep: Ban new topics
        if (examPhase === 'final_prep' && analysis.todaySessionTopics.length > 0) {
            const newTopics = analysis.todaySessionTopics.filter((t) => {
                const topicROI = analysis.topicROI.find((roi) => roi.topicId === t.topicId);
                return topicROI && topicROI.masteryLevel < 30;
            });

            if (newTopics.length > 0) {
                return {
                    type: SuggestionType.WARNING,
                    category: "EXAM_PHASE",
                    message: `New topics banned. ${daysUntilExam} days left - consolidate what you know.`,
                    priority: 1,
                    actionName: "Update Curriculum",
                    actionUrl: "https://www.rankmarg.in/my-curriculum",
                };
            }
        }

        // Consolidation: Accuracy > attempts
        if (examPhase === 'consolidation' && analysis.accuracy < 80) {
            return {
                type: SuggestionType.GUIDANCE,
                category: "EXAM_PHASE",
                message: `Accuracy matters more now. Aim for 80%+ today.`,
                priority: 2,
            };
        }

        return null;
    }

    /**
     * 8. CONSISTENCY & DISCIPLINE
     * Enforce minimum practice
     */
    private enforceConsistency(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { consistencyMetrics } = analysis;

        // Missed days
        if (consistencyMetrics.missedDays > 2) {
            return {
                type: SuggestionType.REMINDER,
                category: "DISCIPLINE",
                message: `You missed ${consistencyMetrics.missedDays} days. Start with just 10 questions today.`,
                priority: 1,
            };
        }

        // Incomplete sessions
        if (consistencyMetrics.incompleteSessions > 3) {
            return {
                type: SuggestionType.WARNING,
                category: "DISCIPLINE",
                message: `${consistencyMetrics.incompleteSessions} incomplete sessions. Finish what you start.`,
                priority: 2,
                actionName: "Complete Sessions",
                actionUrl: "https://www.rankmarg.in/ai-practice",
            };
        }

        // Celebrate streak
        if (consistencyMetrics.currentStreak >= 7) {
            return {
                type: SuggestionType.CELEBRATION,
                category: "DISCIPLINE",
                message: `🔥 ${consistencyMetrics.currentStreak}-day streak! This is how ranks improve.`,
                priority: 5,
            };
        }

        return null;
    }

    /**
     * 9. BUILD TODAY'S SESSION
     * Auto-generate practice session based on yesterday's errors
     */
    private buildTodaySession(analysis: EnhancedAnalysis): CoachSuggestion | null {
        const { todaySessionTopics, subjectBreakdown } = analysis;

        // If today's session already exists, guide on it
        if (todaySessionTopics.length > 0) {
            const primaryTopic = todaySessionTopics[0];

            // Check if this topic had errors yesterday
            const hadErrors = subjectBreakdown.some((subject) =>
                subject.topicsWithErrors.some((error) => error.topicId === primaryTopic.topicId)
            );

            if (hadErrors) {
                return {
                    type: SuggestionType.GUIDANCE,
                    category: "SESSION_BUILD",
                    message: `Smart choice! Practicing ${primaryTopic.topicName} where you struggled yesterday.`,
                    priority: 2,
                };
            }

            return {
                type: SuggestionType.GUIDANCE,
                category: "SESSION_BUILD",
                message: `Today's focus: ${primaryTopic.topicName}. Let's master it.`,
                priority: 3,
            };
        }

        // Suggest building a session based on high-ROI topics
        const topROI = analysis.topicROI.slice(0, 2);
        if (topROI.length > 0) {
            return {
                type: SuggestionType.GUIDANCE,
                category: "SESSION_BUILD",
                message: `Build today's session: 15 questions in ${topROI[0].topicName}.`,
                priority: 2,
                actionName: "Build Session",
                actionUrl: `https://www.rankmarg.in/ai-questions/${topROI[0].subjectId}/${this.slugify(topROI[0].topicName)}`,
            };
        }

        return null;
    }

    /**
     * Helper: Convert topic name to slug
     */
    private slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
