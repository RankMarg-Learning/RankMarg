import { updatePerformance } from "../controller/performance.controller";
import { Router } from "express";

const router = Router();

router.post("/", updatePerformance);

export default router;
