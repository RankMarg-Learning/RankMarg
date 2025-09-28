import { updateReviews } from "@/controllers/jobs/reviews.controller";
import { Router } from "express";

const router = Router();

router.post("/", updateReviews);

export default router;
