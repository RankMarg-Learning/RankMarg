import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { MiscController } from "@/controllers/misc.controller";

const router = Router();
const miscController = new MiscController();

router.post(
  "/upload-cloudinary",
  authenticate,
  miscController.uploadCloudinary
);

router.get("/check/coupon", authenticate, miscController.checkCoupon);

router.post("/check/phone", authenticate, miscController.checkPhoneNumber);

export default router;
