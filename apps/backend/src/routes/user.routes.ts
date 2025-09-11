import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { userController } from "@/controllers/user.controller";
import { activityController } from "@/controllers/activity.controller";

const router = Router();
const user = new userController();
const activity = new activityController();

router.get("/profile", authenticate, user.getUserProfile);
router.get("/activity", authenticate, activity.getActivities);
router.put("/profile/edit", authenticate, user.updateUserProfile);

export default router;
