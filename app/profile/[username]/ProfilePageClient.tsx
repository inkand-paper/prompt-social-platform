'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiMapPin, FiBriefcase, FiLink, FiGithub, FiTwitter, FiLinkedin, FiFileText, FiHeart, FiUsers, FiMessageCircle } from 'react-icons/fi'
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { FollowButton } from '@/presentation/components/social/FollowButton'
import { useAuth } from '@/presentation/hooks/useAuth'

interface ProfilePageClientProps {
  profile: any
  promptsCount: number
  initialFollowersCount: number
  initialFollowingCount: number  // ← ADD THIS
}

export default function ProfilePageClient({ profile, promptsCount, initialFollowersCount,  initialFollowingCount }: ProfilePageClientProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'prompts' | 'likes'>('prompts')
  const [userPrompts, setUserPrompts] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const { getUserPrompts, loading } = usePrompts()
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [followingCount, setFollowingCount] = useState(initialFollowingCount)

  useEffect(() => {
    if (profile && activeTab === 'prompts') {
      loadUserPrompts()
    }
  }, [profile, activeTab])

  useEffect(() => {
    if (user && user.id !== profile.id) {
      checkFollowStatus()
    }
  }, [profile, user])

  const loadUserPrompts = async () => {
    if (!profile) return
    const result = await getUserPrompts(profile.id)
    if (result.success && 'data' in result && result.data) {
      const publishedOnly = result.data.prompts.filter((p: any) => !p.isDraft && p.visibility === 'public')
      setUserPrompts(publishedOnly)
    }
  }

  const checkFollowStatus = async () => {
    if (!user || user.id === profile.id) return
    try {
      const response = await fetch(`/api/social/check-follow?userId=${profile.id}`)
      const data = await response.json()
      if (data.success) {
        setIsFollowing(data.following)
      }
    } catch (error) {
      console.error('Failed to check follow status:', error)
    }
  }

  const socialLinks = [
    { name: 'GitHub', url: profile.github_url, icon: FaGithub, color: 'hover:text-gray-300' },
    { name: 'Twitter', url: profile.twitter_url, icon: FaTwitter, color: 'hover:text-blue-400' },
    { name: 'LinkedIn', url: profile.linkedin_url, icon: FaLinkedin, color: 'hover:text-blue-600' },
    { name: 'Website', url: profile.website, icon: FiLink, color: 'hover:text-purple-400' },
  ].filter(link => link.url)

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="w-full relative">
      {/* Profile Header (Banner & Avatar) */}
      <div className="relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-purple-900 via-purple-700 to-pink-800 w-full" />
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white font-bold text-sm">
           Profile
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar & Follow Button Row */}
        <div className="flex justify-between items-end -mt-12 md:-mt-16 mb-4">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-black bg-gradient-to-r from-purple-500 to-pink-500">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                {profile.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            {isOwnProfile ? (
              <Link href="/settings/profile" className="px-4 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white rounded-full font-bold transition">
                Edit Profile
              </Link>
            ) : (
              <FollowButton 
                userId={profile.id} 
                initialFollowing={isFollowing}
                onFollowChange={(following) => {
                  setIsFollowing(following)
                  setFollowersCount(prev => following ? prev + 1 : prev - 1)
                }}
              />
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-gray-500">@{profile.username}</p>
        </div>

        {profile.bio && (
          <p className="text-white text-sm md:text-base leading-snug mb-3">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
          {profile.location && (
             <span className="flex items-center gap-1"><FiMapPin /> {profile.location}</span>
          )}
          {profile.occupation && (
             <span className="flex items-center gap-1"><FiBriefcase /> {profile.occupation}</span>
          )}
          {profile.website && (
             <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:underline">
               <FiLink /> {profile.website.replace(/^https?:\/\//, '')}
             </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm mb-4">
           <Link href={`/profile/${profile.username}/following`} className="hover:underline">
             <span className="text-white font-bold">{followingCount}</span> <span className="text-gray-500">Following</span>
           </Link>
           <Link href={`/profile/${profile.username}/followers`} className="hover:underline">
             <span className="text-white font-bold">{followersCount}</span> <span className="text-gray-500">Followers</span>
           </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 font-bold text-sm bg-black">
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex-1 py-4 text-center transition hover:bg-gray-900/50 ${
            activeTab === 'prompts' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'
          }`}
        >
          Prompts ({promptsCount})
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-4 text-center transition hover:bg-gray-900/50 ${
            activeTab === 'likes' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'
          }`}
        >
          Likes
        </button>
      </div>

      {/* Main content feed */}
      <div className="flex flex-col pb-20">
        {activeTab === 'prompts' ? (
          loading ? (
            <div className="flex justify-center p-8">
               <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userPrompts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
               <p className="font-bold text-white text-lg mb-2">No prompts here</p>
               <p>This user hasn't published any prompts yet.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 px-4 pt-4">
              {userPrompts.map((prompt: any) => (
                <Link 
                  key={prompt.id} 
                  href={`/dashboard/prompts/${prompt.id}`}
                  className="block bg-gray-900/30 hover:bg-gray-900/60 transition p-4 border border-gray-800 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-white font-bold">{prompt.title}</h3>
                     <span className="text-xs text-gray-500">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  </div>
                  {prompt.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{prompt.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><FiMessageCircle className="w-4 h-4" /> {prompt.viewCount || 0}</span>
                    <span className="flex items-center gap-1.5"><FiHeart className="w-4 h-4" /> {prompt.likeCount || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="p-8 text-center text-gray-500">
             <p className="font-bold text-white text-lg mb-2">Coming Soon</p>
             <p>Liked prompts view is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}