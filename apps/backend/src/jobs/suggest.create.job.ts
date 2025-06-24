import { logger } from "@/lib/logger";
import { SuggestionService } from "@/services/auto/suggest.service";

export const createSuggestion = async () => {
  try {
    logger.info("Running Suggestion Job");
    const session = new SuggestionService();
    await session.processAllUsers();
    logger.info("Suggestion Job completed successfully");
  } catch (error) {
    logger.error(
      `Error in Suggestion Job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
