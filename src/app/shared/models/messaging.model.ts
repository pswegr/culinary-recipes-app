export enum MediaAttachmentType {
  Photo = 0,
  Video = 1,
  Link = 2,
}

export enum MessageRequestStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export interface MediaAttachmentModel {
  type: MediaAttachmentType;
  url: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface ConversationModel {
  id: string;
  participantUserIds: string[];
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
}

export interface ChatMessageModel {
  id: string;
  conversationId: string;
  senderUserId: string;
  recipientUserId: string;
  content: string;
  attachments: MediaAttachmentModel[];
  sentAt: string;
  isRead: boolean;
}

export interface MessageRequestModel {
  id: string;
  requesterUserId: string;
  recipientUserId: string;
  status: MessageRequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessagingHandshakeModel {
  userId: string;
  connectionId: string;
  serverTimeUtc: string;
  pendingRequestCount: number;
  unreadNotificationCount: number;
}

export interface CreateMessageRequestModel {
  recipientNick: string;
}

export interface RespondMessageRequestModel {
  accept: boolean;
}

export interface SendMessageModel {
  conversationId: string;
  recipientUserId: string;
  content: string;
  attachments?: MediaAttachmentModel[];
}
