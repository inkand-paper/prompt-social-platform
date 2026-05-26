'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiHome, FiCompass, FiBookmark, FiUser, FiEdit3 } from 'react-icons/fi';
import { NotificationBell } from '../social/NotificationBell';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    return pathname?.startsWith(href);
  };

  const navItems = [
    { href: '/feed', icon: FiHome },
    { href: '/explore', icon: FiCompass },
    { href: '/saved', icon: FiBookmark },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-t border-gray-800/60 z-50 flex items-center justify-around px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`p-3 rounded-xl transition-colors ${active ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon className="w-6 h-6" />
          </Link>
        );
      })}

      {user && (
        <Link
          href="/dashboard/prompts/new"
          className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
        >
          <FiEdit3 className="w-5 h-5" />
        </Link>
      )}

      {user ? (
        <Link
          href={`/profile/${user.username}`}
          className={`p-3 rounded-xl transition-colors ${pathname?.startsWith(`/profile/${user.username}`) ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
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
