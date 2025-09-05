import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";
import { CurrentTopicController } from "@/controllers/currentTopic.controller";

const router = Router();
const currentTopicController = new CurrentTopicController();

router.get("/", authenticate, currentTopicController.getCurrentTopics);
router.get(
  "/:subjectId",
  authenticate,
  currentTopicController.getCurrentTopicsBySubjectId
);
router.put(
  "/",
  authenticate,
  currentTopicController.updateCurrentTopicBySubjectId
);
router.patch(
  "/",
  authenticate,
  currentTopicController.updateCurrentTopicBySubjectIdIsCompleted
);

export default router;
