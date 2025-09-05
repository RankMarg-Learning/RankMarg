import { Router } from "express";
import { DashboardController } from "../controllers/dashboards.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const dashboardController = new DashboardController();

router.get("/", authenticate, dashboardController.getDashboard);

export default router;
