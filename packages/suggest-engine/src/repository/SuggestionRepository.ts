import prisma from "../lib/prisma";
import { SuggestionType, TriggerType, SuggestionStatus } from "@repo/db/enums";
import { CoachSuggestion } from "../types/coach.types";

/**
 * SuggestionRepository
 * 
 * Data access layer for suggestions with caching and optimization.
 * Handles all database operations for coaching suggestions.
 */
export class SuggestionRepository {
    /**
     * Save multiple suggestions with sequence order
     */
    async saveSuggestions(
        suggestions: CoachSuggestion[],
        userId: string
    ): Promise<void> {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days TTL

        // Batch insert for performance
        await prisma.studySuggestion.createMany({
            data: suggestions.map((suggestion, index) => ({
                userId,
                type: suggestion.type,
                triggerType: TriggerType.DAILY_ANALYSIS,
                suggestion: suggestion.message,
                category: suggestion.category,
                priority: suggestion.priority,
                actionName: suggestion.actionName || null,
                actionUrl: suggestion.actionUrl || null,
                status: SuggestionStatus.ACTIVE,
                sequenceOrder: index + 1,
                expiresAt,
                displayUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            })),
        });
    }

    /**
     * Get active suggestions for a user (ordered by sequence)
     */
    async getActiveSuggestions(userId: string) {
        return prisma.studySuggestion.findMany({
            where: {
                userId,
                status: SuggestionStatus.ACTIVE,
                displayUntil: {
                    gte: new Date(),
                },
            },
            orderBy: [
                { sequenceOrder: "asc" },
                { createdAt: "desc" },
            ],
        });
    }

    /**
     * Get today's suggestions for a user
     */
    async getTodaySuggestions(userId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return prisma.studySuggestion.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startOfDay,
                },
            },
            orderBy: [
                { sequenceOrder: "asc" },
                { createdAt: "desc" },
            ],
        });
    }

    /**
     * Mark suggestion as viewed
     */
    async markAsViewed(suggestionId: string): Promise<void> {
        await prisma.studySuggestion.update({
            where: { id: suggestionId },
            data: { status: SuggestionStatus.VIEWED },
        });
    }

    /**
     * Mark suggestion as completed (action taken)
     */
    async markAsCompleted(suggestionId: string): Promise<void> {
        await prisma.studySuggestion.update({
            where: { id: suggestionId },
            data: { status: SuggestionStatus.DISMISSED },
        });
    }

    /**
     * Mark suggestion as streamed (SSE delivery tracking)
     */
    async markAsStreamed(suggestionId: string): Promise<void> {
        // Update status to VIEWED when streamed
        await prisma.studySuggestion.update({
            where: { id: suggestionId },
            data: {
                status: SuggestionStatus.VIEWED,
            },
        });
    }

    /**
     * Cleanup expired suggestions (TTL-based)
     */
    async cleanupExpiredSuggestions(): Promise<number> {
        const result = await prisma.studySuggestion.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        return result.count;
    }

    /**
     * Cleanup old suggestions (older than 30 days, regardless of TTL)
     */
    async cleanupOldSuggestions(): Promise<number> {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await prisma.studySuggestion.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        return result.count;
    }

    /**
     * Get suggestion count for a user (for analytics)
     */
    async getSuggestionCount(userId: string, days: number = 7): Promise<number> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return prisma.studySuggestion.count({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                },
            },
        });
    }

    /**
     * Get suggestion engagement metrics
     */
    async getEngagementMetrics(userId: string, days: number = 7) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const suggestions = await prisma.studySuggestion.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                status: true,
                actionUrl: true,
            },
        });

        const total = suggestions.length;
        const viewed = suggestions.filter((s) => s.status === SuggestionStatus.VIEWED).length;
        const dismissed = suggestions.filter((s) => s.status === SuggestionStatus.DISMISSED).length;
        const withActions = suggestions.filter((s) => s.actionUrl !== null).length;

        return {
            total,
            viewed,
            dismissed,
            active: total - viewed - dismissed,
            viewRate: total > 0 ? (viewed / total) * 100 : 0,
            dismissRate: total > 0 ? (dismissed / total) * 100 : 0,
            actionRate: withActions > 0 ? (dismissed / withActions) * 100 : 0,
        };
    }

    /**
     * Deactivate all active suggestions for a user (for testing/reset)
     */
    async deactivateAllSuggestions(userId: string): Promise<number> {
        const result = await prisma.studySuggestion.updateMany({
            where: {
                userId,
                status: SuggestionStatus.ACTIVE,
            },
            data: {
                status: SuggestionStatus.DISMISSED,
            },
        });

        return result.count;
    }

    /**
     * Check if user has suggestions for today
     */
    async hasTodaySuggestions(userId: string): Promise<boolean> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await prisma.studySuggestion.count({
            where: {
                userId,
                createdAt: {
                    gte: startOfDay,
                },
            },
        });

        return count > 0;
    }
}
