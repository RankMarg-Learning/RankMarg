import { TestController } from "@/controllers/test.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const testController = new TestController();

router.post("/", authenticate, testController.createTest);
router.post("/intelligent-create", authenticate, testController.intelligentCreateTest);
router.get("/", authenticate, testController.getTests);
router.post("/ai/join", authenticate, testController.joinTest);
router.get("/:testId", authenticate, testController.getTestById);
router.put("/:testId", authenticate, testController.updateTestById);
router.delete("/:testId", authenticate, testController.deleteTestById);
router.get("/:testId/details", authenticate, testController.getTestDetailsById);
router.get(
  "/:testId/participant",
  authenticate,
  testController.getTestParticipantById
);
router.post("/:testId/submit", authenticate, testController.submitTest);
router.get("/ai/available", authenticate, testController.getAiAvailableTests);
router.get(
  "/ai/recommended",
  authenticate,
  testController.getAiRecommendedTests
);
router.get("/ai/results", authenticate, testController.getAiTestResults);
router.get("/ai/scheduled", authenticate, testController.getAiScheduledTests);
router.get("/:testId/analysis", authenticate, testController.getTestAnalysisById);
router.get("/:testId/generate-pdf", authenticate, testController.generateTestPDF);
export default router;
