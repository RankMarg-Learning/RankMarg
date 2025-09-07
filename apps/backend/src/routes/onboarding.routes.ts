import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { OnboardingController } from "@/controllers/onboarding.controller";

const router = Router();
const onboardingController = new OnboardingController();
router.post("/", authenticate, onboardingController.createOnboarding);
router.post(
  "/session",
  authenticate,
  onboardingController.createOnboardingSession
);

export default router;
