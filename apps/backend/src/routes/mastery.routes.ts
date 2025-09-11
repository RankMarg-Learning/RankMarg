import { Router } from "express";
import { MasteryController } from "@/controllers/mastery.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();
const masteryController = new MasteryController();

router.get("/", authenticate, masteryController.getMasteryDashboard);
router.get("/subjects", authenticate, masteryController.getTopMasteryBySubject);
router.get(
  "/subjects/:subjectId",
  authenticate,
  masteryController.getFullMasteryBySubjectId
);
export default router;
