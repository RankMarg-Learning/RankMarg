import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { ExamController } from "@/controllers/curriculum/exam.controller";

const router = Router();
const exam = new ExamController();

router.get("/", authenticate, exam.getExams);
router.post("/", authenticate, exam.createExam);
router.get("/:id", authenticate, exam.getExamById);
router.put("/:id", authenticate, exam.updateExamById);
router.delete("/:id", authenticate, exam.deleteExamById);

export default router;
