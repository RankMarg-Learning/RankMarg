import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { paymentController } from "@/controllers/payment.controller";

const router = Router();
const payment = new paymentController();

router.post("/create-order", authenticate, payment.createOrder);
router.post("/verify", authenticate, payment.verifyPayment);
router.post("/webhook/razorpay", payment.webhook);

export default router;
