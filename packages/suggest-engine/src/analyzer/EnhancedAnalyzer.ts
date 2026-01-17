import prisma from "../lib/prisma";
import {
    EnhancedAnalysis,
    TopicROI,
    VolumeMetrics,
    DifficultyMetrics,
    ConsistencyMetrics,
    MistakeClassification,
    SubjectBreakdown,
    TopicError,
    SessionTopic,
    AttemptWithDetails,
    ExamPhase,
} from "../types/coach.types";

export class EnhancedAnalyzer {
    /**
     * Analyze yesterday's attempts + today's session + historical data
     * to provide comprehensive metrics for Rank Coach
     */
    async analyze(userId: string): Promise<EnhancedAnalysis | null> {
        const IST_OFFSET_MINUTES = 5.5 * 60;

        // Calculate time windows
        const now = new Date();
        const istNow = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000);

        // Yesterday: 12:00 AM to 11:50 PM
        const yesterdayMidnight = new Date(istNow);
        yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
        yesterdayMidnight.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date(yesterdayMidnight);
        yesterdayEnd.setHours(23, 50, 0, 0);

        const utcYesterdayStart = new Date(yesterdayMidnight.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
        const utcYesterdayEnd = new Date(yesterdayEnd.getTime() - IST_OFFSET_MINUTES * 60 * 1000);

        // Today: 12:00 AM onwards
        const todayMidnight = new Date(istNow);
        todayMidnight.setHours(0, 0, 0, 0);
        const utcTodayStart = new Date(todayMidnight.getTime() - IST_OFFSET_MINUTES * 60 * 1000);

        // Last 7 days
        const last7Days = new Date(utcYesterdayStart);
        last7Days.setDate(last7Days.getDate() - 7);

        // Last 30 days
        const last30Days = new Date(utcYesterdayStart);
        last30Days.setDate(last30Days.getDate() - 30);

        // Fetch yesterday's attempts
        const yesterdayAttempts: AttemptWithDetails[] = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: utcYesterdayStart,
                    lte: utcYesterdayEnd,
                },
            },
            include: {
                question: {
                    include: {
                        subject: true,
                        topic: true,
                        subTopic: true,
                    },
                },
            },
            orderBy: {
                solvedAt: 'asc',
            },
        });

        if (yesterdayAttempts.length === 0) {
            return null;
        }

        // Fetch today's attempts (for session topics)
        const todayAttempts: AttemptWithDetails[] = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: utcTodayStart,
                },
            },
            include: {
                question: {
                    include: {
                        subject: true,
                        topic: true,
                        subTopic: true,
                    },
                },
            },
        });

        // Fetch last 7 days attempts (for consistency)
        const last7DaysAttempts = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: last7Days,
                    lt: utcYesterdayStart,
                },
            },
            select: {
                id: true,
                solvedAt: true,
                status: true,
            },
        });

        // Fetch last 30 days attempts (for volume trends)
        const last30DaysAttempts = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: last30Days,
                    lt: utcYesterdayStart,
                },
            },
            select: {
                id: true,
                solvedAt: true,
            },
        });

        // Get user's target exam date
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { targetYear: true },
        });

        // Calculate basic metrics
        const totalQuestions = yesterdayAttempts.length;
        const correctAnswers = yesterdayAttempts.filter((a) => a.status === "CORRECT").length;
        const wrongAnswers = yesterdayAttempts.filter((a) => a.status === "INCORRECT").length;
        const accuracy = (correctAnswers / totalQuestions) * 100;

        const unsolvedQuestions = yesterdayAttempts.filter(
            (a) => a.status === "MARK_FOR_REVIEW" || a.status === "ANSWERED_MARK"
        ).length;

        const questionsWithoutMistakeReason = yesterdayAttempts.filter(
            (a) => a.status === "INCORRECT" && (!a.mistake || a.mistake === "NONE")
        ).length;

        const totalTimeSpent = yesterdayAttempts.reduce(
            (sum, a) => sum + (a.timing || 0),
            0
        ) / 60; // Convert to minutes

        // Calculate enhanced metrics
        const topicROI = await this.calculateTopicROI(userId, yesterdayAttempts);
        const volumeMetrics = this.calculateVolumeMetrics(
            yesterdayAttempts,
            last7DaysAttempts,
            last30DaysAttempts
        );
        const difficultyMetrics = this.calculateDifficultyMetrics(yesterdayAttempts);
        const consistencyMetrics = await this.calculateConsistencyMetrics(
            userId,
            yesterdayAttempts,
            last7DaysAttempts
        );
        const mistakeClassification = this.classifyMistakes(yesterdayAttempts);
        const daysUntilExam = this.calculateDaysUntilExam(user?.targetYear ?? null);
        const examPhase = this.determineExamPhase(daysUntilExam);

        const subjectBreakdown = this.calculateSubjectBreakdown(yesterdayAttempts);
        const todaySessionTopics = this.calculateSessionTopics(todayAttempts);

        return {
            userId,
            date: new Date(),
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            accuracy,
            totalTimeSpent,
            unsolvedQuestions,
            questionsWithoutMistakeReason,
            topicROI,
            volumeMetrics,
            difficultyMetrics,
            consistencyMetrics,
            mistakeClassification,
            examPhase,
            daysUntilExam,
            subjectBreakdown,
            todaySessionTopics,
        };
    }

    /**
     * Calculate Topic ROI: exam weightage * (1 - mastery/100) * error frequency
     */
    private async calculateTopicROI(
        userId: string,
        attempts: AttemptWithDetails[]
    ): Promise<TopicROI[]> {
        // Get unique topics from attempts
        const topicIds = [...new Set(attempts.map((a) => a.question.topicId).filter(Boolean))];

        if (topicIds.length === 0) return [];

        // Fetch topic mastery data
        const masteryData = await prisma.topicMastery.findMany({
            where: {
                userId,
                topicId: { in: topicIds as string[] },
            },
            include: {
                topic: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        // Fetch topics with weightage
        const topics = await prisma.topic.findMany({
            where: {
                id: { in: topicIds as string[] },
            },
            include: {
                subject: true,
            },
        });

        // Calculate error frequency (last 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const errorCounts = new Map<string, number>();
        attempts.forEach((attempt) => {
            if (attempt.status === "INCORRECT" && attempt.question.topicId) {
                const count = errorCounts.get(attempt.question.topicId) || 0;
                errorCounts.set(attempt.question.topicId, count + 1);
            }
        });

        const topicROI: TopicROI[] = topics.map((topic) => {
            const mastery = masteryData.find((m) => m.topicId === topic.id);
            const masteryLevel = mastery?.masteryLevel || 0;
            const examWeightage = topic.weightage / 100 || 0.05; // Default 5% if not set
            const errorFrequency = errorCounts.get(topic.id) || 0;
            const lastPracticed = null; // TopicMastery doesn't track this directly

            // ROI = weightage * (1 - mastery/100) * (1 + errorFrequency)
            const roi = examWeightage * (1 - masteryLevel / 100) * (1 + errorFrequency);

            return {
                topicId: topic.id,
                topicName: topic.name,
                subjectId: topic.subjectId,
                subjectName: topic.subject?.name || "Unknown",
                examWeightage,
                masteryLevel,
                errorFrequency,
                lastPracticed,
                roi,
            };
        });

        // Sort by ROI descending
        return topicROI.sort((a, b) => b.roi - a.roi);
    }

    /**
     * Calculate volume metrics
     */
    private calculateVolumeMetrics(
        yesterdayAttempts: AttemptWithDetails[],
        last7DaysAttempts: any[],
        last30DaysAttempts: any[]
    ): VolumeMetrics {
        const yesterdayQuestions = yesterdayAttempts.length;
        const last7DaysAvg = last7DaysAttempts.length / 7;
        const last30DaysAvg = last30DaysAttempts.length / 30;

        // Subject distribution
        const subjectCounts = new Map<string, number>();
        yesterdayAttempts.forEach((attempt) => {
            const subject = attempt.question.subject?.name || "Unknown";
            subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
        });

        const subjectDistribution = Array.from(subjectCounts.entries()).map(
            ([subject, count]) => ({ subject, count })
        );

        return {
            yesterdayQuestions,
            last7DaysAvg,
            last30DaysAvg,
            subjectDistribution,
        };
    }

    /**
     * Calculate difficulty metrics
     */
    private calculateDifficultyMetrics(attempts: AttemptWithDetails[]): DifficultyMetrics {
        const difficultyGroups = {
            easy: attempts.filter((a) => a.question.difficulty === 1),
            medium: attempts.filter((a) => a.question.difficulty === 2 || a.question.difficulty === 3),
            hard: attempts.filter((a) => a.question.difficulty === 4 || a.question.difficulty === 5),
        };

        const total = attempts.length;
        const easyPercentage = (difficultyGroups.easy.length / total) * 100;
        const mediumPercentage = (difficultyGroups.medium.length / total) * 100;
        const hardPercentage = (difficultyGroups.hard.length / total) * 100;

        const avgDifficulty =
            attempts.reduce((sum, a) => sum + a.question.difficulty, 0) / total;

        // Accuracy by difficulty
        const accuracyByDifficulty = [1, 2, 3, 4, 5].map((difficulty) => {
            const diffAttempts = attempts.filter((a) => a.question.difficulty === difficulty);
            if (diffAttempts.length === 0) {
                return { difficulty, accuracy: 0 };
            }
            const correct = diffAttempts.filter((a) => a.status === "CORRECT").length;
            return {
                difficulty,
                accuracy: (correct / diffAttempts.length) * 100,
            };
        });

        return {
            avgDifficulty,
            easyPercentage,
            mediumPercentage,
            hardPercentage,
            accuracyByDifficulty,
        };
    }

    /**
     * Calculate consistency metrics
     */
    private async calculateConsistencyMetrics(
        userId: string,
        yesterdayAttempts: AttemptWithDetails[],
        last7DaysAttempts: any[]
    ): Promise<ConsistencyMetrics> {
        // Calculate streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if practiced yesterday
        if (yesterdayAttempts.length > 0) {
            currentStreak = 1;

            // Count backwards
            for (let i = 1; i < 365; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(checkDate.getDate() - i - 1);

                const dayAttempts = await prisma.attempt.count({
                    where: {
                        userId,
                        solvedAt: {
                            gte: checkDate,
                            lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000),
                        },
                    },
                });

                if (dayAttempts > 0) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // Missed days in last 7 days
        const last7DaysDates = new Set<string>();
        last7DaysAttempts.forEach((attempt) => {
            const date = new Date(attempt.solvedAt);
            date.setHours(0, 0, 0, 0);
            last7DaysDates.add(date.toISOString());
        });
        const missedDays = 7 - last7DaysDates.size;

        // Incomplete sessions in last 7 days
        const incompleteSessions = await prisma.practiceSession.count({
            where: {
                userId,
                isCompleted: false,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        });

        const avgDailyQuestions = last7DaysAttempts.length / 7;

        return {
            currentStreak,
            missedDays,
            incompleteSessions,
            avgDailyQuestions,
        };
    }

    /**
     * Classify mistakes into behavioral categories
     */
    private classifyMistakes(attempts: AttemptWithDetails[]): MistakeClassification {
        let sillyMistakes = 0;
        let conceptualMistakes = 0;
        let speedMistakes = 0;

        attempts.forEach((attempt) => {
            if (attempt.status === "INCORRECT" && attempt.mistake) {
                const mistake = attempt.mistake.toUpperCase();
                if (mistake === "CALCULATION" || mistake === "READING") {
                    sillyMistakes++;
                } else if (mistake === "CONCEPTUAL") {
                    conceptualMistakes++;
                } else if (mistake === "OVERCONFIDENCE") {
                    speedMistakes++;
                }
            }
        });

        const totalMistakes = attempts.filter((a) => a.status === "INCORRECT").length;

        return {
            sillyMistakes,
            conceptualMistakes,
            speedMistakes,
            totalMistakes,
        };
    }

    /**
     * Calculate days until exam
     */
    private calculateDaysUntilExam(targetYear: number | null): number {
        if (!targetYear) return 365; // Default 1 year

        // Assume exam in May of target year
        const examDate = new Date(targetYear, 4, 1); // May 1st
        const today = new Date();
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }

    /**
     * Determine exam phase based on days until exam
     */
    private determineExamPhase(daysUntilExam: number): ExamPhase {
        if (daysUntilExam < 30) return 'final_prep';
        if (daysUntilExam < 90) return 'consolidation';
        return 'foundation';
    }

    /**
     * Calculate subject breakdown
     */
    private calculateSubjectBreakdown(attempts: AttemptWithDetails[]): SubjectBreakdown[] {
        const subjectMap = new Map<string, {
            subjectId: string;
            subjectName: string;
            questionsAttempted: number;
            correctAnswers: number;
            wrongAnswers: number;
            timeSpent: number;
            mistakes: Map<string, number>;
            topicErrors: Map<string, TopicError>;
        }>();

        attempts.forEach((attempt) => {
            if (!attempt.question.subject) return;

            const subjectId = attempt.question.subject.id;
            const subjectName = attempt.question.subject.name;

            if (!subjectMap.has(subjectId)) {
                subjectMap.set(subjectId, {
                    subjectId,
                    subjectName,
                    questionsAttempted: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    timeSpent: 0,
                    mistakes: new Map(),
                    topicErrors: new Map(),
                });
            }

            const subject = subjectMap.get(subjectId)!;
            subject.questionsAttempted++;
            subject.timeSpent += (attempt.timing || 0) / 60;

            if (attempt.status === "CORRECT") {
                subject.correctAnswers++;
            } else if (attempt.status === "INCORRECT") {
                subject.wrongAnswers++;

                const mistakeType = (attempt.mistake || "other").toLowerCase();
                subject.mistakes.set(
                    mistakeType,
                    (subject.mistakes.get(mistakeType) || 0) + 1
                );

                if (attempt.question.topic) {
                    const topicId = attempt.question.topic.id;
                    if (!subject.topicErrors.has(topicId)) {
                        subject.topicErrors.set(topicId, {
                            topicId,
                            topicName: attempt.question.topic.name,
                            subtopicId: attempt.question.subTopic?.id,
                            subtopicName: attempt.question.subTopic?.name,
                            errorCount: 0,
                            mistakeTypes: [],
                        });
                    }
                    const topicError = subject.topicErrors.get(topicId)!;
                    topicError.errorCount++;
                    if (!topicError.mistakeTypes.includes(mistakeType)) {
                        topicError.mistakeTypes.push(mistakeType);
                    }
                }
            }
        });

        return Array.from(subjectMap.values()).map((subject) => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            questionsAttempted: subject.questionsAttempted,
            correctAnswers: subject.correctAnswers,
            wrongAnswers: subject.wrongAnswers,
            accuracy: (subject.correctAnswers / subject.questionsAttempted) * 100,
            timeSpent: subject.timeSpent,
            commonMistakes: Array.from(subject.mistakes.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type]) => type),
            topicsWithErrors: Array.from(subject.topicErrors.values())
                .sort((a, b) => b.errorCount - a.errorCount)
                .slice(0, 5),
        }));
    }

    /**
     * Calculate today's session topics
     */
    private calculateSessionTopics(attempts: AttemptWithDetails[]): SessionTopic[] {
        const topicMap = new Map<string, {
            subjectId: string;
            subjectName: string;
            topicId: string;
            topicName: string;
            subtopicId?: string;
            subtopicName?: string;
            questionsAttempted: number;
            correctAnswers: number;
        }>();

        attempts.forEach((attempt) => {
            if (!attempt.question.topic || !attempt.question.subject) return;

            const key = `${attempt.question.topic.id}-${attempt.question.subTopic?.id || 'none'}`;

            if (!topicMap.has(key)) {
                topicMap.set(key, {
                    subjectId: attempt.question.subject.id,
                    subjectName: attempt.question.subject.name,
                    topicId: attempt.question.topic.id,
                    topicName: attempt.question.topic.name,
                    subtopicId: attempt.question.subTopic?.id,
                    subtopicName: attempt.question.subTopic?.name,
                    questionsAttempted: 0,
                    correctAnswers: 0,
                });
            }

            const topic = topicMap.get(key)!;
            topic.questionsAttempted++;
            if (attempt.status === "CORRECT") {
                topic.correctAnswers++;
            }
        });

        return Array.from(topicMap.values()).map((topic) => ({
            ...topic,
            accuracy: (topic.correctAnswers / topic.questionsAttempted) * 100,
        }));
    }
}
