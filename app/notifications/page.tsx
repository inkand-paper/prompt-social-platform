'use client';

import { useNotifications } from '@/presentation/hooks/useNotifications';
import { useAuth } from '@/presentation/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Notifications</h1>
            <p className="text-gray-400 mb-6">Please login to see your notifications</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Go to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return `liked your prompt "${notification.prompt?.title}"`;
      case 'comment':
        return `commented on "${notification.prompt?.title}"`;
      case 'reply':
        return `replied to your comment on "${notification.prompt?.title}"`;
      case 'follow':
        return `started following you`;
      case 'save':
        return `saved your prompt "${notification.prompt?.title}"`;
      default:
        return '';
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.type === 'follow') {
      return `/profile/${notification.actor.username}`;
    }
    return `/dashboard/prompts/${notification.prompt?.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={refresh}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
          >
            <FiBell className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition"
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {notifications.length === 0 && !loading ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
              <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-2">
                When someone interacts with your prompts, you'll see it here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-900/50 backdrop-blur-sm rounded-lg border ${
                  !notification.read ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-700'
                } hover:border-gray-600 transition group`}
              >
                <Link
                  href={getNotificationLink(notification)}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className="block p-4"
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0">
                      {notification.actor.avatar_url ? (
                        <Image
                          src={notification.actor.avatar_url}
                          alt={notification.actor.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {notification.actor.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300">
                        <span className="font-semibold text-white">
                          @{notification.actor.username}
                        </span>{' '}
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            markAsRead(notification.id);
                          }}
                          className="p-1 text-gray-500 hover:text-green-500 transition"
                          title="Mark as read"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Delete this notification?')) {
                            deleteNotification(notification.id);
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && hasMore && notifications.length > 0 && (
            <div className="flex justify-center py-4">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}