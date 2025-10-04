import { QuestionController } from "@/controllers/question.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const questionController = new QuestionController();

router.get("/", authenticate, questionController.getQuestions);
router.post("/", authenticate, questionController.createQuestion);
router.get("/:slug", authenticate, questionController.getQuestionById);
router.put("/:slug", authenticate, questionController.updateQuestionById);
router.delete("/:slug", authenticate, questionController.deleteQuestionById);
router.post("/:slug/report", authenticate, questionController.reportQuestion);

router.get(
  "/reports/slug/:slug",
  authenticate,
  questionController.getReportsByQuestionSlug
);

router.delete(
  "/reports/:id",
  authenticate,
  questionController.deleteReportQuestion
);

export default router;
