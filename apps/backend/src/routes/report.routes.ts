import { ReportController } from "@/controllers/report.controller";
import { authenticate, isInstructor } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const reportController = new ReportController();

router.get(
  "/",
  authenticate,
  isInstructor,
  reportController.getAllReports
);

router.get(
  "/slug/:slug",
  authenticate,
  isInstructor,
  reportController.getReportsByQuestionSlug
);

router.delete(
  "/:id",
  authenticate,
  isInstructor,
  reportController.deleteReport
);

export default router;
