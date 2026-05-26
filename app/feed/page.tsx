'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { FeedPost } from '@/presentation/components/social/FeedPost'
import { QuickPost } from '@/presentation/components/social/QuickPost'
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
  const observer = useRef<IntersectionObserver | null>(null)

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadFeed(false)
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    if (user) loadFeed(true)
    else if (!authLoading && feedType === 'trending') loadFeed(true)
  }, [user, authLoading, feedType])

  const loadFeed = async (reset: boolean = false) => {
    const currentOffset = reset ? 0 : offset
    setLoading(true)
    try {
      const response = await fetch(`/api/social/feed?type=${feedType}&limit=10&offset=${currentOffset}`)
      const data = await response.json()
      if (data.success) {
        const flatItems = (data.items || []).map((item: any) => item.prompt || item)
        if (reset) {
          setPosts(flatItems)
          setOffset(10)
        } else {
          setPosts(prev => [...prev, ...flatItems])
          setOffset(prev => prev + 10)
        }
        setHasMore(data.hasMore)
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
    <div className="w-full pb-20 lg:pb-0">
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

      {/* QuickPost box */}
      {user && <QuickPost onPostCreated={() => loadFeed(true)} />}

      {posts.length === 0 && !loading ? (
        <div className="p-8 text-center sm:py-20 px-6">
          {feedType === 'following' ? (
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-[2rem] bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                <FiUserPlus className="w-10 h-10 text-violet-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Your studio is quiet</h2>
              <p className="text-zinc-500 mb-10 leading-relaxed font-normal">Connect with the top prompt engineers to populate your feed or check what's trending globally.</p>
              <div className="flex flex-col gap-4">
                <Link href="/explore" className="btn-primary flex items-center justify-center gap-3 px-8 py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl">
                  <FiCompass className="w-5 h-5" /> DISCOVER CREATORS
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-20 text-zinc-600 flex flex-col items-center">
              <FiTrendingUp className="w-16 h-16 mb-6 text-zinc-900" />
              <p className="font-black text-white text-xl tracking-tight mb-2 uppercase tracking-widest">Global silence</p>
              <p className="text-sm">Be the first to break the void in trending.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div key={post.id} ref={lastPostRef}>
                  <FeedPost prompt={post} />
                </div>
              )
            } else {
              return <FeedPost key={post.id} prompt={post} />
            }
          })}
          
          {loading && (
            <div className="p-6 md:p-8 space-y-12">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl" />
                    <div className="h-3 w-40 bg-zinc-900 rounded-full" />
                  </div>
                  <div className="h-4 w-3/4 bg-zinc-900 rounded-full" />
                  <div className="h-32 bg-zinc-950 border border-white/[0.04] rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-16 bg-zinc-900 rounded-xl" />
                    <div className="h-8 w-16 bg-zinc-900 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
