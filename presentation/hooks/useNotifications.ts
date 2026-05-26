'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/infrastructure/database/SupabaseClient';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'save';
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
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    hasMore: true,
  });
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const loadNotifications = useCallback(async (reset: boolean = false) => {
    if (!user) return;
    
    const currentOffset = reset ? 0 : offset;
    setLoading(true);
    
    try {
      const response = await fetch(`/api/social/notifications?limit=20&offset=${currentOffset}`);
      const data = await response.json();
      
      if (data.success) {
        const newNotifications = data.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
        
        setState(prev => ({
          notifications: reset ? newNotifications : [...prev.notifications, ...newNotifications],
          unreadCount: data.unreadCount,
          hasMore: data.hasMore,
        }));
        
        if (!reset) {
          setOffset(prev => prev + 20);
        } else {
          setOffset(20);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user, offset]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/social/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      
      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/social/notifications/all', {
        method: 'PUT',
      });
      
      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/social/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        const deleted = state.notifications.find(n => n.id === notificationId);
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: deleted && !deleted.read ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        }));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [user, state.notifications]);

  const getUnreadCount = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      const response = await fetch('/api/social/notifications/unread-count');
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      return 0;
    }
  }, [user]);

  const refresh = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  useEffect(() => {
    if (user) {
      loadNotifications(true);
    }
  }, [user]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // A new notification was inserted for the current user
          // Refresh unread count and notifications list
          getUnreadCount().then(count => {
            setState(prev => ({ ...prev, unreadCount: count }));
          });
          // Show a toast for the new notification
          toast.info('New notification arrived!');
          // Refresh the list to show the new notification at the top
          loadNotifications(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadNotifications, getUnreadCount]);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    hasMore: state.hasMore,
    loading,
    loadMore: () => loadNotifications(false),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}