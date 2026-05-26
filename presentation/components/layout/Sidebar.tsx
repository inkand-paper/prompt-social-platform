'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import {
  FiHome,
  FiCompass,
  FiBookmark,
  FiUser,
  FiSettings,
  FiLogOut,
  FiEdit3,
  FiZap,
  FiGrid,
  FiBell,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { href: '/feed', label: 'Home', icon: FiHome },
  { href: '/explore', label: 'Explore', icon: FiCompass },
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/saved', label: 'Saved', icon: FiBookmark },
  { href: '/notifications', label: 'Notifications', icon: FiBell },
  { href: '/profile', label: 'Profile', icon: FiUser },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    if (href === '/dashboard' && pathname?.startsWith('/dashboard/prompts')) return true;
    if (href === '/profile') return pathname?.startsWith('/profile');
    return pathname === href;
  };

  const getProfileLink = () => {
    return user ? `/profile/${user.username}` : '/';
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 xl:w-64 flex flex-col pt-6 pb-6 border-r border-white/[0.06] bg-black z-40 transition-all">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-3 px-5 mb-10 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          <FiZap className="w-5 h-5 text-white" />
        </div>
        <div className="hidden xl:block">
          <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            PromptSocial
          </span>
        </div>
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 w-full px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = item.href === '/profile' ? getProfileLink() : item.href;
          const active = isActive(item.href);
          const Icon = item.icon;
          
          if (item.href === '/notifications' && !user) return null;
          if (item.href === '/profile' && !user) return null;

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group ${
                active
                  ? 'bg-violet-500/10 text-violet-300 border-l-2 border-violet-500'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-violet-400' : 'group-hover:text-white'}`} />
              <span className="hidden xl:block text-[15px] font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Post Button */}
      {user && (
        <div className="w-full px-3 mb-6">
          <Link
            href="/dashboard/prompts/new"
            className="w-12 h-12 xl:w-full xl:h-12 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            <FiEdit3 className="w-5 h-5 xl:hidden" />
            <span className="hidden xl:flex items-center gap-2 text-[15px]">
              <FiEdit3 className="w-4 h-4" />
              New Prompt
            </span>
          </Link>
        </div>
      )}

      {/* User Mini-Profile */}
      {user ? (
        <div className="w-full px-3 mt-auto relative group">
          <div className="flex items-center xl:justify-between p-2 xl:p-3 hover:bg-white/5 rounded-xl cursor-pointer transition border border-transparent hover:border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(user.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="hidden xl:block truncate">
                <p className="font-bold text-white text-sm truncate">{user.fullName || user.username}</p>
                <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Hover Menu */}
          <div className="absolute bottom-full left-3 mb-2 w-52 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <Link href="/settings/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white transition rounded-t-2xl text-sm">
              <FiSettings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition text-sm rounded-b-2xl border-t border-white/5"
            >
              <FiLogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full px-3 mt-auto">
          <Link href="/" className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center font-bold hover:bg-white/10 transition text-sm text-center">
            Sign In
          </Link>
        </div>
      )}
    </aside>
  );
}
