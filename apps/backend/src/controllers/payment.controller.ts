import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response, Request } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import ServerConfig from "@/config/server.config";

export class paymentController {
  createOrder = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { planId, amount, duration } = req.body;
      if (!planId || !amount || !duration) {
        ResponseUtil.error(
          res,
          "Missing required fields: planId, amount, or duration",
          400
        );
      }
      const userId = req.user.id;
      const receipt = `order_${userId}`.slice(0, 40);
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        select: { id: true },
      });
      if (!plan) {
        ResponseUtil.error(res, "Plan not found", 404);
      }
      const razorpay = new Razorpay({
        key_id: ServerConfig.razorpay.key_id!,
        key_secret: ServerConfig.razorpay.key_secret!,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        notes: {
          userId,
          planId,
          duration,
        },
      });
      if (!order) {
        ResponseUtil.error(res, "Failed to create order", 400);
      }
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        select: { id: true },
      });
      if (!subscription) {
        ResponseUtil.error(res, "Subscription not found", 404);
      }
      await prisma.payment.create({
        data: {
          amount,
          currency: "INR",
          status: "PENDING",
          provider: "PLATFORM",
          orderId: order.id,
          user: { connect: { id: userId } },
          subscription: { connect: { id: subscription.id } },
        },
      });
      const payload = {
        userId,
        orderId: order.id,
        amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at,
      };
      ResponseUtil.success(res, payload, "Order created successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  verifyPayment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        coupon,
        discount,
        planId,
        duration,
        amount,
        userId,
        orderId,
        razorpayPaymentId,
        razorpaySignature,
      } = req.body;
      const text = `${orderId}|${razorpayPaymentId}`;

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        ResponseUtil.error(res, "Invalid signature", 400);
      }
      const subscription = await prisma.subscription.update({
        where: {
          userId,
        },
        data: {
          planId: planId,
          duration: duration,
          status: "ACTIVE",
          provider: "PLATFORM",
          amount: amount,
          discountApplied: discount || 0,
          promoCodeUsed: coupon || null,
          currentPeriodEnd: new Date(
            Date.now() + duration * 24 * 60 * 60 * 1000
          ),
          trialEndsAt: null,
        },
        select: {
          currentPeriodEnd: true,
          plan: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });
      if (!subscription) {
        ResponseUtil.error(res, "Subscription not found", 404);
      }
      const payload = {
        expiry: subscription.currentPeriodEnd.toLocaleDateString("en-IN"),
        planId: subscription.plan.id,
        planName: subscription.plan.name,
      };
      ResponseUtil.success(res, payload, "Payment verified successfully", 200);
    } catch (error) {
      next(error);
    }
  };
  webhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rawBody = JSON.stringify(req.body);
      const signature = req.headers["x-razorpay-signature"] as string;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(rawBody)
        .digest("hex");
      if (signature !== expectedSignature) {
        ResponseUtil.error(res, "Invalid signature", 400);
      }
      const event = req.body;

      switch (event.event) {
        case "payment.captured":
          const payment = event.payload.payment.entity;
          const orderId = payment.order_id;

          if (orderId) {
            await prisma.payment.updateMany({
              where: { orderId: orderId },
              data: {
                status: "COMPLETED",
                paymentMethod: payment.method,
                paidAt: new Date(),
              },
            });

            if (payment.notes?.userId) {
              await prisma.subscription.updateMany({
                where: { userId: payment.notes.userId },
                data: {
                  status: "ACTIVE",
                  planId: payment.notes.planId,
                },
              });
            }
          }
          break;

        case "payment.failed":
          const failedPayment = event.payload.payment.entity;
          const failedOrderId = failedPayment.order_id;

          if (failedOrderId) {
            await prisma.payment.updateMany({
              where: { orderId: failedOrderId },
              data: {
                status: "FAILED",
                paymentMethod: failedPayment.method,
              },
            });

            if (failedPayment.notes?.userId) {
              await prisma.subscription.updateMany({
                where: { userId: failedPayment.notes.userId },
                data: {
                  status: "CANCELLED",
                },
              });
            }
          }
          break;

        default:
          console.log(`Unhandled event: ${event.event}`);
      }
      ResponseUtil.success(res, null, "Webhook processed successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
