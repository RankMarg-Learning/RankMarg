import api from "@/utils/api";
import { NotificationResponse } from "@/types/notification.types";

export const notificationService = {
  /**
   * Get user notifications with pagination
   */
  getNotifications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<{ data: NotificationResponse }>("/notifications", {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Get recent notifications (for dropdown)
   */
  getRecentNotifications: async () => {
    const response = await api.get<{ data: NotificationResponse }>("/notifications/recent");
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    const response = await api.get<{ data: { count: number } }>("/notifications/unread-count");
    return response.data.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

