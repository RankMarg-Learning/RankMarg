import { SubjectsController } from "@/controllers/subjects.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const subjectsController = new SubjectsController();

router.get("/", authenticate, subjectsController.getSubjects);
router.post("/", authenticate, subjectsController.createSubject);
router.get("/:id", authenticate, subjectsController.getSubjectById);
router.put("/:id", authenticate, subjectsController.updateSubjectById);
router.delete("/:id", authenticate, subjectsController.deleteSubjectById);

export default router;
