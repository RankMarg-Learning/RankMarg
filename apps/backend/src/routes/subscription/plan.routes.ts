import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { PlanController } from "@/controllers/subscription/plan.controller";

const router = Router();
const plan = new PlanController();

router.get("/", authenticate, plan.getPlans);
router.post("/", authenticate, plan.createPlan);
router.get("/:id", authenticate, plan.getPlanById);
router.put("/:id", authenticate, plan.updatePlanById);
router.delete("/:id", authenticate, plan.deletePlanById);

export default router;
