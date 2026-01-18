import { TriggerType } from "@repo/db/enums";
import { DailySuggestionSystem } from "./handler/DailySuggestionSystem";

export class SuggestionEngine {
  private triggerTypes: TriggerType[];
  private userId: string;

  constructor(triggerTypes: TriggerType[], userId: string) {
    this.triggerTypes = triggerTypes;
    this.userId = userId;
  }

  async execute(): Promise<void> {
    for (const type of this.triggerTypes) {
      try {
        switch (type) {
          case TriggerType.DAILY_ANALYSIS:
            await new DailySuggestionSystem().generate(this.userId);
            break;
          default:
            console.log(`[SuggestionEngine] Unknown trigger type: ${type}`);
            break;
        }
      } catch (error) {
        console.error(`[SuggestionEngine] Error processing ${type} for user ${this.userId}:`, error);
        throw error;
      }
    }
  }
}
