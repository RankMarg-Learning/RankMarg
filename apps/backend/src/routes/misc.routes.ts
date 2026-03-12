import { Router } from "express";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
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

router.get("/admin/interactions", authenticate, isAdmin, (req, res, next) => { miscController.getInteractions(req, res, next); });

router.get("/admin/config", authenticate, isAdmin, (req, res, next) => { miscController.getHomeConfig(req, res, next); });

router.post("/admin/config", authenticate, isAdmin, (req, res, next) => { miscController.updateHomeConfig(req, res, next); });

export default router;
