import { SubjectsController } from "@/controllers/subjects.controller";
import { SubtopicsController } from "@/controllers/subtopics.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const subtopicsController = new SubtopicsController();

router.get("/", authenticate, subtopicsController.getSubtopics);
router.post("/", authenticate, subtopicsController.createSubtopic);
router.get("/:id", authenticate, subtopicsController.getSubtopicById);
router.put("/:id", authenticate, subtopicsController.updateSubtopicById);
router.delete("/:id", authenticate, subtopicsController.deleteSubtopicById);

export default router;
