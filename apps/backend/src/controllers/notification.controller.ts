import { Request, Response, NextFunction } from "express";
import { NotificationService } from "@/services/notification.service";
import { ResponseUtil } from "@/utils/response.util";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";

export const notificationController = {
  /**
   * Get user notifications
   * @route GET /notifications
   */
  getNotifications: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseUtil.error(res, "Unauthorized", 401);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await NotificationService.getUserNotifications(
        userId,
        page,
        limit
      );

      ResponseUtil.success(
        res,
        result,
        "Notifications fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent notifications (for dropdown)
   * @route GET /notifications/recent
   */
  getRecentNotifications: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseUtil.error(res, "Unauthorized", 401);
        return;
      }

      const result = await NotificationService.getUserNotifications(
        userId,
        1,
        9
      );

      ResponseUtil.success(
        res,
        result,
        "Recent notifications fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread notification count
   * @route GET /notifications/unread-count
   */
  getUnreadCount: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseUtil.error(res, "Unauthorized", 401);
        return;
      }

      const count = await NotificationService.getUnreadCount(userId);

      ResponseUtil.success(
        res,
        { count },
        "Unread count fetched successfully"
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as read
   * @route PUT /notifications/:id/read
   */
  markAsRead: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseUtil.error(res, "Unauthorized", 401);
        return;
      }

      const notificationId = req.params.id;

      await NotificationService.markAsRead(userId, notificationId);

      ResponseUtil.success(res, null, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all notifications as read
   * @route PUT /notifications/read-all
   */
  markAllAsRead: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseUtil.error(res, "Unauthorized", 401);
        return;
      }

      await NotificationService.markAllAsRead(userId);

      ResponseUtil.success(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete notification
   * @route DELETE /notifications/:id
   */
  deleteNotification: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ResponseUtil.error(res, "Unauthorized", 401);
        return;
      }

      const notificationId = req.params.id;

      await NotificationService.deleteNotification(userId, notificationId);

      ResponseUtil.success(res, null, "Notification deleted successfully");
    } catch (error) {
      next(error);
    }
  },
};

