import { UserActivityController } from "@/controllers/jobs/userActivity.controller";
import { Router } from "express";

const router = Router();
const userActivityController = new UserActivityController();

// Route to manually trigger user activity update (for testing/admin purposes)
router.post("/update-activity", userActivityController.updateIsActive);

export default router;
