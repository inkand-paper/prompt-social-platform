import { NotificationType } from '../../core/entities/Notification';

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  actor: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  prompt?: {
    id: string;
    title: string;
  };
  commentId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationsResponseDTO {
  notifications: NotificationDTO[];
  unreadCount: number;
  hasMore: boolean;
}