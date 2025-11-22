import prisma from "@repo/db";
import { NotificationType } from "@/types/notification.types";

/**
 * Notification Service
 * Handles all notification-related operations
 */
export class NotificationService {
  /**
   * Create a notification and deliver it to a specific user
   */
  static async createAndDeliverToUser(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    scheduledAt?: Date
  ) {
    try {
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          type,
          title,
          message,
          scheduledAt,
        },
      });

      // Deliver to user
      await prisma.userNotification.create({
        data: {
          userId,
          notificationId: notification.id,
          status: "UNREAD",
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create a notification and deliver it to multiple users
   */
  static async createAndDeliverToUsers(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    scheduledAt?: Date
  ) {
    try {
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          type,
          title,
          message,
          scheduledAt,
        },
      });

      // Deliver to all users
      await prisma.userNotification.createMany({
        data: userIds.map((userId) => ({
          userId,
          notificationId: notification.id,
          status: "UNREAD",
        })),
      });

      return notification;
    } catch (error) {
      console.error("Error creating notifications:", error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        prisma.userNotification.findMany({
          where: { userId },
          include: {
            notification: true,
          },
          orderBy: { deliveredAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.userNotification.count({
          where: { userId },
        }),
      ]);

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Get recent unread notifications count
   */
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.userNotification.count({
        where: {
          userId,
          status: "UNREAD",
        },
      });

      return count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(userId: string, notificationId: string) {
    try {
      const userNotification = await prisma.userNotification.updateMany({
        where: {
          userId,
          notificationId,
          status: "UNREAD",
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });

      return userNotification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.userNotification.updateMany({
        where: {
          userId,
          status: "UNREAD",
        },
        data: {
          status: "READ",
          readAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Delete a notification for a user
   */
  static async deleteNotification(userId: string, notificationId: string) {
    try {
      const result = await prisma.userNotification.deleteMany({
        where: {
          userId,
          notificationId,
        },
      });

      return result;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Notification Templates
   */
  static templates = {
    practiceSessionCreated: (sessionName: string) => ({
      type: "PRACTICE_SESSION" as NotificationType,
      title: "New Practice Session Created",
      message: `Your practice session "${sessionName}" is ready. Start practicing now!`,
    }),

    testLive: (testName: string) => ({
      type: "TEST_LIVE" as NotificationType,
      title: "New Test is Now Live",
      message: `"${testName}" is now available. Take the test to evaluate your knowledge!`,
    }),

    masteryUpdated: (subjectName: string, masteryLevel: string) => ({
      type: "MASTERY_UPDATE" as NotificationType,
      title: "Mastery Level Updated",
      message: `Your ${subjectName} mastery has been updated to ${masteryLevel}. Keep up the great work!`,
    }),

    welcomeUser: (userName: string) => ({
      type: "WELCOME" as NotificationType,
      title: "Welcome to RankMarg!",
      message: `Hi ${userName}! Welcome aboard. We're excited to help you on your learning journey. Let's get started!`,
    }),
  };
}

