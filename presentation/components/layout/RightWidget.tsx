'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiSearch, FiTrendingUp, FiZap, FiX, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { toast } from 'sonner';

interface PopularTag { tag: string; count: number; }
interface SuggestedProfile { id: string; username: string; full_name: string | null; avatar_url: string | null; }

export function RightWidget() {
  const router = useRouter();
  const { user } = useAuth();
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedProfile[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/social/tags')
      .then((res) => res.json())
      .then((data) => { if (data.success) setPopularTags(data.tags.slice(0, 6)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/social/suggestions')
        .then(r => r.json())
        .then(d => { if (d.success) setSuggestions(d.profiles || []); })
        .catch(() => {});
    }
  }, [user]);

  const handleFollow = async (profileId: string, username: string) => {
    const isNowFollowing = !following.has(profileId);
    setFollowing(prev => {
      const next = new Set(prev);
      isNowFollowing ? next.add(profileId) : next.delete(profileId);
      return next;
    });
    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profileId, action: isNowFollowing ? 'follow' : 'unfollow' }),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setFollowing(prev => {
          const next = new Set(prev);
          isNowFollowing ? next.delete(profileId) : next.add(profileId);
          return next;
        });
        toast.error(data.error || 'Failed to follow');
      } else {
        toast.success(isNowFollowing ? `Following @${username}` : `Unfollowed @${username}`);
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

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

      {/* Who to Follow */}
      {user && suggestions.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4 mb-4">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <FiUserPlus className="text-violet-400 w-4 h-4" />
            Who to follow
          </h2>
          <div className="space-y-3">
            {suggestions.map((profile) => {
              const isFollowing = following.has(profile.id);
              return (
                <div key={profile.id} className="flex items-center gap-2.5 group">
                  <Link href={`/profile/${profile.username}`} className="shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {(profile.username?.[0] || 'U').toUpperCase()}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${profile.username}`} className="block">
                      <p className="text-white text-xs font-bold truncate group-hover:text-violet-300 transition">
                        {profile.full_name || profile.username}
                      </p>
                      <p className="text-gray-500 text-[10px] truncate">@{profile.username}</p>
                    </Link>
                  </div>
                  <button
                    onClick={() => handleFollow(profile.id, profile.username)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition ${
                      isFollowing
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-violet-600 text-white hover:bg-violet-500'
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1"><FiUserCheck className="w-3 h-3" /> Following</span>
                    ) : (
                      <span className="flex items-center gap-1"><FiUserPlus className="w-3 h-3" /> Follow</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <Link href="/explore" className="block text-center text-xs text-violet-400 hover:text-violet-300 transition mt-3 py-1.5 hover:bg-violet-500/10 rounded-lg">
            Find more people →
          </Link>
        </div>
      )}

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
