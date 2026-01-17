import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { NextFunction, Response } from "express";
import { CoachOrchestrator } from "@/services/agent";
import { BulkCoachGenerator } from "@/services/agent/BulkCoachGenerator";
import { ReportType } from "@/types/coach.types";

export class CoachController {
    private orchestrator: CoachOrchestrator;

    constructor() {
        this.orchestrator = new CoachOrchestrator();
    }

    /**
     * Generate a new coach report
     * POST /api/coach/report
     */
    generateReport = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.id;
            const examCode = req.user.examCode;
            const { reportType } = req.body;

            if (!examCode) {
                ResponseUtil.error(res, "Exam code is required", 400);
                return;
            }

            // Check if user needs a new report
            console.log("Start Report Generation")
            const needsReport = await this.orchestrator.needsNewReport(userId);

            if (!needsReport) {
                // Return cached report
                const cachedReport = await this.orchestrator.getLatestReport(userId);
                ResponseUtil.success(
                    res,
                    { report: cachedReport, cached: true },
                    "Coach report retrieved from cache",
                    200
                );
                return;
            }

            // Generate new report
            const report = await this.orchestrator.generateCoachReport(
                userId,
                examCode,
                reportType || ReportType.ON_DEMAND
            );

            ResponseUtil.success(
                res,
                { report, cached: false },
                "Coach report generated successfully",
                201
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get latest coach report
     * GET /api/coach/report/latest
     */
    getLatestReport = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.id;

            const report = await this.orchestrator.getLatestReport(userId);

            if (!report) {
                ResponseUtil.error(
                    res,
                    "No report found. Generate a new report first.",
                    404
                );
                return;
            }

            ResponseUtil.success(
                res,
                report,
                "Coach report retrieved successfully",
                200,
                undefined,
                {
                    "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
                    Vary: "Authorization",
                }
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get specific report by ID
     * GET /api/coach/report/:reportId
     */
    getReport = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.id;
            const { reportId } = req.params;

            const report = await this.orchestrator.getReport(userId, reportId);

            if (!report) {
                ResponseUtil.error(res, "Report not found", 404);
                return;
            }

            ResponseUtil.success(
                res,
                report,
                "Coach report retrieved successfully",
                200
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get active risk flags
     * GET /api/coach/risks
     */
    getRiskFlags = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.id;

            const risks = await this.orchestrator.getRiskFlags(userId);

            ResponseUtil.success(
                res,
                risks || [],
                "Risk flags retrieved successfully",
                200
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get roadmap from latest report
     * GET /api/coach/roadmap
     */
    getRoadmap = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.id;

            const report = await this.orchestrator.getLatestReport(userId);

            if (!report) {
                ResponseUtil.error(
                    res,
                    "No report found. Generate a new report first.",
                    404
                );
                return;
            }

            ResponseUtil.success(
                res,
                report.roadmap,
                "Roadmap retrieved successfully",
                200
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get insights from latest report
     * GET /api/coach/insights
     */
    getInsights = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user.id;

            const report = await this.orchestrator.getLatestReport(userId);

            if (!report) {
                ResponseUtil.error(
                    res,
                    "No report found. Generate a new report first.",
                    404
                );
                return;
            }

            ResponseUtil.success(
                res,
                {
                    insights: report.insights,
                    recommendations: report.recommendations,
                    studyPhase: report.studyPhase,
                    daysToExam: report.daysToExam,
                },
                "Insights retrieved successfully",
                200
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Generate coach reports for multiple users in bulk
     * POST /api/coach/bulk
     * Body: { userIds: string[], examCode: string, reportType?: ReportType, concurrencyLimit?: number }
     */
    generateBulkReports = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { userIds, examCode, reportType, concurrencyLimit } = req.body;

            // Validation
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                ResponseUtil.error(
                    res,
                    "userIds must be a non-empty array",
                    400
                );
                return;
            }

            if (!examCode) {
                ResponseUtil.error(res, "examCode is required", 400);
                return;
            }

            // Initialize bulk generator with optional concurrency limit
            const bulkGenerator = new BulkCoachGenerator(
                concurrencyLimit || 5,
                1000 // 1 second delay between batches
            );

            // Generate reports
            const summary = await bulkGenerator.generateBulkReports(
                userIds,
                examCode,
                reportType || ReportType.PERIODIC
            );

            ResponseUtil.success(
                res,
                summary,
                `Bulk generation complete: ${summary.successful}/${summary.totalUsers} successful`,
                200
            );
        } catch (error) {
            next(error);
        }
    };
}
