import { INotificationRepository } from '../../repositories/INotificationRepository';
import { IUserRepository } from '../../repositories/IUserRepository';
import { IPromptRepository } from '../../repositories/IPromptRepository';

export class GetNotificationsUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private userRepository: IUserRepository,
    private promptRepository: IPromptRepository
  ) {}

  async execute(userId: string, limit: number = 30, offset: number = 0) {
    const notifications = await this.notificationRepository.findByUserId(userId, limit, offset);
    const unreadCount = await this.notificationRepository.getUnreadCount(userId);
    
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const actor = await this.userRepository.findById(notification.actor_id);
        let prompt = null;
        
        if (notification.prompt_id) {
          prompt = await this.promptRepository.findById(notification.prompt_id);
        }
        
        return {
          id: notification.id,
          type: notification.type,
          read: notification.read,
          createdAt: notification.created_at,
          actor: actor ? {
            id: actor.id,
            username: actor.username,
            fullName: actor.fullName,
            avatarUrl: actor.avatarUrl,
          } : null,
          prompt: prompt ? {
            id: prompt.id,
            title: prompt.title,
          } : null,
          commentId: notification.comment_id,
          metadata: notification.metadata,
        };
      })
    );
    
    return {
      notifications: enrichedNotifications,
      unreadCount,
      hasMore: notifications.length === limit,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}