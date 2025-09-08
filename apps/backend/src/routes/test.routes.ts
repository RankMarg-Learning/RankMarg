import { TestController } from "@/controllers/test.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const testController = new TestController();

router.post("/", authenticate, testController.createTest);
router.post("/join", authenticate, testController.joinTest);
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
export default router;
