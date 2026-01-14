/**
 * Bulk Coach Report Generator
 * Optimized for processing multiple users efficiently with rate limiting and batching
 */

import { CoachOrchestrator } from "./CoachOrchestrator";
import { ReportType, CoachReport } from "../../types/coach.types";
import { captureServiceError } from "../../lib/sentry";

interface BulkGenerationResult {
    userId: string;
    success: boolean;
    report?: CoachReport;
    error?: string;
    generationTimeMs?: number;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCost: number;
    };
}

interface BulkGenerationSummary {
    totalUsers: number;
    successful: number;
    failed: number;
    totalTimeMs: number;
    totalTokens: number;
    totalCost: number;
    avgTimePerUser: number;
    results: BulkGenerationResult[];
}

export class BulkCoachGenerator {
    private orchestrator: CoachOrchestrator;
    private concurrencyLimit: number;
    private delayBetweenBatches: number; // ms

    constructor(concurrencyLimit: number = 5, delayBetweenBatches: number = 1000) {
        this.orchestrator = new CoachOrchestrator();
        this.concurrencyLimit = concurrencyLimit;
        this.delayBetweenBatches = delayBetweenBatches;
    }

    /**
     * Generate coach reports for multiple users in batches
     * Implements rate limiting and error handling
     */
    async generateBulkReports(
        userIds: string[],
        examCode: string,
        reportType: ReportType = ReportType.PERIODIC
    ): Promise<BulkGenerationSummary> {
        const startTime = Date.now();
        const results: BulkGenerationResult[] = [];

        console.log(
            `Starting bulk generation for ${userIds.length} users (concurrency: ${this.concurrencyLimit})`
        );

        // Process users in batches
        for (let i = 0; i < userIds.length; i += this.concurrencyLimit) {
            const batch = userIds.slice(i, i + this.concurrencyLimit);
            const batchNumber = Math.floor(i / this.concurrencyLimit) + 1;
            const totalBatches = Math.ceil(userIds.length / this.concurrencyLimit);

            console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} users)`);

            // Process batch concurrently
            const batchResults = await Promise.allSettled(
                batch.map((userId) => this.generateSingleReport(userId, examCode, reportType))
            );

            // Collect results
            batchResults.forEach((result, index) => {
                const userId = batch[index];

                if (result.status === "fulfilled") {
                    results.push(result.value);
                } else {
                    results.push({
                        userId,
                        success: false,
                        error: result.reason?.message || "Unknown error",
                    });
                }
            });

            // Rate limiting: delay between batches (except for last batch)
            if (i + this.concurrencyLimit < userIds.length) {
                await this.delay(this.delayBetweenBatches);
            }
        }

        // Calculate summary
        const totalTimeMs = Date.now() - startTime;
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;
        const totalTokens = results.reduce(
            (sum, r) => sum + (r.tokenUsage?.totalTokens || 0),
            0
        );
        const totalCost = results.reduce(
            (sum, r) => sum + (r.tokenUsage?.estimatedCost || 0),
            0
        );
        const avgTimePerUser = totalTimeMs / userIds.length;

        const summary: BulkGenerationSummary = {
            totalUsers: userIds.length,
            successful,
            failed,
            totalTimeMs,
            totalTokens,
            totalCost,
            avgTimePerUser,
            results,
        };

        console.log(`Bulk generation complete:`);
        console.log(`  - Total users: ${summary.totalUsers}`);
        console.log(`  - Successful: ${summary.successful}`);
        console.log(`  - Failed: ${summary.failed}`);
        console.log(`  - Total time: ${(summary.totalTimeMs / 1000).toFixed(2)}s`);
        console.log(`  - Avg time per user: ${summary.avgTimePerUser.toFixed(0)}ms`);
        console.log(`  - Total tokens: ${summary.totalTokens.toLocaleString()}`);
        console.log(`  - Total cost: $${summary.totalCost.toFixed(4)}`);

        return summary;
    }

    /**
     * Generate report for a single user with error handling
     */
    private async generateSingleReport(
        userId: string,
        examCode: string,
        reportType: ReportType
    ): Promise<BulkGenerationResult> {
        const startTime = Date.now();

        try {
            // Check if user needs a new report
            const needsReport = await this.orchestrator.needsNewReport(userId);

            if (!needsReport) {
                console.log(`User ${userId} already has a recent report, skipping`);
                return {
                    userId,
                    success: true,
                    generationTimeMs: Date.now() - startTime,
                };
            }

            // Generate report
            const report = await this.orchestrator.generateCoachReport(
                userId,
                examCode,
                reportType
            );

            return {
                userId,
                success: true,
                report,
                generationTimeMs: Date.now() - startTime,
                tokenUsage: report.tokenUsage,
            };
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "BulkCoachGenerator.generateSingleReport",
                userId,
                additionalData: { examCode },
            });

            return {
                userId,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                generationTimeMs: Date.now() - startTime,
            };
        }
    }

    /**
     * Utility to delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Generate reports for users who need them (14+ days since last report)
     */
    async generateForStaleUsers(
        examCode: string,
        reportType: ReportType = ReportType.PERIODIC
    ): Promise<BulkGenerationSummary> {
        // This would typically query the database for users with stale reports
        // For now, this is a placeholder that would be implemented based on your DB structure
        throw new Error(
            "generateForStaleUsers not implemented - requires database query for stale users"
        );
    }
}
