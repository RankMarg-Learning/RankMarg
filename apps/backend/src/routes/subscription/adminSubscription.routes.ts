import { Router } from "express";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { AdminSubscriptionController } from "@/controllers/subscription/adminSubscription.controller";

const router = Router();
const adminSubscriptionController = new AdminSubscriptionController();

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Assign subscription to user
router.post("/assign", adminSubscriptionController.assignSubscription);

// Get all subscriptions
router.get("/", adminSubscriptionController.getSubscriptions);

// Get specific user's subscription
router.get("/user", adminSubscriptionController.getUserSubscription);

// Update subscription
router.patch("/user", adminSubscriptionController.updateSubscription);

// Cancel subscription
router.delete("/user", adminSubscriptionController.cancelSubscription);

// Get statistics
router.get("/statistics", adminSubscriptionController.getStatistics);

export default router;

