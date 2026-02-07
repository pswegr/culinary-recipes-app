export enum NotificationType {
  MessageRequest = 0,
  Message = 1,
  Like = 2,
  Action = 3,
}

export interface NotificationModel {
  id: string;
  type: NotificationType;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt?: string;
  recipientUserId?: string;
  senderUserId?: string;
  conversationId?: string;
  requestId?: string;
  payload?: Record<string, unknown>;
}
