import { TriggerType } from "@repo/db/enums";
import { DailySuggestionSystem } from "./handler/DailySuggestionSystem";

export class SuggestionEngine {
  private triggerTypes: TriggerType[];
  private userId: string;

  constructor(triggerTypes: TriggerType[], userId: string) {
    this.triggerTypes = triggerTypes;
    this.userId = userId;
    this.initializeHandlers();
  }

  private initializeHandlers() {
    for (const type of this.triggerTypes) {
      switch (type) {
        case TriggerType.DAILY_ANALYSIS:
          new DailySuggestionSystem().generate(this.userId);
          break;
        default:
          break;
      }
    }
  }
}
