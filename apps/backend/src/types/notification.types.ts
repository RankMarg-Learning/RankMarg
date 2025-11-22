export type NotificationType = 
  | "PRACTICE_SESSION" 
  | "TEST_LIVE" 
  | "MASTERY_UPDATE" 
  | "WELCOME"
  | "SYSTEM";

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  scheduledAt?: Date;
}

export interface UserNotificationResponse {
  id: string;
  userId: string;
  notificationId: string;
  status: string;
  deliveredAt: Date;
  readAt: Date | null;
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    scheduledAt: Date | null;
    createdAt: Date;
  };
}

