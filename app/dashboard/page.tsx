'use client'

import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import Link from 'next/link'
import { FiFileText, FiEdit, FiUsers, FiSettings, FiClock, FiTrendingUp, FiHeart, FiBookmark } from 'react-icons/fi'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const profile = (user as any)?.profile || user;
  const { getUserStats } = usePrompts()
  const [promptStats, setPromptStats] = useState({ total: 0, published: 0, drafts: 0, totalViews: 0 })
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
  const [likesReceived, setLikesReceived] = useState(0)

  useEffect(() => {
    if (user) {
      loadStats()
      loadFollowStats()
    }
  }, [user])

  const loadStats = async () => {
    setPromptStats({ total: 0, published: 0, drafts: 0, totalViews: 0 })
    const result = await getUserStats(user?.id || '')
    if (result.success && result.data) {
      setPromptStats(result.data)
    }
  }

  const loadFollowStats = async () => {
    try {
      const response = await fetch(`/api/social/follow-stats?userId=${user?.id}`)
      const data = await response.json()
      if (data.success) {
        setFollowStats({ followers: data.followers, following: data.following })
      }
    } catch (error) {
      console.error('Failed to load follow stats:', error)
    }
  }

  if (!user) {
    return null
  }

  const stats = [
    { label: 'Total Prompts', value: promptStats.total.toString(), icon: FiFileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Views', value: promptStats.totalViews.toString(), icon: FiTrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Drafts', value: promptStats.drafts.toString(), icon: FiClock, color: 'from-yellow-500 to-orange-500' },
    { label: 'Followers', value: followStats.followers.toString(), icon: FiUsers, color: 'from-purple-500 to-pink-500' },
    { label: 'Likes Received', value: likesReceived.toString(), icon: FiHeart, color: 'from-red-500 to-rose-500' },
    { label: 'Saved', value: '0', icon: FiBookmark, color: 'from-indigo-500 to-purple-500' },
  ]

  const quickActions = [
    { title: 'Create New Prompt', description: 'Share your AI prompt with the world', href: '/dashboard/prompts/new', icon: FiEdit, color: 'bg-purple-600' },
    { title: 'View My Prompts', description: 'Manage and organize your prompts', href: '/dashboard/prompts', icon: FiFileText, color: 'bg-blue-600' },
    { title: 'Saved Prompts', description: 'View your saved collection', href: '/saved', icon: FiBookmark, color: 'bg-green-600' },
    { title: 'Feed', description: 'See what others are sharing', href: '/feed', icon: FiUsers, color: 'bg-orange-600' },
    { title: 'Notifications', description: 'Stay updated', href: '/notifications', icon: FiHeart, color: 'bg-pink-600' },
    { title: 'Profile Settings', description: 'Update your profile information', href: '/settings/profile', icon: FiSettings, color: 'bg-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 mb-8 border border-purple-500/20">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.fullName || user.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your prompts, track performance, and engage with the community.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition"
              >
                <div className={`bg-gradient-to-r ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition group"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                <p className="text-gray-400 text-sm">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}