import { AIQuestionController } from "@/controllers/aiQuestion.controller";
import { authenticate, checkSubscription } from "@/middleware/auth.middleware";
import { SubscriptionTier } from "@/types/common";
import { Router } from "express";

const router = Router();
const aiQuestionController = new AIQuestionController();

// All AI question routes require authentication and active subscription
router.use(authenticate);
router.use(checkSubscription(SubscriptionTier.BASIC)); // Requires at least BASIC subscription

// Get all subjects available for AI questions
router.get("/subjects", aiQuestionController.getSubjectsForAIQuestions);

// Get topics by subject
router.get("/subjects/:subjectId/topics", aiQuestionController.getTopicsBySubject);

// Get AI questions by topic slug
router.get("/topic/:topicSlug", aiQuestionController.getAIQuestionsByTopic);

// Get questions for solving session (unattempted questions)
router.get("/topic/:topicSlug/session", aiQuestionController.getQuestionsForSession);

// Get user's recent attempts for a topic
router.get("/topic/:topicSlug/attempts", aiQuestionController.getRecentAttemptsByTopic);


export default router;

