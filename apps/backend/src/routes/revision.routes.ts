import { Router } from "express";
import { RevisionController } from "@/controllers/revision.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();
const revisionController = new RevisionController();

router.get("/", authenticate, revisionController.getRevisionSchedule);
router.get("/statistics", authenticate, revisionController.getRevisionStatistics);
router.get("/subject/:subjectId", authenticate, revisionController.getRevisionBySubject);
router.post("/mark-reviewed", authenticate, revisionController.markAsReviewed);

export default router;
