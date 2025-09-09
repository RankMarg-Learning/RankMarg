import { TopicsController } from "@/controllers/topics.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const topicsController = new TopicsController();

router.get("/", authenticate, topicsController.getTopics);
router.post("/", authenticate, topicsController.createTopic);
router.get("/:id", authenticate, topicsController.getTopicById);
router.put("/:id", authenticate, topicsController.updateTopicById);
router.delete("/:id", authenticate, topicsController.deleteTopicById);

export default router;
