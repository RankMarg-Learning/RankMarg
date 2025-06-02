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
    private readonly baseInterval = 1; 
    private readonly maxInterval = 60; 
    private readonly decayFactor = 0.9; 
    private readonly strengthMultiplier = 0.15; 
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
                const existingSchedule = await prisma.reviewSchedule.findUnique({
                    where: {
                        userId_topicId: { userId, topicId }
                    }
                });

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

        const baseMultiplier = 1 + (masteryLevel / 20);

        const strengthBonus = strengthIndex * this.strengthMultiplier;

        const reviewsBonus = completedReviews > 0 ? Math.log10(completedReviews) * 0.3 : 0;

        const retentionFactor = 1 + (retentionStrength / 2);

        let intervalDays = this.baseInterval * baseMultiplier * retentionFactor;
        intervalDays *= (1 + strengthBonus + reviewsBonus);

        if (intervalDays > 7) {
            intervalDays = 7 + (intervalDays - 7) * this.decayFactor;
        }

        const finalInterval = Math.min(Math.round(intervalDays), this.maxInterval);

        const nextReviewAt = addDays(startOfDay(lastReviewedAt), finalInterval);

        return { nextReviewAt, reviewInterval: finalInterval };
    }

    public calculateRetentionStrength(correctAttempts: number, totalAttempts: number, avgTime: number, idealTime: number): number {
        if (totalAttempts === 0) return 0.5; 

        const accuracy = correctAttempts / totalAttempts;
        const timeRatio = idealTime / Math.max(avgTime, 1);
        const timeEfficiency = Math.min(Math.max(timeRatio, 0), 1);
        const retention = (accuracy * 0.7) + (timeEfficiency * 0.3);

        return Math.min(Math.max(retention, 0), 1);
    }

    public calculateForgettingProbability(retentionStrength: number, daysSinceReview: number): number {
        const k = 1 / (1 + retentionStrength * 10); 
        const probability = Math.exp(-k * daysSinceReview);

        return Math.min(Math.max(probability, 0), 1);
    }

    
    public async updateReviewSchedule(userId: string, topicId: string): Promise<any> {

        const topicMastery = await prisma.topicMastery.findUnique({
            where: {
                userId_topicId: { userId, topicId }
            }
        });

        if (!topicMastery) {
            throw new Error(`No mastery data found for user ${userId} and topic ${topicId}`);
        }

        const currentSchedule = await prisma.reviewSchedule.findUnique({
            where: {
                userId_topicId: { userId, topicId }
            }
        });

        const now = new Date();
        let lastReviewedAt = now;
        let completedReviews = 0;
        let retentionStrength = 0.5; 

        if (currentSchedule) {
            lastReviewedAt = currentSchedule.lastReviewedAt;
            completedReviews = currentSchedule.completedReviews;
            retentionStrength = currentSchedule.retentionStrength;
        }

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
            take: 20
        });

        const totalTime = attempts.reduce((sum, a) => sum + (a.timing || 0), 0);
        const avgTime = attempts.length > 0 ? totalTime / attempts.length : 60; 
        const idealTime = 60; 

        if (attempts.length > 0) {
            const correctAttempts = attempts.filter(a => a.status === 'CORRECT').length;
            retentionStrength = this.calculateRetentionStrength(
                correctAttempts,
                attempts.length,
                avgTime,
                idealTime
            );
        }

        const review = this.calculateNextReview({
            masteryLevel: topicMastery.masteryLevel,
            strengthIndex: topicMastery.strengthIndex,
            lastReviewedAt,
            completedReviews,
            retentionStrength
        });

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