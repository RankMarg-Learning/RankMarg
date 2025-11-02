import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response, Request } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import ServerConfig from "@/config/server.config";
import { AuthUtil } from "@/utils/auth.util";
import { SubscriptionStatus } from "@repo/db/enums";
import {
  getSubscriptionExpiryDate,
  validatePrice,
} from "@/utils/subscription-pricing.util";
import { DEFAULT_PLAN_DISCOUNT } from "@/constant";

export class paymentController {
  createOrder = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { planId, coupon } = req.body;
      
      // Security: Input validation
      if (!planId || typeof planId !== 'string') {
        ResponseUtil.error(res, "Missing or invalid planId", 400);
        return;
      }
      
      const userId = req.user.id;
      
      // Fetch plan
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        select: { id: true, amount: true, isActive: true, duration: true },
      });
      
      if (!plan) {
        ResponseUtil.error(res, "Plan not found", 404);
        return;
      }
      
      if (!plan.isActive) {
        ResponseUtil.error(res, "Plan is not active", 400);
        return;
      }
      
      // Validate and get coupon discount
      let discount = 0;
      if (coupon && typeof coupon === 'string' && coupon.trim().length > 0) {
        const promoCode = await prisma.promoCode.findFirst({
          where: {
            code: coupon.toUpperCase().trim(),
            isActive: true,
            validFrom: { lte: new Date() },
            validUntil: { gte: new Date() },
          },
          select: {
            id: true,
            discount: true,
            code: true,
            currentUsageCount: true,
            maxUsageCount: true,
            applicablePlans: { select: { id: true } },
          },
        });
        
        if (!promoCode) {
          ResponseUtil.error(res, "Invalid or expired coupon code", 400);
          return;
        }
        
        // Check if coupon applies to this plan
        const planMatches = promoCode.applicablePlans.length === 0 || 
          promoCode.applicablePlans.some(p => p.id === planId);
        
        if (!planMatches) {
          ResponseUtil.error(res, "Coupon does not apply to this plan", 400);
          return;
        }
        
        // Check usage limit
        if (promoCode.maxUsageCount && promoCode.currentUsageCount >= promoCode.maxUsageCount) {
          ResponseUtil.error(res, "Coupon usage limit exceeded", 400);
          return;
        }
        
        discount = promoCode.discount;
        
        // Validate discount range
        if (discount < 0 || discount > 100) {
          ResponseUtil.error(res, "Invalid discount value", 400);
          return;
        }
      }
      
      // Start with full plan price
      const basePrice = plan.amount;
      
      // Apply default discount first
      const priceAfterDefaultDiscount = basePrice * (1 - DEFAULT_PLAN_DISCOUNT / 100);
      
      // Apply coupon discount on top of default discount
      const discountedPrice = priceAfterDefaultDiscount * (1 - discount / 100);
      const finalAmount = Math.round(discountedPrice);
      
      // Calculate total discount applied
      const totalDiscountPercent = 100 - ((finalAmount / basePrice) * 100);
      
      // Security: Validate final amount
      const maxAllowedAmount = plan.duration >= 730 ? plan.amount * 2 : plan.amount * 1.5;
      if (finalAmount <= 0 || finalAmount > maxAllowedAmount) {
        ResponseUtil.error(res, "Invalid calculated price", 400);
        return;
      }
      
      // Create Razorpay order
      const razorpay = new Razorpay({
        key_id: ServerConfig.razorpay.key_id!,
        key_secret: ServerConfig.razorpay.key_secret!,
      });
      
      const receipt = `order_${userId}_${Date.now()}`.slice(0, 40);
      const order = await razorpay.orders.create({
        amount: finalAmount * 100, // Convert to paise
        currency: "INR",
        receipt,
          notes: {
          userId,
          planId,
          originalPlanPrice: plan.amount.toString(),
          defaultDiscount: DEFAULT_PLAN_DISCOUNT.toString(),
          couponDiscount: discount.toString(),
          totalDiscount: totalDiscountPercent.toFixed(2),
        },
      });
      
      if (!order) {
        ResponseUtil.error(res, "Failed to create order", 400);
        return;
      }
      
      // Get or create subscription
      let subscription = await prisma.subscription.findFirst({
        where: { userId },
        select: { id: true },
      });
      
      if (!subscription) {
        ResponseUtil.error(res, "Subscription not found. Please contact support.", 404);
        return;
      }
      
      // Create payment record
      await prisma.payment.create({
        data: {
          amount: finalAmount,
          currency: "INR",
          status: "PENDING",
          provider: "PLATFORM",
          orderId: order.id,
          user: { connect: { id: userId } },
          subscription: { connect: { id: subscription.id } },
        },
      });
      
      const response = {
        userId,
        orderId: order.id,
        amount: finalAmount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at,
        originalPlanPrice: plan.amount,
        defaultDiscount: DEFAULT_PLAN_DISCOUNT,
        priceAfterDefaultDiscount: Math.round(priceAfterDefaultDiscount),
      };
      
      ResponseUtil.success(res, response, "Order created successfully", 200);
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
        amount,
        userId,
        orderId,
        razorpayPaymentId,
        razorpaySignature,
      } = req.body;
      
      // Security: Input validation
      if (!orderId || !razorpayPaymentId || !razorpaySignature || !planId || !userId) {
        ResponseUtil.error(res, "Missing required payment verification fields", 400);
        return;
      }
      
      // Security: Verify signature
      const text = `${orderId}|${razorpayPaymentId}`;
      const generatedSignature = crypto
        .createHmac("sha256", ServerConfig.razorpay.key_secret!)
        .update(text)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        ResponseUtil.error(res, "Invalid payment signature", 400);
        return;
      }
      
      // Security: Verify user matches authenticated user
      if (userId !== req.user.id) {
        ResponseUtil.error(res, "User mismatch", 403);
        return;
      }
      
      // Fetch payment record to verify
      const payment = await prisma.payment.findFirst({
        where: {
          orderId,
          userId,
        },
        select: {
          id: true,
          amount: true,
          status: true,
          subscription: {
            select: {
              id: true,
            },
          },
        },
      });
      
      if (!payment) {
        ResponseUtil.error(res, "Payment record not found", 404);
        return;
      }
      
      // Security: Verify amount matches
      if (Math.abs(payment.amount - amount) > 1) {
        ResponseUtil.error(res, "Amount mismatch", 400);
        return;
      }
      
      // Fetch plan
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        select: { id: true, amount: true, name: true, isActive: true, duration: true },
      });
      
      if (!plan || !plan.isActive) {
        ResponseUtil.error(res, "Plan not found or inactive", 404);
        return;
      }
      
      // Security: Validate price calculation
      // Account for default discount + coupon discount
      const priceAfterDefaultDiscount = plan.amount * (1 - DEFAULT_PLAN_DISCOUNT / 100);
      const expectedPrice = Math.round(priceAfterDefaultDiscount * (1 - (discount || 0) / 100));
      
      // Allow small rounding differences (up to 1 rupee)
      const priceDifference = Math.abs(amount - expectedPrice);
      
      if (priceDifference > 1) {
        ResponseUtil.error(res, `Price mismatch. Expected: ₹${expectedPrice}, Got: ₹${amount}`, 400);
        return;
      }
      
      // Get subscription expiry date based on plan duration (1 year or 2 years)
      const expiryDate = getSubscriptionExpiryDate(plan.duration);
      const remainingDays = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // Update subscription
      const subscription = await prisma.subscription.update({
        where: {
          userId,
        },
        data: {
          planId: planId,
          duration: remainingDays,
          status: "ACTIVE",
          provider: "PLATFORM",
          amount: amount,
          discountApplied: DEFAULT_PLAN_DISCOUNT + (discount || 0), // Total discount (default + coupon)
          promoCodeUsed: coupon || null,
          currentPeriodEnd: expiryDate,
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
        return;
      }
      
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });
      
      // Update coupon usage if coupon was used
      if (coupon) {
        await prisma.promoCode.updateMany({
          where: { code: coupon.toUpperCase().trim() },
          data: {
            currentUsageCount: { increment: 1 },
          },
        });
      }
      
      // Update auth token
      AuthUtil.updateTokenCookie(req, res, (payload) => ({
        ...payload,
        plan: {
          id: subscription.plan.id,
          status: SubscriptionStatus.ACTIVE,
          endAt: subscription.currentPeriodEnd,
        },
      }));

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
        .createHmac("sha256", ServerConfig.razorpay.webhook_secret!)
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
