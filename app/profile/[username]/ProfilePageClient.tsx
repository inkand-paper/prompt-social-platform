'use client'

import { useState, useEffect } from 'react'
import { FiMapPin, FiBriefcase, FiLink, FiHeart, FiUsers, FiGrid, FiZap, FiSettings, FiBookmark } from 'react-icons/fi'
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { FollowButton } from '@/presentation/components/social/FollowButton'
import { useAuth } from '@/presentation/hooks/useAuth'
import Link from 'next/link'

interface ProfilePageClientProps {
  profile: any
  promptsCount: number
  initialFollowersCount: number
  initialFollowingCount: number
}

export default function ProfilePageClient({ profile, promptsCount, initialFollowersCount, initialFollowingCount }: ProfilePageClientProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'prompts' | 'likes'>('prompts')
  const [userPrompts, setUserPrompts] = useState<any[]>([])
  const { getUserPrompts, loading } = usePrompts()
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)

  const isOwnProfile = user?.id === profile.id

  useEffect(() => {
    if (profile && activeTab === 'prompts') {
      loadUserPrompts()
    }
  }, [profile, activeTab])

  const loadUserPrompts = async () => {
    if (!profile) return
    const result = await getUserPrompts(profile.id)
    if (result.success && 'data' in result && result.data) {
      const publishedOnly = result.data.prompts.filter((p: any) => !p.isDraft && p.visibility === 'public')
      setUserPrompts(publishedOnly)
    }
  }

  // Generate a unique gradient for the banner based on username
  const getBannerGradient = (username: string) => {
    const gradients = [
      'from-violet-900 to-pink-900',
      'from-indigo-900 to-violet-900',
      'from-fuchsia-900 to-purple-900',
      'from-pink-900 to-rose-900',
      'from-zinc-900 to-zinc-950',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const getGradient = (id: string) => {
    const gradients = ['from-violet-900/40 to-black', 'from-pink-900/40 to-black', 'from-indigo-900/40 to-black'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="w-full min-h-screen bg-black font-inter">
      {/* Banner */}
      <div className={`h-48 md:h-64 bg-gradient-to-r ${getBannerGradient(profile.username)} relative border-b border-white/[0.06]`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Profile Info Overlay Row */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-8 gap-6 px-2">
          {/* Avatar: Rounded-XL per spec */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-950 border-[6px] border-black flex items-center justify-center shadow-2xl relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-pink-500 opacity-20" />
             <span className="text-white font-black text-5xl relative">
               {(profile.username?.[0] || 'U').toUpperCase()}
             </span>
          </div>

          <div className="flex gap-3">
            {isOwnProfile ? (
              <Link 
                href="/settings/profile" 
                className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <FiSettings /> Studio Settings
              </Link>
            ) : (
              <FollowButton 
                userId={profile.id} 
                initialFollowing={false} 
                onFollowChange={(f) => setFollowersCount(prev => f ? prev+1 : prev-1)} 
              />
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="mb-10 px-2">
          <h1 className="text-3xl font-black text-white leading-none tracking-tight mb-2">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-zinc-500 font-bold text-lg mb-6 tracking-tight">@{profile.username}</p>
          
          {profile.bio && (
            <p className="text-zinc-300 text-lg leading-relaxed max-w-2xl mb-8">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8">
            <div className="flex items-center gap-2 text-sm">
               <span className="text-white font-black">{promptsCount}</span>
               <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold">Prompts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
               <span className="text-white font-black">{followersCount}</span>
               <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold">Followers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
               <span className="text-white font-black">{initialFollowingCount}</span>
               <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold">Following</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
            {profile.location && <span className="flex items-center gap-1.5"><FiMapPin /> {profile.location}</span>}
            {profile.occupation && <span className="flex items-center gap-1.5"><FiBriefcase /> {profile.occupation}</span>}
            {profile.website && (
              <a href={profile.website} target="_blank" className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors">
                <FiLink /> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] mb-8 relative">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'prompts' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <FiGrid className="w-3.5 h-3.5" /> studio_prompts
            {activeTab === 'prompts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]" />}
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'likes' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <FiHeart className="w-3.5 h-3.5" /> collected_likes
            {activeTab === 'likes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pb-32 px-2">
          {activeTab === 'prompts' ? (
            loading ? (
              <div className="masonry-grid gap-6 space-y-6">
                {[...Array(6)].map((_, i) => <div key={i} className="surface-card h-48 rounded-3xl animate-pulse" />)}
              </div>
            ) : userPrompts.length === 0 ? (
              <div className="surface-card rounded-3xl p-20 text-center border-dashed border-zinc-900 bg-transparent">
                 <FiZap className="w-12 h-12 text-zinc-900 mx-auto mb-6" />
                 <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">No artifacts published yet</p>
              </div>
            ) : (
              <div className="masonry-grid gap-6 space-y-6">
                {userPrompts.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/prompts/${p.id}`}
                    className="break-inside-avoid block group rounded-3xl overflow-hidden surface-card hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-500 hover:-translate-y-2 py-6 px-1"
                  >
                    <div className={`h-28 bg-gradient-to-br ${getGradient(p.id)} rounded-2xl mx-4 mb-5 p-5 flex flex-col justify-center`}>
                       <p className="text-white/60 font-mono text-[10px] line-clamp-3 leading-relaxed mb-4">{p.promptText}</p>
                       <p className="text-white font-bold text-sm tracking-tight truncate">{p.title}</p>
                    </div>
                    <div className="px-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-600">
                       <span className="flex items-center gap-1.5"><FiHeart /> {p.likeCount}</span>
                       <span className="flex items-center gap-1.5"><FiBookmark /> {p.saveCount}</span>
                       <span className="text-[10px] font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
             <div className="surface-card rounded-3xl p-20 text-center border-dashed border-zinc-900 bg-transparent">
                <FiHeart className="w-12 h-12 text-zinc-900 mx-auto mb-6" />
                <p className="text-zinc-600 font-black uppercase tracking-widest text-sm">Collective coming soon</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}