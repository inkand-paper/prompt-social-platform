'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiHome, FiCompass, FiBookmark, FiUser, FiZap } from 'react-icons/fi';
import { NotificationBell } from '../social/NotificationBell';

const NAV_ITEMS = [
  { href: '/feed', icon: <FiHome className="w-6 h-6" /> },
  { href: '/explore', icon: <FiCompass className="w-6 h-6" /> },
  { href: '/saved', icon: <FiBookmark className="w-6 h-6" /> },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    return pathname?.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-gray-800 z-50 flex items-center justify-around px-2">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`p-3 transition-colors ${
            isActive(item.href) ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {item.icon}
        </Link>
      ))}

      {/* Notifications embedded in bottom nav */}
      {user && (
        <div className="p-3 text-gray-500 hover:text-gray-300">
          <NotificationBell />
        </div>
      )}

      {user ? (
        <Link
          href={`/profile/${user.username}`}
          className={`p-3 transition-colors ${
            pathname?.startsWith(`/profile/${user.username}`) ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <FiUser className="w-6 h-6" />
        </Link>
      ) : (
        <Link href="/" className="p-3 text-gray-500 hover:text-gray-300">
          <FiUser className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
