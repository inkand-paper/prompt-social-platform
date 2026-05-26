'use client';

import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/presentation/hooks/useAuth';

interface MiniNotification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor: { username: string; avatar_url?: string };
  prompt?: { id: string; title: string };
}

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<MiniNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/social/notifications/unread-count');
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch { /* silent */ }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/social/notifications?limit=5&offset=0');
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch { /* silent */ }
  };

  const getNotificationText = (n: MiniNotification) => {
    switch (n.type) {
      case 'like': return `liked "${n.prompt?.title || 'your prompt'}"`;
      case 'comment': return `commented on "${n.prompt?.title || 'your prompt'}"`;
      case 'reply': return `replied to your comment`;
      case 'follow': return 'started following you';
      case 'save': return `saved "${n.prompt?.title || 'your prompt'}"`;
      default: return 'interacted with you';
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    return `${Math.floor(hr / 24)}d`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-gray-800/60"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(139,92,246,0.6)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/60 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="text-white font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-violet-400">{unreadCount} new</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <FiBell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : notifications.map((n) => (
              <Link
                key={n.id}
                href={n.type === 'follow' ? `/profile/${n.actor.username}` : `/dashboard/prompts/${n.prompt?.id}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition ${!n.read ? 'bg-violet-500/5' : ''}`}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {n.actor.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-snug">
                    <span className="font-semibold text-white">@{n.actor.username}</span>{' '}
                    {getNotificationText(n)}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 shrink-0" />}
              </Link>
            ))}
          </div>

          <div className="p-3 border-t border-gray-800">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-violet-400 hover:text-violet-300 py-1.5 hover:bg-violet-500/10 rounded-lg transition"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
