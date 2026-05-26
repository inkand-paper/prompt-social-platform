'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { NotificationBell } from '@/presentation/components/social/NotificationBell'
import {
  FiCompass,
  FiGrid,
  FiRss,
  FiBookmark,
  FiPlusCircle,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiZap,
} from 'react-icons/fi'

const NAV_LINKS = [
  { href: '/explore',   label: 'Explore',   icon: <FiCompass  className="w-4 h-4" /> },
  { href: '/feed',      label: 'Feed',       icon: <FiRss      className="w-4 h-4" /> },
  { href: '/dashboard', label: 'Dashboard',  icon: <FiGrid     className="w-4 h-4" /> },
  { href: '/saved',     label: 'Saved',      icon: <FiBookmark className="w-4 h-4" /> },
]

export function AppNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Hide nav on auth pages
  if (pathname?.startsWith('/auth')) return null

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname?.startsWith(href)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/feed"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                PromptSocial
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* New prompt button */}
                  <Link
                    href="/dashboard/prompts/new"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    <FiPlusCircle className="w-4 h-4" />
                    <span>New Prompt</span>
                  </Link>

                  {/* Notifications */}
                  <NotificationBell />

                  {/* User avatar dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(v => !v)}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition"
                    >
                      {(user.username?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
                    </button>

                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm font-medium text-white truncate">
                              @{user.username ?? 'user'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              href={`/profile/${user.username}`}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                            >
                              <FiUser className="w-4 h-4" />
                              My Profile
                            </Link>
                            <Link
                              href="/settings/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                            >
                              <FiGrid className="w-4 h-4" />
                              Settings
                            </Link>
                            <button
                              onClick={() => { logout(); setUserMenuOpen(false) }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition border-t border-gray-700 mt-1"
                            >
                              <FiLogOut className="w-4 h-4" />
                              Log Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-gray-400 hover:text-white transition"
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                    isActive(link.href)
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/dashboard/prompts/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-purple-300 hover:bg-purple-600/20 transition"
                >
                  <FiPlusCircle className="w-4 h-4" />
                  New Prompt
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
