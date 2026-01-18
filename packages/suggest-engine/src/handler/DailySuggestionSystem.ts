import { SuggestionHandler } from "../types";

export class DailySuggestionSystem implements SuggestionHandler {
  async generate(userId: string): Promise<void> {
    try {
      const { DailyCoachOrchestrator } = await import("../orchestrator/DailyCoachOrchestrator.js");
      const orchestrator = new DailyCoachOrchestrator();

      const suggestions = await orchestrator.orchestrateDailyCoaching(userId);
      const { SuggestionRepository } = await import("../repository/SuggestionRepository.js");
      const repository = new SuggestionRepository();

      await repository.saveSuggestions(suggestions, userId);

    } catch (error) {
      console.error(`[DailySuggestionSystem] ===== ERROR: Failed to generate Rank Coach suggestions for user ${userId} =====`);
      console.error(`[DailySuggestionSystem] Error details:`, error);
      throw error;
    }
  }
}
