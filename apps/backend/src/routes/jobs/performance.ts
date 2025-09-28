import { updatePerformance } from "@/controllers/jobs/performance.controller";
import { Router } from "express";

const router = Router();

router.post("/", updatePerformance);

export default router;
