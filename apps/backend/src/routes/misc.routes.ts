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

router.post("/upload-s3", authenticate, miscController.uploadS3);

router.get("/check/coupon", authenticate, miscController.checkCoupon);

router.post("/check/phone", authenticate, (req, res, next) => { miscController.checkPhoneNumber(req, res, next); });

router.post("/submit/poll", authenticate, (req, res, next) => { miscController.submitPoll(req, res, next); });

router.post("/submit/form", authenticate, (req, res, next) => { miscController.submitInputForm(req, res, next); });

export default router;
