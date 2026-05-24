'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FeedPost } from '@/presentation/components/social/FeedPost'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useSocial } from '@/presentation/hooks/useSocial'
import { FiSearch, FiTrendingUp, FiClock, FiBookmark, FiX, FiZap } from 'react-icons/fi'

// ── Types ──────────────────────────────────────────────────────────────────────
interface ExplorePrompt {
  id: string
  title: string
  description: string | null
  promptText: string
  likeCount: number
  saveCount: number
  viewCount: number
  tags: string[]
  createdAt: string
  userId: string
  username?: string
  userAvatar?: string | null
}

type SortOption = 'newest' | 'trending' | 'most_saved'

const SORT_OPTIONS: { label: string; value: SortOption; icon: React.ReactNode }[] = [
  { label: 'Newest', value: 'newest', icon: <FiClock className="w-4 h-4" /> },
  { label: 'Trending', value: 'trending', icon: <FiTrendingUp className="w-4 h-4" /> },
  { label: 'Most Saved', value: 'most_saved', icon: <FiBookmark className="w-4 h-4" /> },
]

function ExploreInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toggleLike, toggleSave } = useSocial()

  const initialQuery = searchParams.get('q') || ''
  const initialTag = searchParams.get('tag') || ''
  const initialSort = (searchParams.get('sort') as SortOption) || 'newest'

  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeTag, setActiveTag] = useState(initialTag)
  const [sort, setSort] = useState<SortOption>(initialSort)
  const [prompts, setPrompts] = useState<ExplorePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [query])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (activeTag) params.set('tag', activeTag)
    if (sort !== 'newest') params.set('sort', sort)
    router.replace(`/explore?${params.toString()}`, { scroll: false })
  }, [debouncedQuery, activeTag, sort])

  // Search whenever filters change
  const fetchPrompts = useCallback(
    async (reset: boolean) => {
      setLoading(true)
      const currentOffset = reset ? 0 : offset
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          tag: activeTag,
          sort,
          limit: '10',
          offset: String(currentOffset),
        })
        const res = await fetch(`/api/test-version/social/search?${params}`)
        const data = await res.json()
        if (data.success) {
          // Map user to match FeedPost expectations
          const items = data.items.map((item: any) => ({
            ...item,
            username: item.user?.username,
            userAvatar: item.user?.avatarUrl
          }))
          
          setPrompts(prev => (reset ? items : [...prev, ...items]))
          setHasMore(data.hasMore)
          if (!reset) setOffset(currentOffset + 10)
          else setOffset(10)
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false)
      }
    },
    [debouncedQuery, activeTag, sort, offset]
  )

  useEffect(() => {
    fetchPrompts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, activeTag, sort])

  return (
    <div className="w-full">
      {/* Header Sticky */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight mb-3">Explore</h1>
        
        {/* Search input inline */}
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="explore-search"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search prompts, keywords..."
            className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-gray-800 focus:border-purple-500 rounded-full text-white placeholder-gray-500 text-sm outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-800 text-sm font-bold bg-black">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`flex-1 py-3 text-center transition ${
              sort === opt.value
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-500 hover:bg-gray-900/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {activeTag && (
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <FiZap className="text-purple-400" />
            Results for #{activeTag}
          </span>
          <button onClick={() => setActiveTag('')} className="text-xs text-gray-500 hover:text-white transition bg-gray-900 px-3 py-1 rounded-full">
            Clear Tag
          </button>
        </div>
      )}

      {/* Main content feed */}
      <div className="flex flex-col">
        {loading && prompts.length === 0 ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prompts.length === 0 ? (
           <div className="p-8 text-center text-gray-500">
             <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-7 h-7 text-gray-600" />
             </div>
             <p className="font-bold text-white text-lg mb-2">No prompts found</p>
             <p>Try searching for something else or exploring different tags.</p>
           </div>
        ) : (
          <div className="flex flex-col">
            {prompts.map(p => (
              <FeedPost
                key={p.id}
                prompt={p as any} 
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && (
           <div className="flex justify-center p-6 border-b border-gray-800 mb-8">
             <button
               onClick={() => fetchPrompts(false)}
               className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition text-sm font-bold"
             >
               Show more
             </button>
           </div>
        )}
      </div>
    </div>
  )
}

// ── Page wrapper (Suspense for useSearchParams)
export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  )
}
