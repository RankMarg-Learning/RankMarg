import {
    ActionButton,
    ActionType,
    ActionContext,
} from "../types/extended.types";

/**
 * ActionButtonGenerator
 * 
 * Generates action buttons with deep links and customizable labels
 * based on suggestion context.
 */
export class ActionButtonGenerator {
    private readonly baseUrl = "https://www.rankmarg.in";

    /**
     * Generate action button with optional custom label
     */
    generateActionButton(
        type: ActionType,
        context: ActionContext,
        customLabel?: string
    ): ActionButton {
        const url = this.buildUrl(type, context);
        const text = customLabel || this.selectButtonText(type, context);

        return {
            text,
            url,
            type,
            customLabel,
        };
    }

    /**
     * Build URL based on action type and context
     */
    private buildUrl(type: ActionType, context: ActionContext): string {
        switch (type) {
            case "START_PRACTICE":
                if (!context.sessionId) {
                    throw new Error("sessionId required for START_PRACTICE action");
                }
                return `${this.baseUrl}/ai-session/${context.sessionId}`;

            case "PRACTICE_MORE":
                if (!context.subjectId || !context.topicSlug) {
                    throw new Error("subjectId and topicSlug required for PRACTICE_MORE action");
                }
                return `${this.baseUrl}/ai-questions/${context.subjectId}/${context.topicSlug}`;

            case "SEE_MASTERY":
                if (!context.subjectId) {
                    throw new Error("subjectId required for SEE_MASTERY action");
                }
                return `${this.baseUrl}/mastery/${context.subjectId}`;

            case "MOCK_TEST":
                return `${this.baseUrl}/tests`;

            case "TEST_ANALYSIS":
                if (!context.testId) {
                    throw new Error("testId required for TEST_ANALYSIS action");
                }
                return `${this.baseUrl}/t/${context.testId}/analysis`;

            case "CHANGE_CURRICULUM":
                return `${this.baseUrl}/my-curriculum`;

            case "VIEW_RESULTS":
                return `${this.baseUrl}/ai-practice/recent-results`;

            default:
                throw new Error(`Unknown action type: ${type}`);
        }
    }

    /**
     * Select default button text based on type and context
     * Returns varied labels to prevent repetition
     */
    private selectButtonText(type: ActionType, context: ActionContext): string {
        const variations = this.getTextVariations(type, context);
        return variations[Math.floor(Math.random() * variations.length)];
    }

    /**
     * Get text variations for each action type
     */
    private getTextVariations(type: ActionType, context: ActionContext): string[] {
        switch (type) {
            case "START_PRACTICE":
                return this.getStartPracticeVariations(context);

            case "PRACTICE_MORE":
                return this.getPracticeMoreVariations(context);

            case "SEE_MASTERY":
                return this.getSeeMasteryVariations(context);

            case "MOCK_TEST":
                return ["Take Mock Test", "Attempt Mock Test", "Try Mock Test", "Start Mock Test"];

            case "TEST_ANALYSIS":
                return ["View Analysis", "See Test Analysis", "Check Analysis", "Review Performance"];

            case "CHANGE_CURRICULUM":
                return ["Update Curriculum", "Change Curriculum", "Manage Curriculum", "Edit Curriculum"];

            case "VIEW_RESULTS":
                return ["View Results", "See Recent Results", "Check Progress", "Review Sessions"];

            default:
                return ["Continue"];
        }
    }

    /**
     * Get variations for START_PRACTICE button
     */
    private getStartPracticeVariations(context: ActionContext): string[] {
        const base = [
            "Start Practice",
            "Begin Practice",
            "Start Session",
            "Let's Practice",
        ];

        // Add subject-specific variations
        if (context.subjectName) {
            base.push(`Practice ${context.subjectName}`);
            base.push(`Start ${context.subjectName}`);
        }

        // Add count-specific variations
        if (context.questionCount) {
            base.push(`Solve ${context.questionCount} Questions`);
            base.push(`Start ${context.questionCount}Q Session`);
        }

        // Add streak-aware variations
        if (context.streak && context.streak > 0) {
            base.push("Continue Your Streak");
            base.push(`Keep Streak Going (${context.streak} days)`);
        }

        return base;
    }

    /**
     * Get variations for PRACTICE_MORE button
     */
    private getPracticeMoreVariations(context: ActionContext): string[] {
        const base = [
            "Practice More",
            "Continue Practice",
            "Practice Again",
            "More Questions",
        ];

        // Add topic-specific variations
        if (context.topicName) {
            base.push(`Practice ${context.topicName}`);
            base.push(`Master ${context.topicName}`);
            base.push(`Improve ${context.topicName}`);
        }

        // Add subject-specific variations
        if (context.subjectName && context.topicName) {
            base.push(`${context.subjectName}: ${context.topicName}`);
        }

        return base;
    }

    /**
     * Get variations for SEE_MASTERY button
     */
    private getSeeMasteryVariations(context: ActionContext): string[] {
        const base = [
            "See Mastery",
            "View Mastery",
            "Check Mastery",
            "Track Progress",
        ];

        // Add subject-specific variations
        if (context.subjectName) {
            base.push(`${context.subjectName} Mastery`);
            base.push(`Track ${context.subjectName}`);
        }

        return base;
    }

    /**
     * Customize label based on context (for advanced personalization)
     */
    customizeLabel(defaultLabel: string, context: ActionContext): string {
        let label = defaultLabel;

        // Add subject name if available
        if (context.subjectName && !label.includes(context.subjectName)) {
            label = label.replace("Practice", `${context.subjectName} Practice`);
        }

        // Add topic name if available
        if (context.topicName && !label.includes(context.topicName)) {
            label = `${label} - ${context.topicName}`;
        }

        // Add question count if available
        if (context.questionCount && !label.includes(context.questionCount.toString())) {
            label = `${label} (${context.questionCount}Q)`;
        }

        return label;
    }

    /**
     * Generate multiple action buttons at once
     */
    generateMultipleButtons(
        actions: Array<{ type: ActionType; context: ActionContext; customLabel?: string }>
    ): ActionButton[] {
        return actions.map((action) =>
            this.generateActionButton(action.type, action.context, action.customLabel)
        );
    }
}
