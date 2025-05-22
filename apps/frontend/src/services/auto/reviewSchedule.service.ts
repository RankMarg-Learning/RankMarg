import prisma from "@/lib/prisma";
import { addDays, startOfDay } from "date-fns";

interface ReviewParams {
    masteryLevel: number;
    strengthIndex: number;
    lastReviewedAt: Date;
    completedReviews: number;
    retentionStrength: number;
}
export class ReviewScheduleService {
    private readonly baseInterval = 1; // Base interval in days
    private readonly maxInterval = 60; // Maximum interval in days
    private readonly decayFactor = 0.9; // Memory decay factor
    private readonly strengthMultiplier = 0.15; // Impact of strength index on interval
    async processUserBatch(batchSize: number, offset: number) {
        const userTopicPairs = await prisma.topicMastery.findMany({
            select: {
                userId: true,
                topicId: true
            },
            skip: offset,
            take: batchSize,
            orderBy: {
                id: 'asc'
            }
        });
        const results = {
            totalProcessed: userTopicPairs.length,
            updated: 0,
            created: 0,
            errors: 0
        };

        for (const { userId, topicId } of userTopicPairs) {
            try {
                // Check if schedule exists
                const existingSchedule = await prisma.reviewSchedule.findUnique({
                    where: {
                        userId_topicId: { userId, topicId }
                    }
                });

                // Update or create schedule
                await this.updateReviewSchedule(userId, topicId);

                if (existingSchedule) {
                    results.updated++;
                } else {
                    results.created++;
                }
            } catch (error) {
                console.error(`Error processing review for user ${userId}, topic ${topicId}:`, error);
                results.errors++;
            }
        }
    }


    public calculateNextReview(params: ReviewParams): { nextReviewAt: Date; reviewInterval: number } {
        const { masteryLevel, strengthIndex, lastReviewedAt, completedReviews, retentionStrength } = params;

        // Base interval calculation using mastery level
        const baseMultiplier = 1 + (masteryLevel / 20);

        // Strength index adjustment (higher strength = longer intervals)
        const strengthBonus = strengthIndex * this.strengthMultiplier;

        // Prior reviews adjustment (more reviews = more confidence in knowledge)
        const reviewsBonus = completedReviews > 0 ? Math.log10(completedReviews) * 0.3 : 0;

        // Retention strength factor (higher retention = longer intervals)
        const retentionFactor = 1 + (retentionStrength / 2);

        // Calculate interval days - SuperMemo-2 inspired formula with adjustments
        let intervalDays = this.baseInterval * baseMultiplier * retentionFactor;
        intervalDays *= (1 + strengthBonus + reviewsBonus);

        // Apply decay factor for long intervals
        if (intervalDays > 7) {
            intervalDays = 7 + (intervalDays - 7) * this.decayFactor;
        }

        // Round to ensure whole days
        const finalInterval = Math.min(Math.round(intervalDays), this.maxInterval);

        // Calculate next review date
        const nextReviewAt = addDays(startOfDay(lastReviewedAt), finalInterval);

        return { nextReviewAt, reviewInterval: finalInterval };
    }

    public calculateRetentionStrength(correctAttempts: number, totalAttempts: number, avgTime: number, idealTime: number): number {
        if (totalAttempts === 0) return 0.5; // Default for no attempts

        // Accuracy component (0-1)
        const accuracy = correctAttempts / totalAttempts;

        // Time efficiency component (0-1)
        const timeRatio = idealTime / Math.max(avgTime, 1);
        const timeEfficiency = Math.min(Math.max(timeRatio, 0), 1);

        // Combine with weighted formula (accuracy is more important)
        const retention = (accuracy * 0.7) + (timeEfficiency * 0.3);

        // Scale to 0-1 range
        return Math.min(Math.max(retention, 0), 1);
    }

    public calculateForgettingProbability(retentionStrength: number, daysSinceReview: number): number {
        // Forgetting curve formula: P = e^(-k*t)
        // where k is inversely related to retention strength
        const k = 1 / (1 + retentionStrength * 10); // Decay constant, lower for stronger retention
        const probability = Math.exp(-k * daysSinceReview);

        return Math.min(Math.max(probability, 0), 1);
    }

    /**
     * Update review schedule for a user-topic pair
     */
    public async updateReviewSchedule(userId: string, topicId: string): Promise<any> {
        // Get topic mastery data
        const topicMastery = await prisma.topicMastery.findUnique({
            where: {
                userId_topicId: { userId, topicId }
            }
        });

        if (!topicMastery) {
            throw new Error(`No mastery data found for user ${userId} and topic ${topicId}`);
        }

        // Get current review schedule if exists
        const currentSchedule = await prisma.reviewSchedule.findUnique({
            where: {
                userId_topicId: { userId, topicId }
            }
        });

        // Calculate review parameters
        const now = new Date();
        let lastReviewedAt = now;
        let completedReviews = 0;
        let retentionStrength = 0.5; // Default retention strength

        if (currentSchedule) {
            lastReviewedAt = currentSchedule.lastReviewedAt;
            completedReviews = currentSchedule.completedReviews;
            retentionStrength = currentSchedule.retentionStrength;
        }

        // Calculate average time for topic attempts
        const attempts = await prisma.attempt.findMany({
            where: {
                userId,
                question: {
                    topicId
                }
            },
            orderBy: {
                solvedAt: 'desc'
            },
            take: 20 // Consider recent attempts
        });

        const totalTime = attempts.reduce((sum, a) => sum + (a.timing || 0), 0);
        const avgTime = attempts.length > 0 ? totalTime / attempts.length : 60; // Default to 60 seconds
        const idealTime = 60; // Ideal time in seconds

        // Recalculate retention strength if needed
        if (attempts.length > 0) {
            const correctAttempts = attempts.filter(a => a.status === 'CORRECT').length;
            retentionStrength = this.calculateRetentionStrength(
                correctAttempts,
                attempts.length,
                avgTime,
                idealTime
            );
        }

        // Calculate next review parameters
        const review = this.calculateNextReview({
            masteryLevel: topicMastery.masteryLevel,
            strengthIndex: topicMastery.strengthIndex,
            lastReviewedAt,
            completedReviews,
            retentionStrength
        });

        // Update or create review schedule
        return await prisma.reviewSchedule.upsert({
            where: {
                userId_topicId: { userId, topicId }
            },
            update: {
                nextReviewAt: review.nextReviewAt,
                reviewInterval: review.reviewInterval,
                retentionStrength
            },
            create: {
                userId,
                topicId,
                lastReviewedAt,
                nextReviewAt: review.nextReviewAt,
                reviewInterval: review.reviewInterval,
                retentionStrength,
                completedReviews: 0
            }
        });
    }
}