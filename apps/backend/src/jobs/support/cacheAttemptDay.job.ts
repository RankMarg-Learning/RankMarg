import { Logger } from "@/lib/logger";
import prisma from "@repo/db";
import { RedisCacheService } from "@/services/redisCache.service";
import { AttemptsDayData } from "@/types/attemptConfig.type";
import { AttemptType, SubmitStatus } from "@repo/db/enums";
import { BATCH_SIZE } from "@/config/cron.config";



const logger = new Logger("Cache Attempt Day Job");



interface UserBatch {
    id: string;
    name: string | null;
}

/**
 * Fetches attempt data for a specific user for the current day
 */
export async function fetchUserDayAttempts(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<AttemptsDayData[]> {
    try {

        const attempts = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                questionId: true,
                type: true,
                answer: true,
                mistake: true,
                timing: true,
                reactionTime: true,
                status: true,
                hintsUsed: true,
                solvedAt: true,
                question: {
                    select: {
                        difficulty: true,
                        subjectId: true,
                        topicId: true,
                        subtopicId: true,
                        category: {
                            select: {
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                solvedAt: "asc",
            },
        });

        if (attempts.length === 0) {
            return [];
        }


        const subjectIds = new Set<string>();
        const topicIds = new Set<string>();
        const subtopicIds = new Set<string>();

        attempts.forEach((attempt) => {
            if (attempt.question.subjectId) subjectIds.add(attempt.question.subjectId);
            if (attempt.question.topicId) topicIds.add(attempt.question.topicId);
            if (attempt.question.subtopicId) subtopicIds.add(attempt.question.subtopicId);
        });

        const [subjects, topics, subtopics] = await Promise.all([
            subjectIds.size > 0
                ? prisma.subject.findMany({
                    where: { id: { in: Array.from(subjectIds) } },
                    select: { id: true, name: true },
                })
                : [],
            topicIds.size > 0
                ? prisma.topic.findMany({
                    where: { id: { in: Array.from(topicIds) } },
                    select: { id: true, name: true },
                })
                : [],
            subtopicIds.size > 0
                ? prisma.subTopic.findMany({
                    where: { id: { in: Array.from(subtopicIds) } },
                    select: { id: true, name: true },
                })
                : [],
        ]);

        const subjectMap = new Map<string, string>(subjects.map((s) => [s.id, s.name] as [string, string]));
        const topicMap = new Map<string, string>(topics.map((t) => [t.id, t.name] as [string, string]));
        const subtopicMap = new Map<string, string>(subtopics.map((st) => [st.id, st.name] as [string, string]));

        const transformedAttempts: AttemptsDayData[] = attempts.map((attempt) => ({
            id: attempt.id,
            questionId: attempt.questionId,
            type: attempt.type as AttemptType,
            answer: attempt.answer || "",
            mistake: attempt.mistake || "",
            timing: attempt.timing || 0,
            reactionTime: attempt.reactionTime || 0,
            status: attempt.status as SubmitStatus,
            hintsUsed: attempt.hintsUsed,
            solvedAt: attempt.solvedAt,
            subject: {
                id: attempt.question.subjectId || "",
                name: subjectMap.get(attempt.question.subjectId || "") || "",
            },
            topic: {
                id: attempt.question.topicId || "",
                name: topicMap.get(attempt.question.topicId || "") || "",
            },
            subtopic: attempt.question.subtopicId
                ? [
                    {
                        id: attempt.question.subtopicId,
                        name: subtopicMap.get(attempt.question.subtopicId) || "",
                    },
                ]
                : [],
            difficulty: attempt.question.difficulty,
            category: attempt.question.category.map((c) => c.category),
        }));

        return transformedAttempts;
    } catch (error) {
        logger.error(
            `Failed to fetch attempts for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        throw error;
    }
}

/**
 * Processes a batch of users and caches their day's attempt data
 */
async function processBatch(
    users: UserBatch[],
    startDate: Date,
    endDate: Date,
    dateString: string
): Promise<{
    success: number;
    failed: number;
    errors: string[];
}> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const user of users) {
        try {
            const attempts = await fetchUserDayAttempts(
                user.id,
                startDate,
                endDate
            );

            if (attempts.length > 0) {
                const cached = await RedisCacheService.cacheAttemptDay(
                    user.id,
                    dateString,
                    attempts
                );

                if (cached) {
                    success++;
                    logger.info(
                        `Cached ${attempts.length} attempts for user ${user.name || user.id}`
                    );
                } else {
                    failed++;
                    errors.push(
                        `Failed to cache attempts for user ${user.name || user.id}`
                    );
                }
            } else {
                // User has no attempts today - still count as success
                success++;
                logger.debug(`No attempts found for user ${user.name || user.id}`);
            }
        } catch (error) {
            failed++;
            const errorMsg = `User ${user.name || user.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
            errors.push(errorMsg);
            logger.error(errorMsg);
        }
    }

    return { success, failed, errors };
}

/**
 * Main job function - caches attempt day data for all active users
 */
export const cacheAttemptDayJob = async (): Promise<void> => {
    const jobStartTime = Date.now();
    logger.info("Starting Cache Attempt Day Job");

    try {
        // Define time range: 12:00 AM to 11:50 PM of current day
        const now = new Date();
        const startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0); // 12:00 AM

        const endDate = new Date(now);
        endDate.setHours(23, 50, 0, 0); // 11:50 PM

        const dateString = startDate.toISOString().split("T")[0]; // YYYY-MM-DD format

        logger.info(`Caching attempts from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        logger.info(`Date key: ${dateString}`);

        // Fetch all active users
        const totalUsers = await prisma.user.count({
            where: {
                isActive: true,
            },
        });

        logger.info(`Found ${totalUsers} active users to process`);

        if (totalUsers === 0) {
            logger.warn("No active users found. Job completed with no work.");
            return;
        }

        let totalSuccess = 0;
        let totalFailed = 0;
        const allErrors: string[] = [];

        // Process users in batches
        for (let skip = 0; skip < totalUsers; skip += BATCH_SIZE) {
            const batchNumber = Math.floor(skip / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(totalUsers / BATCH_SIZE);

            logger.info(
                `Processing batch ${batchNumber}/${totalBatches} (${skip + 1}-${Math.min(skip + BATCH_SIZE, totalUsers)})`
            );

            const users = await prisma.user.findMany({
                where: {
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                },
                skip,
                take: BATCH_SIZE,
            });

            const { success, failed, errors } = await processBatch(
                users,
                startDate,
                endDate,
                dateString
            );

            totalSuccess += success;
            totalFailed += failed;
            allErrors.push(...errors);

            logger.info(
                `Batch ${batchNumber} completed: ${success} successful, ${failed} failed`
            );
        }

        const jobDuration = Date.now() - jobStartTime;

        logger.info("=".repeat(60));
        logger.info("Cache Attempt Day Job Summary");
        logger.info("=".repeat(60));
        logger.info(`Total users processed: ${totalUsers}`);
        logger.info(`Successful: ${totalSuccess}`);
        logger.info(`Failed: ${totalFailed}`);
        logger.info(`Job duration: ${jobDuration}ms (${(jobDuration / 1000).toFixed(2)}s)`);

        if (allErrors.length > 0) {
            logger.warn(`Encountered ${allErrors.length} errors:`);
            allErrors.slice(0, 10).forEach((error, idx) => {
                logger.warn(`  ${idx + 1}. ${error}`);
            });
            if (allErrors.length > 10) {
                logger.warn(`  ... and ${allErrors.length - 10} more errors`);
            }
        }

        logger.info("=".repeat(60));

        // Don't throw error if some users failed - partial success is acceptable
        if (totalFailed === totalUsers && totalUsers > 0) {
            throw new Error(
                "All users failed to process. Check logs for details."
            );
        }
    } catch (error) {
        const jobDuration = Date.now() - jobStartTime;
        logger.error(
            `Cache Attempt Day Job failed after ${jobDuration}ms: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        throw error;
    }
};
