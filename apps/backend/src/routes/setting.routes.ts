import { SettingController } from "@/controllers/setting.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const settingController = new SettingController();

// Get all user settings
router.get("/", authenticate, settingController.getUserSettings);

// Update user settings (bulk update)
router.put("/", authenticate, settingController.updateUserSettings);

// Get specific setting value
router.get("/:settingName", authenticate, settingController.getSetting);

// Update specific setting value
router.put("/:settingName", authenticate, settingController.updateSetting);

export default router;
