'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { FeedPost } from '@/presentation/components/social/FeedPost'
import { PromptResponseDTO } from '@/application/dto/PromptDTO'
import Link from 'next/link'
import { FiCompass, FiTrendingUp, FiUserPlus } from 'react-icons/fi'

type FeedType = 'following' | 'trending'

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth()
  const [feedType, setFeedType] = useState<FeedType>('following')
  const [posts, setPosts] = useState<PromptResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (user) loadFeed(true)
  }, [user, feedType])

  const loadFeed = async (reset: boolean = false) => {
    const currentOffset = reset ? 0 : offset
    setLoading(true)
    try {
      const response = await fetch(`/api/social/feed?type=${feedType}&limit=10&offset=${currentOffset}`)
      const data = await response.json()
      if (data.success) {
        const flatItems = (data.items || []).map((item: any) => item.prompt || item)
        if (reset) setPosts(flatItems)
        else setPosts(prev => [...prev, ...flatItems])
        setHasMore(data.hasMore)
        setOffset(reset ? 10 : currentOffset + 10)
      }
    } catch (error) {
      console.error('Failed to load feed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="w-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">Home</h1>
        </div>
        <div className="flex">
          {(['following', 'trending'] as FeedType[]).map(type => (
            <button
              key={type}
              onClick={() => setFeedType(type)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition border-b-2 ${feedType === type ? 'text-white border-violet-500' : 'text-gray-500 border-transparent hover:bg-gray-900/50 hover:text-gray-300'}`}
            >
              {type === 'trending' ? <FiTrendingUp className="w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 && !loading ? (
        <div className="p-8 text-center">
          {feedType === 'following' ? (
            <div className="max-w-sm mx-auto pt-12">
              <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                <FiUserPlus className="w-10 h-10 text-violet-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Welcome to your feed</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">Follow people to see their prompts here. Discover amazing creators in the Explore section.</p>
              <div className="flex flex-col gap-3">
                <Link href="/explore" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition">
                  <FiCompass className="w-5 h-5" /> Explore prompts
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-12 text-gray-500">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <p className="font-bold text-white mb-1">No trending posts yet</p>
              <p>Be the first to publish a prompt!</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {posts.map(post => <FeedPost key={post.id} prompt={post} />)}
          {loading && (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && hasMore && posts.length > 0 && (
            <div className="flex justify-center p-6">
              <button onClick={() => loadFeed(false)} className="px-8 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-full hover:bg-gray-800 transition text-sm font-bold">
                Show more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
