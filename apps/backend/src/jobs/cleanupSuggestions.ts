import { SuggestionRepository } from "../services/suggest-engine";

/**
 * Cleanup expired suggestions (TTL-based)
 * Runs daily at 2 AM to remove suggestions older than 7 days
 */
export async function cleanupExpiredSuggestions() {
    try {
        console.log("[Cleanup Job] Starting expired suggestions cleanup...");

        const repository = new SuggestionRepository();
        const deletedCount = await repository.cleanupExpiredSuggestions();

        console.log(`[Cleanup Job] Successfully deleted ${deletedCount} expired suggestions`);

        return {
            success: true,
            deletedCount,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("[Cleanup Job] Error cleaning up expired suggestions:", error);
        throw error;
    }
}

/**
 * Cleanup old suggestions (older than 30 days)
 * Additional safety cleanup for suggestions that might have missed TTL
 */
export async function cleanupOldSuggestions() {
    try {
        console.log("[Cleanup Job] Starting old suggestions cleanup (30+ days)...");

        const repository = new SuggestionRepository();
        const deletedCount = await repository.cleanupOldSuggestions();

        console.log(`[Cleanup Job] Successfully deleted ${deletedCount} old suggestions`);

        return {
            success: true,
            deletedCount,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("[Cleanup Job] Error cleaning up old suggestions:", error);
        throw error;
    }
}
