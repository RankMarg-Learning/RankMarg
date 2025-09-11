import { SuggestionController } from "@/controllers/suggestion.controller";
import { TestController } from "@/controllers/test.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const suggestionController = new SuggestionController();

router.get("/", authenticate, suggestionController.getSuggestions);

export default router;
