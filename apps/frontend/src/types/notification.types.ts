export type NotificationType = 
  | "PRACTICE_SESSION" 
  | "TEST_LIVE" 
  | "MASTERY_UPDATE" 
  | "WELCOME"
  | "SYSTEM";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  scheduledAt: Date | null;
  createdAt: Date;
}

export interface UserNotification {
  id: string;
  userId: string;
  notificationId: string;
  status: "READ" | "UNREAD";
  deliveredAt: Date;
  readAt: Date | null;
  notification: Notification;
}

export interface NotificationResponse {
  notifications: UserNotification[];
  total: number;
  page: number;
  totalPages: number;
}

