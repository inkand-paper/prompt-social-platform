'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useSocial } from '@/presentation/hooks/useSocial'
import { FiSearch, FiTrendingUp, FiClock, FiBookmark, FiX, FiHeart, FiEye, FiTag, FiCopy, FiCheck } from 'react-icons/fi'
import Link from 'next/link'
import { toast } from 'sonner'

type SortOption = 'newest' | 'trending' | 'most_saved'

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
  isLiked?: boolean
  isSaved?: boolean
}

function PinterestCard({ prompt }: { prompt: ExplorePrompt }) {
  const { user } = useAuth()
  const { toggleLike, toggleSave } = useSocial()
  const [isLiked, setIsLiked] = useState(prompt.isLiked ?? false)
  const [isSaved, setIsSaved] = useState(prompt.isSaved ?? false)
  const [likes, setLikes] = useState(prompt.likeCount)
  const [saves, setSaves] = useState(prompt.saveCount)
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const gradients = [
    'from-violet-900/80 via-purple-900/60 to-black',
    'from-pink-900/80 via-rose-900/60 to-black',
    'from-blue-900/80 via-indigo-900/60 to-black',
    'from-emerald-900/80 via-teal-900/60 to-black',
    'from-orange-900/80 via-amber-900/60 to-black',
    'from-cyan-900/80 via-sky-900/60 to-black',
  ]
  const gradient = gradients[prompt.id.charCodeAt(0) % gradients.length]

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return toast.error('Log in to like prompts')
    const res = await toggleLike(prompt.id, isLiked)
    if (res) { setIsLiked(!isLiked); setLikes(res.count) }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return toast.error('Log in to save prompts')
    const res = await toggleSave(prompt.id, isSaved)
    if (res) { setIsSaved(!isSaved); setSaves(res.count) }
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    await navigator.clipboard.writeText(prompt.promptText)
    setCopied(true); toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Link
      href={`/dashboard/prompts/${prompt.id}`}
      className="break-inside-avoid block group mb-3 rounded-2xl overflow-hidden border border-gray-800/60 bg-gray-900/40 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Visual preview area */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Decorative glow */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,white,transparent_60%)]" />

        {/* Normal state: prompt text preview */}
        <div className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-200 ${hovered ? 'opacity-0' : 'opacity-100'}`}>
          <pre className="text-white/60 text-[11px] font-mono line-clamp-4 text-center leading-relaxed whitespace-pre-wrap">
            {prompt.promptText?.substring(0, 100)}...
          </pre>
        </div>

        {/* Hover state: full prompt preview overlay — the Pinterest "hover shows prompt" */}
        <div className={`absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white/90 text-[11px] font-mono line-clamp-[7] text-center leading-relaxed whitespace-pre-wrap mb-3">
            {prompt.promptText?.substring(0, 220)}
            {(prompt.promptText?.length ?? 0) > 220 ? '...' : ''}
          </p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition border border-white/20"
          >
            {copied ? <FiCheck className="w-3.5 h-3.5 text-green-400" /> : <FiCopy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy prompt'}
          </button>
        </div>

        {/* Save button always visible on hover */}
        <div className={`absolute top-2 right-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleSave}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-lg ${isSaved ? 'bg-violet-500 text-white' : 'bg-black/60 text-white hover:bg-violet-500'}`}
          >
            <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-white text-sm font-bold leading-snug line-clamp-1 group-hover:text-violet-300 transition mb-1">
          {prompt.title}
        </h3>
        {prompt.description && (
          <p className="text-gray-500 text-xs line-clamp-1 mb-2">{prompt.description}</p>
        )}

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {prompt.tags.slice(0, 2).map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] flex items-center gap-0.5">
                <FiTag className="w-2.5 h-2.5" />{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${prompt.username || 'anonymous'}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 group/user"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[9px] font-bold">
              {(prompt.username?.[0] || 'U').toUpperCase()}
            </div>
            <span className="text-gray-500 text-[11px] group-hover/user:text-gray-300 transition">@{prompt.username || 'anon'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-[11px] transition ${isLiked ? 'text-pink-400' : 'text-gray-600 hover:text-pink-400'}`}
            >
              <FiHeart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <span className="flex items-center gap-1 text-[11px] text-gray-700">
              <FiEye className="w-3 h-3" />
              {prompt.viewCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ExploreInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuery = searchParams.get('q') || ''
  const initialTag = searchParams.get('tag') || ''
  const initialSort = (searchParams.get('sort') as SortOption) || 'trending'

  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeTag, setActiveTag] = useState(initialTag)
  const [sort, setSort] = useState<SortOption>(initialSort)
  const [prompts, setPrompts] = useState<ExplorePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 400)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (activeTag) params.set('tag', activeTag)
    if (sort !== 'trending') params.set('sort', sort)
    router.replace(`/explore?${params.toString()}`, { scroll: false })
  }, [debouncedQuery, activeTag, sort])

  const fetchPrompts = useCallback(async (reset: boolean) => {
    setLoading(true)
    const currentOffset = reset ? 0 : offset
    try {
      const params = new URLSearchParams({ q: debouncedQuery, tag: activeTag, sort, limit: '18', offset: String(currentOffset) })
      const res = await fetch(`/api/test-version/social/search?${params}`)
      const data = await res.json()
      if (data.success) {
        const items = data.items.map((item: any) => ({ ...item, username: item.user?.username, userAvatar: item.user?.avatarUrl }))
        setPrompts(prev => reset ? items : [...prev, ...items])
        setHasMore(data.hasMore)
        setOffset(reset ? 18 : currentOffset + 18)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [debouncedQuery, activeTag, sort, offset])

  useEffect(() => { fetchPrompts(true) }, [debouncedQuery, activeTag, sort])

  const SORT_OPTIONS = [
    { label: 'Trending', value: 'trending' as SortOption, icon: <FiTrendingUp className="w-3.5 h-3.5" /> },
    { label: 'Newest', value: 'newest' as SortOption, icon: <FiClock className="w-3.5 h-3.5" /> },
    { label: 'Most Saved', value: 'most_saved' as SortOption, icon: <FiBookmark className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="w-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-gray-800 px-4 pt-3 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-xl font-bold text-white tracking-tight">Explore</h1>
          {activeTag && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-400 text-xs font-medium">
              #{activeTag}
              <button onClick={() => setActiveTag('')} className="hover:text-white transition"><FiX className="w-3 h-3" /></button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-gray-800 focus:border-violet-500 rounded-full text-white placeholder-gray-500 text-sm outline-none transition"
            />
            {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"><FiX className="w-4 h-4" /></button>}
          </div>
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-full p-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${sort === opt.value ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pinterest masonry grid */}
      <div className="p-4">
        {loading && prompts.length === 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="break-inside-avoid mb-3 rounded-2xl bg-gray-900/40 border border-gray-800/60 animate-pulse">
                <div className="h-36 bg-gray-800 rounded-t-2xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-3/4" />
                  <div className="h-2 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="py-24 text-center">
            <FiSearch className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-white font-bold text-xl mb-2">No prompts found</p>
            <p className="text-gray-500">Try different keywords or tags</p>
          </div>
        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {prompts.map(p => <PinterestCard key={p.id} prompt={p} />)}
            </div>
            {!loading && hasMore && (
              <div className="flex justify-center py-8">
                <button onClick={() => fetchPrompts(false)} className="px-8 py-3 bg-gray-900 border border-gray-700 text-white rounded-full hover:bg-gray-800 transition font-medium">
                  Load more
                </button>
              </div>
            )}
            {loading && prompts.length > 0 && (
              <div className="flex justify-center py-6">
                <div className="w-7 h-7 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-black"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ExploreInner />
    </Suspense>
  )
}
