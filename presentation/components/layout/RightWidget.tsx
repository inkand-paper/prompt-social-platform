'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiTrendingUp, FiZap, FiX } from 'react-icons/fi';

interface PopularTag { tag: string; count: number; }

export function RightWidget() {
  const router = useRouter();
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/test-version/social/tags')
      .then((res) => res.json())
      .then((data) => { if (data.success) setPopularTags(data.tags.slice(0, 6)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/explore?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 min-h-screen pt-5 pl-6 pr-4 sticky top-0 max-h-screen overflow-y-auto">
      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search prompts..."
          className="w-full bg-gray-900/70 border border-gray-700/50 rounded-2xl py-2.5 pl-10 pr-10 text-white text-sm focus:outline-none focus:border-violet-500 focus:bg-gray-900 transition-all placeholder-gray-600"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trending Tags */}
      <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4 mb-4">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <FiTrendingUp className="text-violet-400 w-4 h-4" />
          Trending Tags
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-1.5">
                <div className="h-2.5 w-16 bg-gray-800 rounded-full" />
                <div className="h-3.5 w-28 bg-gray-700/60 rounded-full" />
                <div className="h-2 w-20 bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : popularTags.length > 0 ? (
          <div className="space-y-1">
            {popularTags.map((t, i) => (
              <Link
                key={t.tag}
                href={`/explore?tag=${t.tag}`}
                className="flex items-center justify-between py-2.5 px-2 -mx-2 hover:bg-gray-800/50 rounded-xl transition group"
              >
                <div>
                  <p className="text-[11px] text-gray-600 mb-0.5 uppercase tracking-wider font-medium">#{i + 1} · Trending</p>
                  <p className="text-white font-bold text-sm tracking-tight group-hover:text-violet-300 transition">#{t.tag}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{t.count} prompts</p>
                </div>
                <FiZap className="w-3.5 h-3.5 text-violet-500/50 group-hover:text-violet-400 transition" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-3">No trending tags yet</p>
        )}
        <Link href="/explore" className="block text-center text-xs text-violet-400 hover:text-violet-300 transition mt-3 py-1.5 hover:bg-violet-500/10 rounded-lg">
          Show more →
        </Link>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4 mb-4">
        <h2 className="text-base font-bold text-white mb-3">Quick Actions</h2>
        <div className="space-y-1">
          {[
            { href: '/dashboard/prompts/new', label: '✨ Create a Prompt' },
            { href: '/explore?sort=trending', label: '🔥 Trending Prompts' },
            { href: '/explore?sort=newest', label: '🆕 Newest Prompts' },
            { href: '/explore?sort=most_saved', label: '⭐ Most Saved' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="block px-3 py-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition text-sm font-medium">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-gray-700 mt-2">
        <span className="hover:text-gray-500 cursor-pointer transition">Terms</span>
        <span className="hover:text-gray-500 cursor-pointer transition">Privacy</span>
        <span className="hover:text-gray-500 cursor-pointer transition">Cookies</span>
        <span>© 2026 PromptSocial</span>
      </div>
    </aside>
  );
}
