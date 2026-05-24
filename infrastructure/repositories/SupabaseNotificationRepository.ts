import { supabase } from '../database/SupabaseClient';
import { INotificationRepository } from '../../core/repositories/INotificationRepository';
import { Notification, CreateNotificationInput, NotificationType } from '../../core/entities/Notification';

export class SupabaseNotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationInput): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        actor_id: data.actor_id,
        type: data.type,
        prompt_id: data.prompt_id || null,
        comment_id: data.comment_id || null,
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create notification: ${error.message}`);
    
    return {
      id: notification.id,
      user_id: notification.user_id,
      actor_id: notification.actor_id,
      type: notification.type,
      prompt_id: notification.prompt_id,
      comment_id: notification.comment_id,
      read: notification.read,
      created_at: new Date(notification.created_at),
      metadata: notification.metadata,
    };
  }

  async findByUserId(userId: string, limit: number = 30, offset: number = 0): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to get notifications: ${error.message}`);
    
    return data.map(notification => ({
      id: notification.id,
      user_id: notification.user_id,
      actor_id: notification.actor_id,
      type: notification.type,
      prompt_id: notification.prompt_id,
      comment_id: notification.comment_id,
      read: notification.read,
      created_at: new Date(notification.created_at),
      metadata: notification.metadata,
    }));
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw new Error(`Failed to get unread count: ${error.message}`);
    return count || 0;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete notification: ${error.message}`);
  }

  async deleteByPromptId(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('prompt_id', promptId);

    if (error) throw new Error(`Failed to delete prompt notifications: ${error.message}`);
  }

  async deleteByCommentId(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('comment_id', commentId);

    if (error) throw new Error(`Failed to delete comment notifications: ${error.message}`);
  }
}