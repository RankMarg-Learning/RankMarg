/**
 * Coach LLM Service - OpenAI GPT-4o integration
 * Following rule-analytics-first-llm-last: LLM for reasoning & communication only
 */

import OpenAI from "openai";
import {
    LLMContext,
    LLMResponse,
    CoachInsights,
    CoachRecommendations,
    StudyPhase,
} from "../../../types/coach.types";
import { coachConfig, LLMError } from "../coach.config";
import { captureServiceError } from "../../../lib/sentry";

export class CoachLLMService {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set");
        }

        this.openai = new OpenAI({
            apiKey,
        });
    }

    /**
     * Generate insights and recommendations from analytics data
     * This is the ONLY place where LLM is called
     */
    async generateInsights(context: LLMContext): Promise<LLMResponse> {
        try {
            const prompt = this.buildPrompt(context);

            const completion = await this.openai.chat.completions.create({
                model: coachConfig.llm.model,
                messages: [
                    {
                        role: "system",
                        content: this.getSystemPrompt(),
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: coachConfig.llm.temperature,
                max_tokens: coachConfig.llm.maxTokens,
                response_format: { type: "json_object" },
            });

            const response = completion.choices[0]?.message?.content;

            if (!response) {
                throw new LLMError("No response from LLM");
            }

            // Extract token usage
            const tokenUsage = completion.usage
                ? {
                    promptTokens: completion.usage.prompt_tokens,
                    completionTokens: completion.usage.completion_tokens,
                    totalTokens: completion.usage.total_tokens,
                    estimatedCost: this.calculateCost(
                        completion.usage.prompt_tokens,
                        completion.usage.completion_tokens
                    ),
                }
                : undefined;

            const parsedResponse = this.parseResponse(response);

            return {
                ...parsedResponse,
                tokenUsage,
            };
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachLLMService.generateInsights",
                userId: context.userId,
                additionalData: { examCode: context.examCode },
            });

            if (error instanceof LLMError) {
                throw error;
            }

            throw new LLMError(
                "Failed to generate insights",
                error instanceof Error ? error.message : "Unknown error"
            );
        }
    }

    /**
     * Build structured prompt from analytics context
     */
    private buildPrompt(context: LLMContext): string {
        const {
            userId,
            examCode,
            studyPhase,
            daysToExam,
            performanceWindow,
            masteryComparison,
            riskFlags,
        } = context;

        // Extract key metrics
        const overallAccuracy = (
            performanceWindow.overallMetrics.overallAccuracy * 100
        ).toFixed(1);
        const avgDailyQuestions =
            performanceWindow.overallMetrics.avgDailyQuestions.toFixed(1);
        const studyDays = performanceWindow.overallMetrics.studyDays;

        // Top improvements and regressions
        const improvements = masteryComparison.deltas
            .filter((d) => d.classification === "improvement")
            .sort((a, b) => b.delta - a.delta)
            .slice(0, 3)
            .map((d) => `${d.entityName}: +${(d.delta * 100).toFixed(1)}%`)
            .join(", ");

        const regressions = masteryComparison.deltas
            .filter((d) => d.classification === "regression")
            .sort((a, b) => a.delta - b.delta)
            .slice(0, 3)
            .map((d) => `${d.entityName}: ${(d.delta * 100).toFixed(1)}%`)
            .join(", ");

        // Risk summary
        const riskSummary = riskFlags
            .map((r) => `${r.riskType} (${r.severity}): ${r.description}`)
            .join("\n");

        // Subject performance
        const subjectPerformance = performanceWindow.subjects
            .map(
                (s) =>
                    `${s.subjectName}: ${(s.accuracy * 100).toFixed(1)}% accuracy, ${s.totalAttempts} attempts`
            )
            .join("\n");

        return `
You are RankMarg Coach, an AI mentor for ${examCode} exam preparation.

**Student Context:**
- Exam: ${examCode}
- Study Phase: ${studyPhase}
- Days to Exam: ${daysToExam}

**14-Day Performance Window:**
- Overall Accuracy: ${overallAccuracy}%
- Avg Daily Questions: ${avgDailyQuestions}
- Study Days: ${studyDays}/14

**Subject Performance:**
${subjectPerformance}

**Mastery Changes (vs 14 days ago):**
- Improvements: ${improvements || "None"}
- Regressions: ${regressions || "None"}

**Risk Flags:**
${riskSummary || "No risks detected"}

**Your Task:**
Generate a comprehensive coach report with:
1. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
2. Key Observations (3-5 specific, data-backed insights)
3. Actionable Recommendations:
   - Immediate (next 3 days)
   - Short-term (next 7 days)
   - Long-term (next 14 days)
   - Study habits improvements
   - Exam strategy tips

**Rules:**
- Be specific and actionable (no generic advice)
- Reference actual data points
- Prioritize based on study phase (${studyPhase})
- Address risk flags directly
- Keep tone encouraging but honest
- Focus on rank improvement, not just learning

Return response as JSON with this structure:
{
  "insights": {
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "opportunities": ["opportunity1", "opportunity2", ...],
    "threats": ["threat1", "threat2", ...],
    "keyObservations": ["observation1", "observation2", ...]
  },
  "recommendations": {
    "immediate": ["action1", "action2", ...],
    "shortTerm": ["action1", "action2", ...],
    "longTerm": ["action1", "action2", ...],
    "studyHabits": ["habit1", "habit2", ...],
    "examStrategy": ["strategy1", "strategy2", ...]
  },
  "reasoning": "Brief explanation of your analysis approach"
}
`;
    }

    /**
     * System prompt defining coach behavior
     */
    private getSystemPrompt(): string {
        return `You are RankMarg Coach, an elite AI mentor for NEET and JEE exam preparation.

Your role is to transform student performance data into actionable guidance that improves exam rank.

Core Principles:
1. Actionability > Motivation - Every insight must lead to a specific action
2. Data-Driven - Reference actual metrics, not generic advice
3. Phase-Aware - Adjust guidance based on study phase (Foundation/Building/Revision/Exam-Ready)
4. Risk-Focused - Address detected risks (avoidance, burnout, false confidence, decay) directly
5. Rank-Oriented - Focus on competitive exam success, not just learning

Communication Style:
- Direct and specific (e.g., "Solve 10 PYQs on Rotational Motion tonight" not "Practice more physics")
- Encouraging but honest about weaknesses
- Use data to build trust (e.g., "Your accuracy improved 12% in Organic Chemistry")
- Prioritize ruthlessly (max 3-5 items per category)

Output Format:
- Always return valid JSON
- Keep each item concise (1-2 sentences max)
- Ensure recommendations are time-bound and measurable`;
    }

    /**
     * Parse and validate LLM response
     */
    private parseResponse(response: string): LLMResponse {
        try {
            const parsed = JSON.parse(response);

            // Validate structure
            if (!parsed.insights || !parsed.recommendations) {
                throw new LLMError("Invalid response structure");
            }

            const insights: CoachInsights = {
                strengths: parsed.insights.strengths || [],
                weaknesses: parsed.insights.weaknesses || [],
                opportunities: parsed.insights.opportunities || [],
                threats: parsed.insights.threats || [],
                keyObservations: parsed.insights.keyObservations || [],
            };

            const recommendations: CoachRecommendations = {
                immediate: parsed.recommendations.immediate || [],
                shortTerm: parsed.recommendations.shortTerm || [],
                longTerm: parsed.recommendations.longTerm || [],
                studyHabits: parsed.recommendations.studyHabits || [],
                examStrategy: parsed.recommendations.examStrategy || [],
            };

            const reasoning = parsed.reasoning || "No reasoning provided";

            // Validate actionability
            this.validateActionability(insights, recommendations);

            return {
                insights,
                recommendations,
                reasoning,
            };
        } catch (error) {
            throw new LLMError(
                "Failed to parse LLM response",
                error instanceof Error ? error.message : "Unknown error"
            );
        }
    }

    /**
     * Validate that recommendations are actionable
     */
    private validateActionability(
        insights: CoachInsights,
        recommendations: CoachRecommendations
    ): void {
        // Check that we have meaningful content
        const totalInsights =
            insights.strengths.length +
            insights.weaknesses.length +
            insights.opportunities.length +
            insights.threats.length +
            insights.keyObservations.length;

        const totalRecommendations =
            recommendations.immediate.length +
            recommendations.shortTerm.length +
            recommendations.longTerm.length +
            recommendations.studyHabits.length +
            recommendations.examStrategy.length;

        if (totalInsights === 0) {
            throw new LLMError("No insights generated");
        }

        if (totalRecommendations === 0) {
            throw new LLMError("No recommendations generated");
        }

        // Check for generic/vague recommendations
        const allRecommendations = [
            ...recommendations.immediate,
            ...recommendations.shortTerm,
            ...recommendations.longTerm,
        ];

        const genericPhrases = [
            "study more",
            "practice regularly",
            "work hard",
            "stay focused",
        ];

        for (const rec of allRecommendations) {
            const lower = rec.toLowerCase();
            for (const phrase of genericPhrases) {
                if (lower.includes(phrase) && lower.length < 50) {
                    console.warn(`Generic recommendation detected: ${rec}`);
                }
            }
        }
    }

    /**
     * Calculate estimated cost based on GPT-4o pricing
     * Pricing as of 2024: $5/1M input tokens, $15/1M output tokens
     */
    private calculateCost(promptTokens: number, completionTokens: number): number {
        const INPUT_COST_PER_1M = 5.0; // $5 per 1M tokens
        const OUTPUT_COST_PER_1M = 15.0; // $15 per 1M tokens

        const inputCost = (promptTokens / 1_000_000) * INPUT_COST_PER_1M;
        const outputCost = (completionTokens / 1_000_000) * OUTPUT_COST_PER_1M;

        return Number((inputCost + outputCost).toFixed(6));
    }
}
