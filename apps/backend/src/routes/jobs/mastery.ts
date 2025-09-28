import { updateMastery } from "@/controllers/jobs/mastery.controller";
import { Router } from "express";

const router = Router();

router.post("/", updateMastery);

export default router;
