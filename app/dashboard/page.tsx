'use client'

import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import Link from 'next/link'
import { 
  FiFileText, 
  FiEdit3, 
  FiUsers, 
  FiSettings, 
  FiTrendingUp, 
  FiHeart, 
  FiBookmark, 
  FiBell,
  FiCompass,
  FiZap
} from 'react-icons/fi'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const profile = (user as any)?.profile || user
  const { getUserStats } = usePrompts()
  const [promptStats, setPromptStats] = useState({ total: 0, published: 0, drafts: 0, totalViews: 0, totalLikes: 0 })
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadStats()
      loadFollowStats()
      loadSavedCount()
    }
  }, [user])

  const loadStats = async () => {
    const result = await getUserStats(user?.id || '')
    if (result.success && result.data) {
      setPromptStats(result.data as any)
    }
  }

  const loadFollowStats = async () => {
    try {
      const response = await fetch(`/api/social/follow-stats?userId=${user?.id}`)
      const data = await response.json()
      if (data.success) setFollowStats({ followers: data.followers, following: data.following })
    } catch (error) {
      console.error('Failed to load follow stats:', error)
    }
  }

  const loadSavedCount = async () => {
    try {
      const response = await fetch('/api/social/saved?limit=1&offset=0')
      const data = await response.json()
      if (data.success) setSavedCount(data.total || 0)
    } catch (error) {
      console.error('Failed to load saved count:', error)
    }
  }

  if (!user) return null

  const stats = [
    { label: 'Total Prompts', value: promptStats.total, icon: FiFileText },
    { label: 'Total Views', value: promptStats.totalViews, icon: FiTrendingUp },
    { label: 'Likes Received', value: promptStats.totalLikes, icon: FiHeart },
    { label: 'Saved by others', value: savedCount, icon: FiBookmark },
    { label: 'Followers', value: followStats.followers, icon: FiUsers },
    { label: 'Following', value: followStats.following, icon: FiZap },
  ]

  const quickActions = [
    { title: 'Create Prompt', description: 'Share a new AI masterpiece', href: '/dashboard/prompts/new', icon: FiEdit3 },
    { title: 'My Prompts', description: 'Manage and iterate your collection', href: '/dashboard/prompts', icon: FiFileText },
    { title: 'Saved', description: 'Your curated library of inspiration', href: '/saved', icon: FiBookmark },
    { title: 'Feed', description: 'Deep dive into community prompts', href: '/feed', icon: FiCompass },
    { title: 'Notifications', description: 'Engagement and network activity', href: '/notifications', icon: FiBell },
    { title: 'Settings', description: 'Account and studio preferences', href: '/settings/profile', icon: FiSettings },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-2">
            Creator Dashboard
          </h1>
          <p className="text-zinc-500 font-normal">
            Welcome back, <span className="text-white font-bold">{profile?.fullName || user.username}</span>. Your studio is ready.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="surface-card rounded-2xl p-5 hover-glow group transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-600 transition-colors">
                  <Icon className="w-5 h-5 text-violet-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-3 mb-8">
           <div className="h-px flex-1 bg-white/[0.06]" />
           <h2 className="text-sm font-black uppercase tracking-widest text-zinc-600">Quick Actions</h2>
           <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href} className="surface-card rounded-3xl p-8 hover-glow group flex items-start gap-6 transition-all active:scale-[0.98]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-violet-500/20 transition-all">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-1 group-hover:text-violet-400 transition-colors tracking-tight">{action.title}</h3>
                  <p className="text-zinc-500 text-sm font-normal leading-relaxed">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}