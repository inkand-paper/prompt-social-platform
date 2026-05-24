import { Notification, CreateNotificationInput } from '../entities/Notification';

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<Notification>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  delete(notificationId: string, userId: string): Promise<void>;
  deleteByPromptId(promptId: string): Promise<void>;
}