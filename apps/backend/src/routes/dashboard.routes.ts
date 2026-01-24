import { Router } from "express";
import { DashboardController } from "../controllers/dashboards.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const dashboardController = new DashboardController();

router.get("/", authenticate, dashboardController.getDashboard);
router.get("/ai-practice", authenticate, dashboardController.getAiPractice);
router.get("/today-stats", authenticate, dashboardController.getDashboardStats)

export default router;
