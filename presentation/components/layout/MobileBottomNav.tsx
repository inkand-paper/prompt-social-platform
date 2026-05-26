'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiHome, FiCompass, FiBookmark, FiUser, FiPlus } from 'react-icons/fi';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    if (href === '/profile') return pathname?.startsWith('/profile');
    return pathname === href;
  };

  const centerButton = (
    <Link
      href="/dashboard/prompts/new"
      className="relative -top-4 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg flex items-center justify-center border-4 border-black transition-transform active:scale-90"
    >
      <FiPlus className="w-8 h-8 font-black" />
    </Link>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-2xl border-t border-white/[0.06] z-50 flex items-center justify-between px-6">
      
      <Link
        href="/feed"
        className={`p-2 transition-all ${isActive('/feed') ? 'text-violet-500 scale-110' : 'text-zinc-600'}`}
      >
        <FiHome className="w-6 h-6" />
      </Link>

      <Link
        href="/explore"
        className={`p-2 transition-all ${isActive('/explore') ? 'text-violet-500 scale-110' : 'text-zinc-600'}`}
      >
        <FiCompass className="w-6 h-6" />
      </Link>

      {centerButton}

      <Link
        href="/saved"
        className={`p-2 transition-all ${isActive('/saved') ? 'text-violet-500 scale-110' : 'text-zinc-600'}`}
      >
        <FiBookmark className="w-6 h-6" />
      </Link>

      {user ? (
        <Link
          href={`/profile/${user.username}`}
          className={`p-2 transition-all ${isActive('/profile') ? 'text-violet-500 scale-110' : 'text-zinc-600'}`}
        >
          <FiUser className="w-6 h-6" />
        </Link>
      ) : (
        <Link href="/" className="p-2 text-zinc-600">
          <FiUser className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
