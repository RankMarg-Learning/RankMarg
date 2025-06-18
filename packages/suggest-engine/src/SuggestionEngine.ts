import { TriggerType } from "@prisma/client";
import prisma from "./lib/prisma";
import { GeneratedSuggestion, SuggestionContext } from "./types";
import { HandlerFactory } from "./handler";

export class SuggestionEngine {
  async generateSuggestions(
    userId: string,
    triggerType: TriggerType
  ): Promise<GeneratedSuggestion[]> {
    const handler = HandlerFactory.getHandler(triggerType, prisma);

    const suggestions = await handler.generate({
      userId,
      triggerType,
      currentDate: new Date(),
    });
    await this.storeSuggestions(userId, suggestions);
    return suggestions;
  }

  async batchGenerateSuggestions(
    userIds: string[],
    triggerType: TriggerType,
    chunkSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((userId) => this.generateSuggestions(userId, triggerType))
      );
    }
  }
  private async storeSuggestions(
    userId: string,
    suggestions: GeneratedSuggestion[]
  ): Promise<void> {
    const existing = await prisma.studySuggestion.findMany({
      where: { userId, status: "ACTIVE", displayUntil: { gt: new Date() } },
    });

    const newSuggestions = suggestions.filter(
      (s) => !existing.some((e) => e.suggestion === s.suggestion)
    );

    await prisma.$transaction(
      newSuggestions.map((suggestion) =>
        prisma.studySuggestion.create({
          data: {
            userId,
            suggestion: suggestion.suggestion,
            type: suggestion.type,
            category: suggestion.category,
            priority: suggestion.priority,
            actionName: suggestion.actionName,
            actionUrl: suggestion.actionUrl,
            triggerType: suggestion.triggerType,
            displayUntil: suggestion.displayUntil,
          },
        })
      )
    );
  }
}
