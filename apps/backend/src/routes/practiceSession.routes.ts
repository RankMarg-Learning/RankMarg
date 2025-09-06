import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { PracticeSessionController } from "@/controllers/practiceSession.controller";

const router = Router();
const practiceSessionController = new PracticeSessionController();

router.get("/", authenticate, practiceSessionController.getPracticeSessions);
export default router;
