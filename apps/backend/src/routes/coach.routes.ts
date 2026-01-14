import { Router } from "express";
import { CoachController } from "@/controllers/coach.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();
const coachController = new CoachController();

// Generate or get coach report
router.post("/report", authenticate, coachController.generateReport);

// Get latest report
router.get("/report/latest", authenticate, coachController.getLatestReport);

// Get specific report by ID
router.get("/report/:reportId", authenticate, coachController.getReport);

// Get risk flags
router.get("/risks", authenticate, coachController.getRiskFlags);

// Get roadmap
router.get("/roadmap", authenticate, coachController.getRoadmap);

// Get insights
router.get("/insights", authenticate, coachController.getInsights);

// Bulk generation (admin/background job use)
router.post("/bulk", authenticate, coachController.generateBulkReports);

export default router;
