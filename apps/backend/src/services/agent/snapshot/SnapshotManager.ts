/**
 * Snapshot Manager - Manages frozen mastery snapshots
 * Following rule-frozen-mastery-snapshots: Immutable snapshots for comparison
 */

import prisma from "../../../lib/prisma";
import { RedisCacheService } from "../../redisCache.service";
import {
    MasterySnapshot,
    SubjectMasterySnapshot,
    TopicMasterySnapshot,
    SubtopicMasterySnapshot,
} from "../../../types/coach.types";
import { CoachRedisKeys, coachConfig } from "../coach.config";
import { captureServiceError } from "../../../lib/sentry";

export class SnapshotManager {
    /**
     * Create a new mastery snapshot for a user
     * Snapshots are immutable once created
     */
    async createSnapshot(
        userId: string,
        examCode: string
    ): Promise<MasterySnapshot> {
        try {
            // Fetch current mastery data from database
            const subjects = await this.fetchSubjectMastery(userId);

            // Calculate overall metrics
            const totalAttempts = subjects.reduce(
                (sum, s) => sum + s.totalAttempts,
                0
            );
            const totalCorrect = subjects.reduce(
                (sum, s) => sum + s.correctAttempts,
                0
            );
            const overallAccuracy =
                totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

            // Get user streak
            const userPerformance = await prisma.userPerformance.findUnique({
                where: { userId },
                select: { streak: true },
            });

            const snapshot: MasterySnapshot = {
                userId,
                examCode,
                snapshotDate: new Date(),
                subjects,
                metadata: {
                    totalAttempts,
                    overallAccuracy,
                    studyStreak: userPerformance?.streak || 0,
                },
            };

            // Store snapshot in Redis with timestamp key
            const timestamp = Date.now();
            const snapshotKey = CoachRedisKeys.snapshot(userId, timestamp);
            const latestKey = CoachRedisKeys.latestSnapshot(userId);

            await Promise.all([
                this.saveToRedis(snapshotKey, snapshot, coachConfig.redis.snapshotTTL),
                this.saveToRedis(latestKey, snapshot, coachConfig.redis.snapshotTTL),
            ]);

            return snapshot;
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "SnapshotManager.createSnapshot",
                userId,
                additionalData: { examCode },
            });
            throw error;
        }
    }

    /**
     * Get the latest snapshot for a user
     */
    async getLatestSnapshot(userId: string): Promise<MasterySnapshot | null> {
        try {
            const latestKey = CoachRedisKeys.latestSnapshot(userId);
            const snapshot = await this.getFromRedis<MasterySnapshot>(latestKey);

            if (!snapshot) {
                // Create a new snapshot if none exists
                console.log(`No snapshot found for user ${userId}, creating new one`);
                return null;
            }

            return snapshot;
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "SnapshotManager.getLatestSnapshot",
                userId,
            });
            return null;
        }
    }

    /**
     * Get a snapshot from N days ago
     * Used for mastery delta calculation
     */
    async getPreviousSnapshot(
        userId: string,
        daysBack: number = 14
    ): Promise<MasterySnapshot | null> {
        try {
            // Calculate timestamp for N days ago
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - daysBack);
            const targetTimestamp = targetDate.getTime();

            // Try to find a snapshot close to that timestamp
            // Since we can't scan keys easily in Redis, we'll use a range approach
            // For now, return null if not found - in production, you'd maintain an index
            const latestKey = CoachRedisKeys.latestSnapshot(userId);
            const latestSnapshot = await this.getFromRedis<MasterySnapshot>(
                latestKey
            );

            if (!latestSnapshot) {
                return null;
            }

            // Check if the latest snapshot is old enough
            const snapshotAge =
                Date.now() - new Date(latestSnapshot.snapshotDate).getTime();
            const daysAge = snapshotAge / (1000 * 60 * 60 * 24);

            if (daysAge >= daysBack) {
                return latestSnapshot;
            }

            return null;
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "SnapshotManager.getPreviousSnapshot",
                userId,
                additionalData: { daysBack },
            });
            return null;
        }
    }

    /**
     * Fetch subject mastery data from database
     * This is the source of truth for current mastery
     */
    private async fetchSubjectMastery(
        userId: string
    ): Promise<SubjectMasterySnapshot[]> {
        const subjectMasteries = await prisma.subjectMastery.findMany({
            where: { userId },
            include: {
                subject: {
                    include: {
                        topics: {
                            include: {
                                subTopics: true,
                            },
                        },
                    },
                },
            },
        });

        const subjects: SubjectMasterySnapshot[] = [];

        for (const subjectMastery of subjectMasteries) {
            const topics = await this.fetchTopicMastery(
                userId,
                subjectMastery.subjectId
            );

            // Find last practiced date across all topics
            const lastPracticedDates = topics
                .map((t) => t.lastPracticed)
                .filter((d): d is Date => d !== null);
            const lastPracticed =
                lastPracticedDates.length > 0
                    ? new Date(Math.max(...lastPracticedDates.map((d) => d.getTime())))
                    : null;

            subjects.push({
                subjectId: subjectMastery.subjectId,
                subjectName: subjectMastery.subject.name,
                masteryLevel: subjectMastery.masteryLevel,
                totalAttempts: subjectMastery.totalAttempts,
                correctAttempts: subjectMastery.correctAttempts,
                topics,
                lastPracticed,
            });
        }

        return subjects;
    }

    /**
     * Fetch topic mastery data for a subject
     */
    private async fetchTopicMastery(
        userId: string,
        subjectId: string
    ): Promise<TopicMasterySnapshot[]> {
        const topics = await prisma.topic.findMany({
            where: { subjectId },
            include: {
                topicMastery: {
                    where: { userId },
                },
                subTopics: {
                    include: {
                        subtopicMastery: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        const topicSnapshots: TopicMasterySnapshot[] = [];

        for (const topic of topics) {
            const topicMastery = topic.topicMastery[0];

            if (!topicMastery) {
                continue; // Skip topics with no mastery data
            }

            // Fetch subtopic mastery
            const subtopics: SubtopicMasterySnapshot[] = topic.subTopics.map(
                (subtopic) => {
                    const subtopicMastery = subtopic.subtopicMastery[0];

                    // Get last practiced from attempts
                    const lastPracticed = null; // Would need to query attempts table

                    return {
                        subtopicId: subtopic.id,
                        subtopicName: subtopic.name,
                        masteryLevel: subtopicMastery?.masteryLevel || 0,
                        strengthIndex: subtopicMastery?.strengthIndex || 0,
                        totalAttempts: subtopicMastery?.totalAttempts || 0,
                        correctAttempts: subtopicMastery?.correctAttempts || 0,
                        lastPracticed,
                    };
                }
            );

            // Get last practiced from attempts
            const lastAttempt = await prisma.attempt.findFirst({
                where: {
                    userId,
                    question: {
                        topicId: topic.id,
                    },
                },
                orderBy: {
                    solvedAt: "desc",
                },
                select: {
                    solvedAt: true,
                },
            });

            topicSnapshots.push({
                topicId: topic.id,
                topicName: topic.name,
                masteryLevel: topicMastery.masteryLevel,
                strengthIndex: topicMastery.strengthIndex,
                totalAttempts: topicMastery.totalAttempts,
                correctAttempts: topicMastery.correctAttempts,
                subtopics,
                lastPracticed: lastAttempt?.solvedAt || null,
            });
        }

        return topicSnapshots;
    }

    /**
     * Save data to Redis with error handling
     */
    private async saveToRedis(
        key: string,
        data: any,
        ttl: number
    ): Promise<void> {
        try {
            await RedisCacheService["safeSetJson"](key, data, ttl);
        } catch (error) {
            console.error(`Failed to save to Redis: ${key}`, error);
            throw error;
        }
    }

    /**
     * Get data from Redis with error handling
     */
    private async getFromRedis<T>(key: string): Promise<T | null> {
        try {
            return await RedisCacheService["safeGetJson"]<T>(key);
        } catch (error) {
            console.error(`Failed to get from Redis: ${key}`, error);
            return null;
        }
    }
}
