import { PrismaClient, TriggerType } from "@prisma/client";
import { SuggestionHandler } from "../types";
import { SessionAnalysisHandler } from "./sessionAnalysisHandler";

// Handler Factory
export class HandlerFactory {
  static getHandler(
    triggerType: TriggerType,
    dbService: PrismaClient
  ): SuggestionHandler {
    switch (triggerType) {
      case TriggerType.SESSION_ANALYSIS:
        return new SessionAnalysisHandler(dbService);

      default:
        throw new Error(`Unknown trigger type: ${triggerType}`);
    }
  }
}
