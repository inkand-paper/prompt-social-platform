'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/presentation/components/auth/LoginForm'
import { SignupForm } from '@/presentation/components/auth/SignupForm'
import { Toaster } from 'sonner'
import { FiZap, FiSearch, FiTrendingUp, FiBookmark, FiUsers } from 'react-icons/fi'
import Link from 'next/link'

export default function Home() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/test-version/social/search?sort=trending&limit=6')
      .then(r => r.json())
      .then(d => { if (d.success) setFeaturedPrompts(d.items) })
      .catch(() => {})
  }, [])

  const handleAuthSuccess = () => {
    window.location.href = '/feed'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <FiZap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tight">PromptSocial</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('login')} className="text-gray-400 hover:text-white text-sm font-medium transition px-4 py-2">Log in</button>
          <button onClick={() => setMode('signup')} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition">Sign up free</button>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* Left: Hero + Featured */}
        <div className="flex-1 pt-24 pb-16 px-8 lg:px-16 xl:px-24 overflow-auto">
          {/* Hero */}
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
              <FiZap className="w-4 h-4" />
              The AI Prompt Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-none tracking-tight mb-6">
              Discover &<br />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                share the best
              </span><br />
              AI prompts
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              A visual platform to discover, save, and share AI prompts. Browse thousands of prompts from the community — hover to preview, click to use.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={() => setMode('signup')} className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(139,92,246,0.4)] text-lg">
                Start discovering →
              </button>
              <Link href="/explore" className="px-8 py-4 bg-gray-900 border border-gray-700 text-white font-bold rounded-2xl hover:bg-gray-800 transition text-lg flex items-center gap-2">
                <FiSearch className="w-5 h-5" /> Browse prompts
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mb-12 flex-wrap">
            {[
              { icon: FiUsers, label: 'Active creators', value: '10K+' },
              { icon: FiZap, label: 'Prompts shared', value: '50K+' },
              { icon: FiBookmark, label: 'Prompts saved daily', value: '5K+' },
              { icon: FiTrendingUp, label: 'AI models supported', value: '20+' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Prompts Pinterest Grid */}
          {featuredPrompts.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-violet-400" /> Trending right now
              </h2>
              <div className="columns-2 md:columns-3 gap-3 space-y-3">
                {featuredPrompts.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/prompts/${p.id}`}
                    className="break-inside-avoid block group relative rounded-2xl overflow-hidden border border-gray-800/60 bg-gray-900/60 hover:border-violet-500/40 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)]"
                  >
                    {/* Gradient preview image */}
                    <div className={`h-28 bg-gradient-to-br ${
                      ['from-violet-900 to-pink-900', 'from-blue-900 to-violet-900', 'from-pink-900 to-orange-900', 'from-green-900 to-teal-900', 'from-orange-900 to-red-900', 'from-teal-900 to-blue-900'][Math.floor(Math.random() * 6)]
                    } flex items-center justify-center p-4 relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,white,transparent_60%)]" />
                      <p className="text-white/80 text-xs font-mono line-clamp-3 text-center leading-relaxed z-10 relative">
                        {p.promptText?.substring(0, 80)}...
                      </p>
                    </div>
                    {/* Hover overlay with prompt text */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <p className="text-white text-xs font-mono line-clamp-6 text-center leading-relaxed">
                        {p.promptText?.substring(0, 150)}
                        {p.promptText?.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    <div className="p-3">
                      <p className="text-white text-xs font-bold line-clamp-1">{p.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">@{p.user?.username || 'anonymous'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Auth panel */}
        <div className="hidden lg:flex w-[440px] shrink-0 pt-24 pb-8 px-8 border-l border-gray-800/60 flex-col justify-center">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/60">
            <div className="mb-6">
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 text-sm font-bold transition ${mode === 'login' ? 'text-white border-b-2 border-violet-500 -mb-px' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-3 text-sm font-bold transition ${mode === 'signup' ? 'text-white border-b-2 border-violet-500 -mb-px' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sign up
                </button>
              </div>
            </div>
            {mode === 'login' ? (
              <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignupForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Auth */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-gray-800 flex gap-3">
        <button onClick={() => setMode('login')} className="flex-1 py-3 bg-gray-900 border border-gray-700 text-white font-bold rounded-xl">Log in</button>
        <button onClick={() => setMode('signup')} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl">Sign up</button>
      </div>
    </div>
  )
}
