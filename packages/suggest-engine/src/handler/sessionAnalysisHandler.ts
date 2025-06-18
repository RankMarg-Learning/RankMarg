import { PracticeSession, PrismaClient } from "@prisma/client";
import {
  Condition,
  GeneratedSuggestion,
  SuggestionContext,
  SuggestionHandler,
} from "../types";
import { ruleBook } from "../rule/ruleBook-2";

export class SessionAnalysisHandler implements SuggestionHandler {
  constructor(private dbService: PrismaClient) {}

  async fetchUserData(
    userId: string
  ): Promise<Partial<PracticeSession> | null> {
    return this.dbService.practiceSession.findFirst({
      where: { userId },
      select: {
        id: true,
        correctAnswers: true,
        questionsSolved: true,
        isCompleted: true,
        startTime: true,
        duration: true,
      },
    });
  }

  async generate(context: SuggestionContext): Promise<GeneratedSuggestion[]> {
    const rules = ruleBook.SESSION_ANALYSIS.rules;
    const suggestions: GeneratedSuggestion[] = [];

    const userData = await this.fetchUserData(context.userId);

    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition, userData)) {
        suggestions.push(this.createSuggestion(rule, context, userData));
      }
    }

    return suggestions;
  }

  private evaluateCondition(
    condition: Condition,
    sessionData: Partial<PracticeSession> | null
  ): boolean {
    if (!sessionData) return false;

    switch (condition.type) {
      case "questions_solved":
        const questionsSolved = sessionData.questionsSolved || 0;
        if (typeof condition.value !== "number") return false;
        if (condition.operator === "lt") {
          return questionsSolved < condition.value;
        } else if (condition.operator === "gte") {
          return questionsSolved >= condition.value;
        }
        return false;

      case "correct_answers_ratio":
        const correct = sessionData.correctAnswers || 0;
        const total = sessionData.questionsSolved || 1;
        const ratio = correct / total;
        if (typeof condition.value !== "number") return false;
        return condition.operator === "lt" && ratio < condition.value;

      case "isCompleted":
        return (
          condition.operator === "eq" &&
          sessionData.isCompleted === condition.value
        );

      case "duration":
        const duration = sessionData.duration || 0;
        if (typeof condition.value !== "number") return false;
        return condition.operator === "lt" && duration < condition.value;

      case "always":
        return true;

      default:
        return false;
    }
  }

  private createSuggestion(
    rule: any,
    context: SuggestionContext,
    sessionData: Partial<PracticeSession> | null
  ): GeneratedSuggestion {
    const displayUntil = new Date();
    displayUntil.setDate(displayUntil.getDate() + rule.duration);

    return {
      suggestion: rule.suggestion,
      type: rule.type,
      category: rule.category || ruleBook.SESSION_ANALYSIS.category,
      priority: rule.priority,
      actionName: rule.metadata?.actionName,
      actionUrl: rule.metadata?.actionUrl?.replace(
        "{sessionId}",
        sessionData?.id || ""
      ),
      triggerType: context.triggerType,
      badgeId: rule.badgeId,
      displayUntil,
    };
  }
}
