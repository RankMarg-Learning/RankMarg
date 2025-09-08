import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { AnalyticsController } from "@/controllers/analytics.controller";

const router = Router();
const analyticsController = new AnalyticsController();

router.get("/", authenticate, analyticsController.getAnalyticsData);
router.get("/test", authenticate, analyticsController.getTestAnalytics);

export default router;
