'use client';

import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/presentation/hooks/useAuth';

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/social/notifications/unread-count')
      const data = await res.json()
      setUnreadCount(data.count || 0)
    } catch {
      // silent
    }
  }
  
  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <p className="text-gray-500 text-center py-8">No notifications yet</p>
          </div>
          
          <div className="p-2 border-t border-gray-700">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-purple-400 hover:text-purple-300 py-1"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}