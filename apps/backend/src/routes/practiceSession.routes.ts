import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { PracticeSessionController } from "@/controllers/practiceSession.controller";

const router = Router();
const practiceSessionController = new PracticeSessionController();

router.get("/", authenticate, practiceSessionController.getPracticeSessions);
router.get(
  "/ai",
  authenticate,
  practiceSessionController.getAiPracticeSessions
);
router.get(
  "/ai/:sessionId",
  authenticate,
  practiceSessionController.getAiPracticeSessionById
);
export default router;
