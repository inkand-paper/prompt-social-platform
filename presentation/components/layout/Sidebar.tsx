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
} from 'react-icons/fi';
import { NotificationBell } from '../social/NotificationBell';

const NAV_ITEMS = [
  { href: '/feed', label: 'Home', icon: <FiHome className="w-6 h-6" /> },
  { href: '/explore', label: 'Explore', icon: <FiCompass className="w-6 h-6" /> },
  { href: '/saved', label: 'Bookmarks', icon: <FiBookmark className="w-6 h-6" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-20 xl:w-64 flex flex-col items-center xl:items-start pt-4 pb-6 border-r border-gray-800 bg-black/90 backdrop-blur-md z-40 transition-all">
      {/* Logo */}
      <Link
        href="/feed"
        className="flex items-center gap-3 px-3 mb-8 hover:opacity-80 transition"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <FiZap className="w-5 h-5 text-white" />
        </div>
        <span className="hidden xl:block text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          PromptSocial
        </span>
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 w-full px-2 xl:px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 xl:px-4 py-3 rounded-full transition-all group ${
                active
                  ? 'font-bold'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <div className="relative">
                {active && (
                  <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full -z-10" />
                )}
                <span className={active ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
                  {item.icon}
                </span>
              </div>
              <span className={`hidden xl:block text-lg ${active ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Notifications (Special Case embedded in nav) */}
        {user && (
          <div className="flex items-center gap-4 px-3 xl:px-4 py-3 rounded-full text-gray-300 hover:bg-gray-900 hover:text-white transition-all cursor-pointer">
            <NotificationBell />
            <span className="hidden xl:block text-lg">Notifications</span>
          </div>
        )}

        {/* Profile */}
        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={`flex items-center gap-4 px-3 xl:px-4 py-3 rounded-full transition-all group ${
              pathname?.startsWith(`/profile/${user.username}`)
                ? 'font-bold'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <FiUser className={`w-6 h-6 ${pathname?.startsWith(`/profile/${user.username}`) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            <span className={`hidden xl:block text-lg ${pathname?.startsWith(`/profile/${user.username}`) ? 'text-white' : ''}`}>
              Profile
            </span>
          </Link>
        )}
      </nav>

      {/* New Post Button */}
      {user ? (
        <div className="w-full px-2 xl:px-4 mt-6">
          <Link
            href="/dashboard/prompts/new"
            className="w-12 h-12 xl:w-full xl:h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            <FiEdit3 className="w-6 h-6 xl:hidden" />
            <span className="hidden xl:block">Post Prompt</span>
          </Link>
        </div>
      ) : (
        <div className="w-full px-2 xl:px-4 mt-6 space-y-2">
          <Link
            href="/auth/login"
            className="w-12 h-12 xl:w-full xl:h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold shadow hover:bg-gray-700 transition"
          >
            <span className="hidden xl:block">Log In</span>
            <FiUser className="w-6 h-6 xl:hidden" />
          </Link>
        </div>
      )}

      {/* User Mini-Profile */}
      {user && (
        <div className="w-full px-2 xl:px-4 mt-auto mb-4 relative group">
          <div className="flex items-center xl:justify-between p-2 xl:p-3 bg-transparent hover:bg-gray-900 rounded-full cursor-pointer transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                {(user.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="hidden xl:block truncate max-w-[120px]">
                <p className="font-bold text-white text-sm truncate">{user.fullName || user.username}</p>
                <p className="text-gray-500 text-sm truncate">@{user.username}</p>
              </div>
            </div>
            {/* Popover overlay trigger icon could go here */}
          </div>
          
          {/* Hover Menu */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 xl:left-4 xl:translate-x-0 mb-2 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <Link href="/settings/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white transition rounded-t-2xl">
              <FiSettings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 transition"
            >
              <FiLogOut className="w-4 h-4" />
              Log Out
            </button>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-gray-300 hover:text-white transition rounded-b-2xl border-t border-gray-800">
               Dashboard
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
