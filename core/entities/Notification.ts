export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'reply' 
  | 'follow' 
  | 'save';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  prompt_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: Date;
  metadata?: Record<string, any>;
}

export interface CreateNotificationInput {
  user_id: string;
  actor_id: string;
  type: NotificationType;
  prompt_id?: string;
  comment_id?: string;
  metadata?: Record<string, any>;
}