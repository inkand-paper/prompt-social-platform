'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/presentation/components/auth/LoginForm'
import { SignupForm } from '@/presentation/components/auth/SignupForm'
import { Toaster } from 'sonner'
import { FiZap, FiSearch, FiTrendingUp } from 'react-icons/fi'
import Link from 'next/link'

export default function Home() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/social/search?sort=trending&limit=6')
      .then(r => r.json())
      .then(d => { if (d.success) setFeaturedPrompts(d.items) })
      .catch(() => {})
  }, [])

  const handleAuthSuccess = () => {
    window.location.href = '/feed'
  }

  // Generate a random gradient based on an ID or string
  const getGradient = (id: string) => {
    const gradients = [
      'from-violet-900/60 to-pink-900/60',
      'from-purple-900/60 to-indigo-900/60',
      'from-pink-900/60 to-rose-900/60',
      'from-blue-900/60 to-violet-900/60',
      'from-fuchsia-900/60 to-purple-900/60',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 font-inter">
      <Toaster position="top-center" richColors />

      <main className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section: Hero + Discovery (60%) */}
        <div className="flex-1 pt-12 lg:pt-24 pb-16 px-6 lg:px-16 xl:px-24 overflow-y-auto">
          {/* Logo (Floating for landing) */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent tracking-tighter">
              PromptSocial
            </span>
          </div>

          {/* Hero */}
          <div className="max-w-3xl mb-16 px-2">
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8">
              Discover AI prompts<br />
              <span className="text-zinc-600">that actually work.</span>
            </h1>
            <p className="text-lg lg:text-xl text-zinc-400 font-normal leading-relaxed mb-10 max-w-xl">
              The creative studio for prompt engineers. Share, discover, and remix high-performance prompts in a visual-first environment.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href="/explore" 
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(124,58,237,0.3)] text-lg"
              >
                Explore Feed
              </Link>
              <button 
                onClick={() => {
                  setMode('signup');
                  document.getElementById('auth-panel')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Masonry Grid */}
          <div className="mb-12 px-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Trending</h2>
            </div>
            
            <div className="columns-2 lg:columns-3 gap-4 space-y-4">
              {featuredPrompts.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/prompts/${p.id}`}
                  className="break-inside-avoid block group relative rounded-3xl overflow-hidden border border-white/[0.06] bg-zinc-950 transition-all hover:border-violet-500/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  {/* Generated Visual Swatch */}
                  <div className={`aspect-[4/3] bg-gradient-to-br ${getGradient(p.id)} flex items-center justify-center p-6 relative overflow-hidden transition-all group-hover:scale-105`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl">
                      <FiZap className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Hover Overlay (Pinterest Style) */}
                  <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-6 backdrop-blur-sm">
                    <p className="text-zinc-300 font-mono text-[11px] leading-relaxed line-clamp-[12]">
                      {p.promptText}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                       <span className="text-xs font-bold text-violet-400">Remix Prompt →</span>
                       <FiTrendingUp className="w-4 h-4 text-zinc-600" />
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="p-5 border-t border-white/[0.06]">
                    <p className="text-white text-sm font-bold truncate mb-1">{p.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-xs font-medium">@{p.user?.username || 'anonymous'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Auth Card (40%) */}
        <div id="auth-panel" className="lg:w-[440px] shrink-0 bg-zinc-950/50 border-l border-white/[0.06] flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden">
          {/* Subtle noise/gradient background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 blur-[120px] -z-10" />

          <div className="w-full max-w-sm glass-card rounded-3xl p-8 lg:p-10 shadow-2xl">
            <div className="mb-10 text-center">
              <h3 className="text-2xl font-black text-white mb-2">Welcome Back</h3>
              <p className="text-zinc-500 text-sm">Join the next generation of prompt engineers.</p>
            </div>

            <div className="mb-8">
              <div className="flex p-1 bg-white/5 rounded-2xl">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                    mode === 'login' 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  LOG IN
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                    mode === 'signup' 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  SIGN UP
                </button>
              </div>
            </div>

            {mode === 'login' ? (
              <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignupForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setMode('login')} />
            )}
          </div>

          <p className="mt-12 text-zinc-600 text-xs font-medium tracking-tight">
            PROMPTSOCIAL © 2026 • DARK HACKER STUDIO v1.0
          </p>
        </div>
      </main>
    </div>
  )
}
