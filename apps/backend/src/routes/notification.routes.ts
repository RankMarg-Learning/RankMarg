import express from "express";
import { notificationController } from "@/controllers/notification.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = express.Router();

/**
 * @route GET /notifications
 * @desc Get user notifications with pagination
 * @access Private
 */
router.get("/", authenticate, notificationController.getNotifications);

/**
 * @route GET /notifications/recent
 * @desc Get recent 9 notifications for dropdown
 * @access Private
 */
router.get("/recent", authenticate, notificationController.getRecentNotifications);

/**
 * @route GET /notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get("/unread-count", authenticate, notificationController.getUnreadCount);

/**
 * @route PUT /notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.put("/:id/read", authenticate, notificationController.markAsRead);

/**
 * @route PUT /notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.put("/read-all", authenticate, notificationController.markAllAsRead);

/**
 * @route DELETE /notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete("/:id", authenticate, notificationController.deleteNotification);

export default router;

