'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiTrendingUp } from 'react-icons/fi';

interface PopularTag {
  tag: string;
  count: number;
}

export function RightWidget() {
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/test-version/social/tags')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPopularTags(data.tags.slice(0, 5));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="hidden lg:block w-80 min-h-screen pt-4 pl-8 border-l border-gray-800 sticky top-0">
      {/* Search Bar */}
      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="w-full bg-gray-900 border border-gray-700/50 rounded-full py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && search.trim()) {
               window.location.href = `/explore?q=${encodeURIComponent(search)}`;
            }
          }}
        />
      </div>

      {/* Trending Tags Widget */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-purple-400" /> What&apos;s happening
        </h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="h-3 w-12 bg-gray-800 rounded" />
                <div className="h-4 w-24 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : popularTags.length > 0 ? (
          <div className="flex flex-col">
            {popularTags.map((t) => (
              <Link
                key={t.tag}
                href={`/explore?tag=${t.tag}`}
                className="py-3 hover:bg-gray-800/50 px-2 -mx-2 rounded-xl transition"
              >
                <div className="text-xs text-gray-500 mb-0.5">Trending</div>
                <div className="text-white font-bold tracking-tight">#{t.tag}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t.count} Prompts</div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No trending tags yet.</p>
        )}
      </div>

      {/* Who to follow placeholder */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
        <h2 className="text-lg font-bold text-white mb-4">Who to follow</h2>
        <div className="py-2 text-sm text-gray-500 text-center">
          Suggestions coming soon
        </div>
      </div>
      
      {/* Footer links */}
      <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 px-2 text-xs text-gray-500">
        <Link href="#" className="hover:underline">Terms of Service</Link>
        <Link href="#" className="hover:underline">Privacy Policy</Link>
        <Link href="#" className="hover:underline">Cookie Policy</Link>
        <span>© 2026 PromptSocial</span>
      </div>
    </aside>
  );
}
