/**
 * Coach Controller - API endpoints for coach agent
 * Example implementation for Phase 6 integration
 */

import { Request, Response } from "express";
import { CoachOrchestrator } from "../CoachOrchestrator";
import { ReportType } from "../../../types/coach.types";
import { captureServiceError } from "../../../lib/sentry";

export class CoachController {
    private orchestrator: CoachOrchestrator;

    constructor() {
        this.orchestrator = new CoachOrchestrator();
    }

    /**
     * Generate a new coach report
     * POST /api/coach/report/:userId
     */
    async generateReport(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { examCode, reportType } = req.body;

            // Validate inputs
            if (!userId || !examCode) {
                return res.status(400).json({
                    success: false,
                    error: "userId and examCode are required",
                });
            }

            // Check if user needs a new report
            const needsReport = await this.orchestrator.needsNewReport(userId);

            if (!needsReport) {
                // Return cached report
                const cachedReport = await this.orchestrator.getLatestReport(userId);
                return res.status(200).json({
                    success: true,
                    data: cachedReport,
                    cached: true,
                });
            }

            // Generate new report
            const report = await this.orchestrator.generateCoachReport(
                userId,
                examCode,
                reportType || ReportType.ON_DEMAND
            );

            return res.status(200).json({
                success: true,
                data: report,
                cached: false,
            });
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachController.generateReport",
                userId: req.params.userId,
            });

            return res.status(500).json({
                success: false,
                error:
                    error instanceof Error ? error.message : "Failed to generate report",
            });
        }
    }

    /**
     * Get latest coach report
     * GET /api/coach/report/:userId/latest
     */
    async getLatestReport(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const report = await this.orchestrator.getLatestReport(userId);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    error: "No report found. Generate a new report first.",
                });
            }

            return res.status(200).json({
                success: true,
                data: report,
            });
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachController.getLatestReport",
                userId: req.params.userId,
            });

            return res.status(500).json({
                success: false,
                error: "Failed to retrieve report",
            });
        }
    }

    /**
     * Get specific report by ID
     * GET /api/coach/report/:userId/:reportId
     */
    async getReport(req: Request, res: Response) {
        try {
            const { userId, reportId } = req.params;

            const report = await this.orchestrator.getReport(userId, reportId);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    error: "Report not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: report,
            });
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachController.getReport",
                userId: req.params.userId,
                additionalData: { reportId: req.params.reportId },
            });

            return res.status(500).json({
                success: false,
                error: "Failed to retrieve report",
            });
        }
    }

    /**
     * Get active risk flags
     * GET /api/coach/risks/:userId
     */
    async getRiskFlags(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const risks = await this.orchestrator.getRiskFlags(userId);

            return res.status(200).json({
                success: true,
                data: risks || [],
            });
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachController.getRiskFlags",
                userId: req.params.userId,
            });

            return res.status(500).json({
                success: false,
                error: "Failed to retrieve risk flags",
            });
        }
    }

    /**
     * Get roadmap from latest report
     * GET /api/coach/roadmap/:userId
     */
    async getRoadmap(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const report = await this.orchestrator.getLatestReport(userId);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    error: "No report found. Generate a new report first.",
                });
            }

            return res.status(200).json({
                success: true,
                data: report.roadmap,
            });
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachController.getRoadmap",
                userId: req.params.userId,
            });

            return res.status(500).json({
                success: false,
                error: "Failed to retrieve roadmap",
            });
        }
    }

    /**
     * Get insights from latest report
     * GET /api/coach/insights/:userId
     */
    async getInsights(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const report = await this.orchestrator.getLatestReport(userId);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    error: "No report found. Generate a new report first.",
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    insights: report.insights,
                    recommendations: report.recommendations,
                    studyPhase: report.studyPhase,
                    daysToExam: report.daysToExam,
                },
            });
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "CoachController.getInsights",
                userId: req.params.userId,
            });

            return res.status(500).json({
                success: false,
                error: "Failed to retrieve insights",
            });
        }
    }
}

// Export singleton instance
export const coachController = new CoachController();

/**
 * Example route setup (add to your routes file):
 * 
 * import { Router } from "express";
 * import { coachController } from "./controllers/coach.controller";
 * 
 * const router = Router();
 * 
 * // Generate or get report
 * router.post("/coach/report/:userId", (req, res) =>
 *   coachController.generateReport(req, res)
 * );
 * 
 * // Get latest report
 * router.get("/coach/report/:userId/latest", (req, res) =>
 *   coachController.getLatestReport(req, res)
 * );
 * 
 * // Get specific report
 * router.get("/coach/report/:userId/:reportId", (req, res) =>
 *   coachController.getReport(req, res)
 * );
 * 
 * // Get risk flags
 * router.get("/coach/risks/:userId", (req, res) =>
 *   coachController.getRiskFlags(req, res)
 * );
 * 
 * // Get roadmap
 * router.get("/coach/roadmap/:userId", (req, res) =>
 *   coachController.getRoadmap(req, res)
 * );
 * 
 * // Get insights
 * router.get("/coach/insights/:userId", (req, res) =>
 *   coachController.getInsights(req, res)
 * );
 * 
 * export default router;
 */
