import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { MistakeTrackerController } from "@/controllers/mistakeTracker.controller";

const router = Router();
const mistakeTrackerController = new MistakeTrackerController();

router.get(
  "/",
  authenticate,
  mistakeTrackerController.getMistakeTrackerDashboard
);
router.get(
  "/distribution",
  authenticate,
  mistakeTrackerController.getMistakeDistribution
);
router.get(
  "/insight",
  authenticate,
  mistakeTrackerController.getMistakeInsight
);
export default router;
