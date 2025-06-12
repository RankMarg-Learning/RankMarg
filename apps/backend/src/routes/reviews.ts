import { updateReviews } from "../controller/reviews.controller";
import { Router } from "express";

const router = Router();

router.post("/", updateReviews);

export default router;
