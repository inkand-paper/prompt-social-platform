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
import { NotificationBell } from '../social/NotificationBell';

const NAV_ITEMS = [
  { href: '/feed', label: 'Home', icon: FiHome },
  { href: '/explore', label: 'Explore', icon: FiCompass },
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/saved', label: 'Saved', icon: FiBookmark },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    if (href === '/dashboard') return pathname === '/dashboard' || pathname?.startsWith('/dashboard/prompts');
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 xl:w-64 flex flex-col items-center xl:items-start pt-5 pb-6 border-r border-gray-800/60 bg-black z-40 transition-all">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-3 px-3 xl:px-5 mb-8 hover:opacity-80 transition group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-shadow">
          <FiZap className="w-5 h-5 text-white" />
        </div>
        <div className="hidden xl:block">
          <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            PromptSocial
          </span>
          <p className="text-[10px] text-gray-600 font-medium tracking-widest uppercase">AI Prompt Platform</p>
        </div>
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 w-full px-2 xl:px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3 xl:px-4 py-3 rounded-xl transition-all group ${
                active
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                  : 'text-gray-400 hover:bg-gray-900/80 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-violet-400' : 'group-hover:text-white'}`} />
              <span className={`hidden xl:block text-[15px] font-semibold ${active ? '' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Notifications */}
        {user && (
          <Link
            href="/notifications"
            className={`flex items-center gap-3.5 px-3 xl:px-4 py-3 rounded-xl transition-all group border ${
              pathname === '/notifications'
                ? 'bg-violet-600/15 text-violet-300 border-violet-500/20'
                : 'text-gray-400 hover:bg-gray-900/80 hover:text-white border-transparent'
            }`}
          >
            <div className="relative">
              <FiBell className={`w-5 h-5 shrink-0 ${pathname === '/notifications' ? 'text-violet-400' : 'group-hover:text-white'}`} />
            </div>
            <span className="hidden xl:block text-[15px] font-semibold">Notifications</span>
          </Link>
        )}

        {/* Profile */}
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={`flex items-center gap-3.5 px-3 xl:px-4 py-3 rounded-xl transition-all group border ${
              pathname?.startsWith(`/profile/${user.username}`)
                ? 'bg-violet-600/15 text-violet-300 border-violet-500/20'
                : 'text-gray-400 hover:bg-gray-900/80 hover:text-white border-transparent'
            }`}
          >
            <FiUser className={`w-5 h-5 shrink-0 ${pathname?.startsWith(`/profile/${user.username}`) ? 'text-violet-400' : 'group-hover:text-white'}`} />
            <span className="hidden xl:block text-[15px] font-semibold">Profile</span>
          </Link>
        )}
      </nav>

      {/* Post Button */}
      {user && (
        <div className="w-full px-2 xl:px-3 mt-4 mb-4">
          <Link
            href="/dashboard/prompts/new"
            className="w-12 h-12 xl:w-full xl:h-12 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white rounded-2xl flex items-center justify-center font-bold shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            <FiEdit3 className="w-5 h-5 xl:hidden" />
            <span className="hidden xl:flex items-center gap-2 text-[15px]">
              <FiEdit3 className="w-4 h-4" />
              New Prompt
            </span>
          </Link>
        </div>
      )}

      {!user && (
        <div className="w-full px-2 xl:px-3 mt-4 mb-4 space-y-2">
          <Link href="/" className="w-12 h-12 xl:w-full xl:h-11 bg-violet-600 hover:bg-violet-500 text-white rounded-xl flex items-center justify-center font-semibold transition text-sm">
            <FiUser className="w-5 h-5 xl:hidden" />
            <span className="hidden xl:block">Sign In</span>
          </Link>
        </div>
      )}

      {/* User Mini-Profile */}
      {user && (
        <div className="w-full px-2 xl:px-3 mt-auto relative group">
          <div className="flex items-center xl:justify-between p-2 xl:p-3 hover:bg-gray-900/60 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(user.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="hidden xl:block truncate max-w-[120px]">
                <p className="font-bold text-white text-sm truncate">{user.fullName || user.username}</p>
                <p className="text-gray-500 text-xs truncate">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Hover popover menu */}
          <div className="absolute bottom-full left-0 xl:left-2 mb-2 w-52 bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <Link href="/settings/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/60 text-gray-300 hover:text-white transition rounded-t-2xl text-sm">
              <FiSettings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition text-sm rounded-b-2xl border-t border-gray-800"
            >
              <FiLogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
