/**
 * Coach Orchestrator - Main coordination service
 * Following FAANG-grade engineering: Validates, orchestrates, controls LLM
 */

import {
    CoachReport,
    ReportType,
    StudyPhase,
    LLMContext,
    AnalyticsResult,
} from "../../types/coach.types";
import {
    coachConfig,
    determineStudyPhase,
    calculateDaysToExam,
    CoachRedisKeys,
    InsufficientDataError,
    ValidationError,
} from "./coach.config";
import { SnapshotManager } from "./snapshot/SnapshotManager";
import { PerformanceAnalyzer } from "./analytics/PerformanceAnalyzer";
import { MasteryDeltaCalculator } from "./analytics/MasteryDeltaCalculator";
import { RiskDetector } from "./analytics/RiskDetector";
import { CoachLLMService } from "./llm/CoachLLMService";
import { RoadmapGenerator } from "./roadmap/RoadmapGenerator";
import { RedisCacheService } from "../redisCache.service";
import { captureServiceError } from "../../lib/sentry";
import prisma from "../../lib/prisma";
import { v4 as uuidv4 } from "uuid";

export class CoachOrchestrator {
    private snapshotManager: SnapshotManager;
    private performanceAnalyzer: PerformanceAnalyzer;
    private masteryDeltaCalculator: MasteryDeltaCalculator;
    private riskDetector: RiskDetector;
    private llmService: CoachLLMService;
    private roadmapGenerator: RoadmapGenerator;

    constructor() {
        this.snapshotManager = new SnapshotManager();
        this.performanceAnalyzer = new PerformanceAnalyzer();
        this.masteryDeltaCalculator = new MasteryDeltaCalculator();
        this.riskDetector = new RiskDetector();
        this.llmService = new CoachLLMService();
        this.roadmapGenerator = new RoadmapGenerator();
    }

    /**
     * Generate comprehensive coach report
     * This is the main entry point for the coach agent
     */
    async generateCoachReport(
        userId: string,
        examCode: string,
        reportType: ReportType = ReportType.PERIODIC
    ): Promise<CoachReport> {
        const startTime = Date.now();

        try {
            console.log(`Generating coach report for user ${userId}, exam ${examCode}`);

            // Step 1: Validate data availability
            await this.validateDataAvailability(userId);

            // Step 2: Get user context
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { targetYear: true },
            });

            if (!user?.targetYear) {
                throw new ValidationError("User target year not set");
            }

            // Step 3: Determine study phase
            const daysToExam = calculateDaysToExam(user.targetYear, examCode);
            const studyPhase = determineStudyPhase(daysToExam);

            console.log(`Study phase: ${studyPhase}, Days to exam: ${daysToExam}`);

            // Step 4: Create current mastery snapshot
            console.log("Creating mastery snapshot...");
            const currentSnapshot = await this.snapshotManager.createSnapshot(
                userId,
                examCode
            );

            // Step 5: Get previous snapshot for comparison
            console.log("Fetching previous snapshot...");
            let previousSnapshot = await this.snapshotManager.getPreviousSnapshot(
                userId,
                coachConfig.windowDays
            );

            // For new users or users with <14 days of data, use current snapshot as baseline
            // This will result in zero deltas but allows report generation
            if (!previousSnapshot) {
                console.log("No previous snapshot found. Using current snapshot as baseline for first report.");
                previousSnapshot = currentSnapshot;
            }

            // Step 6: Run analytics (deterministic, no LLM)
            console.log("Running analytics...");
            const analytics = await this.runAnalytics(
                userId,
                currentSnapshot,
                previousSnapshot
            );

            // Step 7: Build LLM context
            const llmContext: LLMContext = {
                userId,
                examCode,
                studyPhase,
                daysToExam,
                performanceWindow: analytics.performanceWindow,
                masteryComparison: analytics.masteryComparison,
                riskFlags: analytics.riskFlags,
            };

            // Step 8: Generate insights using LLM
            console.log("Generating LLM insights...");
            const llmResponse = await this.llmService.generateInsights(llmContext);

            // Step 9: Generate roadmap
            console.log("Generating roadmap...");
            const roadmap = await this.roadmapGenerator.generateRoadmap(
                userId,
                examCode,
                studyPhase,
                analytics.performanceWindow,
                analytics.masteryComparison,
                analytics.riskFlags
            );

            // Calculate generation time
            const generationTimeMs = Date.now() - startTime;

            // Step 10: Assemble final report
            const report: CoachReport = {
                id: uuidv4(),
                userId,
                examCode,
                reportType,
                generatedAt: new Date(),
                windowStart: analytics.performanceWindow.windowStart,
                windowEnd: analytics.performanceWindow.windowEnd,
                performanceWindow: analytics.performanceWindow,
                masteryComparison: analytics.masteryComparison,
                riskFlags: analytics.riskFlags,
                insights: llmResponse.insights,
                recommendations: llmResponse.recommendations,
                roadmap,
                studyPhase,
                daysToExam,
                version: "1.0",
                tokenUsage: llmResponse.tokenUsage,
                generationTimeMs,
            };

            // Step 11: Store report in Redis
            await this.storeReport(report);

            console.log(`Coach report generated successfully: ${report.id} (${generationTimeMs}ms, ${report.tokenUsage?.totalTokens || 0} tokens, $${report.tokenUsage?.estimatedCost.toFixed(4) || 0})`);

            return report;
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachOrchestrator.generateCoachReport",
                userId,
                additionalData: { examCode },
            });
            throw error;
        }
    }

    /**
     * Validate that user has sufficient data for analysis
     */
    private async validateDataAvailability(userId: string): Promise<void> {
        // Check if user has any attempts in the last 14 days
        const recentAttempts = await prisma.attempt.count({
            where: {
                userId,
                solvedAt: {
                    gte: new Date(Date.now() - coachConfig.windowDays * 24 * 60 * 60 * 1000),
                },
            },
        });

        if (recentAttempts === 0) {
            throw new InsufficientDataError(
                `No practice activity found in the last ${coachConfig.windowDays} days`
            );
        }

        // Check if user has mastery data
        const masteryCount = await prisma.subjectMastery.count({
            where: { userId },
        });

        if (masteryCount === 0) {
            throw new InsufficientDataError("No mastery data found for user");
        }
    }

    /**
     * Run all analytics (deterministic phase)
     * This happens BEFORE LLM is called
     */
    private async runAnalytics(
        userId: string,
        currentSnapshot: any,
        previousSnapshot: any
    ): Promise<AnalyticsResult> {
        // Analyze 14-day performance window
        const performanceWindow = await this.performanceAnalyzer.analyzePerformanceWindow(
            userId
        );

        // Calculate mastery deltas
        const masteryComparison = this.masteryDeltaCalculator.calculateDeltas(
            currentSnapshot,
            previousSnapshot
        );

        // Detect risk flags
        const riskFlags = this.riskDetector.detectRisks(
            userId,
            performanceWindow,
            masteryComparison
        );

        return {
            performanceWindow,
            masteryComparison,
            riskFlags,
        };
    }

    /**
     * Store report in Redis
     */
    private async storeReport(report: CoachReport): Promise<void> {
        const reportKey = CoachRedisKeys.report(report.userId, report.id);
        const latestKey = CoachRedisKeys.latestReport(report.userId);

        await Promise.all([
            RedisCacheService["safeSetJson"](
                reportKey,
                report,
                coachConfig.redis.reportTTL
            ),
            RedisCacheService["safeSetJson"](
                latestKey,
                report,
                coachConfig.redis.reportTTL
            ),
        ]);

        // Store risk flags separately for quick access
        if (report.riskFlags.length > 0) {
            const risksKey = CoachRedisKeys.riskFlags(report.userId);
            await RedisCacheService["safeSetJson"](
                risksKey,
                report.riskFlags,
                coachConfig.redis.riskFlagTTL
            );
        }
    }

    /**
     * Get latest report for a user
     */
    async getLatestReport(userId: string): Promise<CoachReport | null> {
        try {
            const latestKey = CoachRedisKeys.latestReport(userId);
            return await RedisCacheService["safeGetJson"]<CoachReport>(latestKey);
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachOrchestrator.getLatestReport",
                userId,
            });
            return null;
        }
    }

    /**
     * Get specific report by ID
     */
    async getReport(userId: string, reportId: string): Promise<CoachReport | null> {
        try {
            const reportKey = CoachRedisKeys.report(userId, reportId);
            return await RedisCacheService["safeGetJson"]<CoachReport>(reportKey);
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachOrchestrator.getReport",
                userId,
                additionalData: { reportId },
            });
            return null;
        }
    }

    /**
     * Get active risk flags for a user
     */
    async getRiskFlags(userId: string) {
        try {
            const risksKey = CoachRedisKeys.riskFlags(userId);
            return await RedisCacheService["safeGetJson"](risksKey);
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachOrchestrator.getRiskFlags",
                userId,
            });
            return null;
        }
    }

    /**
     * Check if user needs a new report
     * Reports are valid for 14 days
     */
    async needsNewReport(userId: string): Promise<boolean> {
        const latestReport = await this.getLatestReport(userId);

        if (!latestReport) {
            return true;
        }

        const reportAge = Date.now() - new Date(latestReport.generatedAt).getTime();
        const maxAge = coachConfig.windowDays * 24 * 60 * 60 * 1000;

        return reportAge > maxAge;
    }
}
