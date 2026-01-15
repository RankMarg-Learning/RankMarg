import { SuggestionType, TriggerType, SuggestionStatus } from "@repo/db/enums";
import { SuggestionHandler } from "../types";
import prisma from "../lib/prisma";
import {
  AttemptWithQuestionDetails,
  MistakeAnalysis,
  PerformanceMetrics,
  StreakData,
  SubjectMap,
  SubjectPerformance,
  SuggestionConfig,
  TopicMap,
  TopicPerformance,
  CoachingSuggestion,
} from "../types/daily.types";
import { EnhancedAnalyzer } from "../analyzer/EnhancedAnalyzer";
import { RankCoachEngine } from "../engine/RankCoachEngine";
import { CoachSuggestion } from "../types/coach.types";

export class DailySuggestionSystem implements SuggestionHandler {
  async generate(userId: string): Promise<void> {
    try {
      console.log(`Generating Rank Coach suggestions for user ${userId}`);

      // Use Enhanced Analyzer
      const analyzer = new EnhancedAnalyzer();
      const analysis = await analyzer.analyze(userId);

      if (!analysis) {
        await this.handleNoActivitySuggestion(userId);
        return;
      }

      // Generate coaching with Rank Coach Engine
      const coachEngine = new RankCoachEngine();
      const coaching = coachEngine.generateCoaching(analysis);
      console.log(coaching);
      // Store suggestions (max 2-3)
      // await this.storeRankCoachSuggestions(coaching.suggestions, userId);

      console.log(
        `Generated ${coaching.suggestions.length} Rank Coach suggestions for user ${userId} (Phase: ${coaching.phase})`
      );
    } catch (error) {
      console.error("Error generating Rank Coach suggestions:", error);
      throw error;
    }
  }



  private async handleNoActivitySuggestion(userId: string): Promise<void> {
    const noActivityTemplates = [
      "📚 No practice yesterday? No problem—every day’s a fresh start to grow!",
      "You took a break yesterday. Let’s get back on track today!",
      "No activity yesterday. Time to kick things off and make progress!",
    ];
    const suggestions: SuggestionConfig[] = [
      this.createSuggestionConfig(
        userId,
        "MOTIVATION",
        4,
        noActivityTemplates,
        {},
        "Start Practice",
        "/ai-practice"
      ),
    ];
    await this.storeSuggestions(suggestions);
  }


  private createSuggestionConfig(
    userId: string,
    category: string,
    priority: number,
    templates: string[],
    data: Record<string, string>,
    actionName?: string,
    actionUrl?: string
  ): SuggestionConfig {
    const selectedTemplate =
      templates[Math.floor(Math.random() * templates.length)];
    const suggestionText = this.formatTemplate(selectedTemplate, data);
    return {
      userId,
      triggerType: "DAILY_ANALYSIS",
      priority,
      category,
      suggestions: [suggestionText],
      actionName,
      actionUrl,
    };
  }

  private formatTemplate(
    template: string,
    data: Record<string, string>
  ): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
  }

  private async storeSuggestions(
    suggestions: SuggestionConfig[]
  ): Promise<void> {
    for (const config of suggestions) {
      for (const suggestion of config.suggestions) {
        await prisma.studySuggestion.create({
          data: {
            userId: config.userId,
            type: this.mapCategoryToSuggestionType(config.category),
            triggerType: config.triggerType,
            suggestion,
            category: config.category,
            priority: config.priority,
            actionName: config.actionName,
            actionUrl: config.actionUrl,
            displayUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  /**
   * Store coaching suggestions (new format with reasoning and action items)
   */
  /**
   * Store Rank Coach suggestions (new format)
   */
  private async storeRankCoachSuggestions(
    suggestions: CoachSuggestion[],
    userId: string
  ): Promise<void> {
    for (const suggestion of suggestions) {
      await prisma.studySuggestion.create({
        data: {
          userId,
          type: suggestion.type,
          triggerType: TriggerType.DAILY_ANALYSIS,
          suggestion: suggestion.message,
          category: suggestion.category,
          priority: suggestion.priority,
          actionName: suggestion.actionName || null,
          actionUrl: suggestion.actionUrl || null,
          displayUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          status: SuggestionStatus.ACTIVE,
        },
      });
    }
  }

  /**
   * Store old coaching suggestions (kept for backward compatibility)
   */
  private async storeCoachingSuggestions(
    suggestions: CoachingSuggestion[],
    userId: string
  ): Promise<void> {
    for (const coaching of suggestions) {
      // Create main suggestion message
      const suggestionText = coaching.message;

      // Add reasoning and action items to the suggestion
      let fullSuggestion = suggestionText + "\n\n";

      if (coaching.reasoning) {
        fullSuggestion += `💡 Why: ${coaching.reasoning}\n\n`;
      }

      if (coaching.actionItems && coaching.actionItems.length > 0) {
        fullSuggestion += "📋 Action Plan:\n";
        coaching.actionItems.forEach((item, index) => {
          fullSuggestion += `${index + 1}. ${item}\n`;
        });
        fullSuggestion += "\n";
      }

      if (coaching.subjectTricks && coaching.subjectTricks.length > 0) {
        fullSuggestion += "🎯 Pro Tips:\n";
        coaching.subjectTricks.forEach((trick) => {
          fullSuggestion += `\n• ${trick.category}: ${trick.trick}`;
          if (trick.example) {
            fullSuggestion += `\n  Example: ${trick.example}`;
          }
          fullSuggestion += "\n";
        });
      }

      await prisma.studySuggestion.create({
        data: {
          userId,
          type: this.mapCoachingCategoryToSuggestionType(coaching.category),
          triggerType: "DAILY_ANALYSIS",
          suggestion: fullSuggestion.trim(),
          category: coaching.category,
          priority: coaching.priority,
          displayUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  /**
   * Map coaching category to SuggestionType
   */
  private mapCoachingCategoryToSuggestionType(
    category: string
  ): SuggestionType {
    const mapping: { [key: string]: SuggestionType } = {
      mistake_review: "WARNING",
      time_management: "GUIDANCE",
      subject_focus: "WARNING",
      topic_guidance: "GUIDANCE",
      motivation: "MOTIVATION",
      strategy: "GUIDANCE",
    };
    return mapping[category] || "GUIDANCE";
  }

  private mapCategoryToSuggestionType(category: string): SuggestionType {
    const mapping: { [key: string]: SuggestionType } = {
      PERFORMANCE: "CELEBRATION",
      IMPROVEMENT: "GUIDANCE",
      URGENT_IMPROVEMENT: "WARNING",
      SUBJECT_BALANCE: "GUIDANCE",
      SUBJECT_IMPROVEMENT: "WARNING",
      TOPIC_FOCUS: "GUIDANCE",
      MASTERY_BUILDING: "ENCOURAGEMENT",
      TIME_MANAGEMENT: "GUIDANCE",
      ACCURACY_FOCUS: "GUIDANCE",
      MISTAKE_PATTERN: "WARNING",
      STREAK_CELEBRATION: "CELEBRATION",
      STREAK_RECOVERY: "ENCOURAGEMENT",
      STUDY_STRATEGY: "GUIDANCE",
      VOLUME_INCREASE: "REMINDER",
      MOTIVATION: "MOTIVATION",
    };
    return mapping[category] || "GUIDANCE";
  }
}
