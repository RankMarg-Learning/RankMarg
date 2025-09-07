import { AttemptsController } from "@/controllers/attempts.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const attemptController = new AttemptsController();
router.post("/", authenticate, attemptController.createAttempt);
router.patch(
  "/mistake",
  authenticate,
  attemptController.updateMistakeByAttemptId
);
router.get("/", authenticate, attemptController.getAttempts);

export default router;
