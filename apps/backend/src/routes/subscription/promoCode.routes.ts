import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { PromocodesController } from "@/controllers/subscription/promocodes.controller";

const router = Router();
const promoCode = new PromocodesController();

router.get("/", authenticate, promoCode.getPromocodes);
router.post("/", authenticate, promoCode.createPromocode);
router.get("/:id", authenticate, promoCode.getPromocodeById);
router.put("/:id", authenticate, promoCode.updatePromocodeById);
router.delete("/:id", authenticate, promoCode.deletePromocodeById);

export default router;
