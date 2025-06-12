import { createPracticeSession } from "../controller/session.controller";
import { Router } from "express";

const router = Router();

router.post("/", createPracticeSession);

export default router;
