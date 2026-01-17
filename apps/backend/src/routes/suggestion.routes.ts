import { SuggestionController } from "@/controllers/suggestion.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();
const suggestionController = new SuggestionController();

router.get("/", authenticate, suggestionController.getSuggestions);

router.get("/stream", authenticate, suggestionController.streamSuggestions);

export default router;
