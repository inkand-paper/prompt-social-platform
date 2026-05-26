'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useSocial } from '@/presentation/hooks/useSocial'
import { FiSearch, FiTrendingUp, FiClock, FiBookmark, FiX, FiHeart, FiCopy, FiCheck, FiHash } from 'react-icons/fi'
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
  const [likes, setLikes] = useState(prompt.likeCount)
  const [copied, setCopied] = useState(false)

  const getGradient = (id: string) => {
    const gradients = [
      'from-violet-900/40 to-black',
      'from-pink-900/40 to-black',
      'from-purple-900/40 to-black',
      'from-indigo-900/40 to-black',
      'from-fuchsia-900/40 to-black',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return toast.error('Log in to like prompts')
    const res = await toggleLike(prompt.id, isLiked)
    if (res) { setIsLiked(!isLiked); setLikes(res.count) }
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    await navigator.clipboard.writeText(prompt.promptText)
    setCopied(true); toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Link
      href={`/dashboard/prompts/${prompt.id}`}
      className="break-inside-avoid block group mb-6 rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300 hover:-translate-y-2"
    >
      {/* Top 40% = Gradient Swatch */}
      <div className={`relative h-32 bg-gradient-to-b ${getGradient(prompt.id)} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_40%,white,transparent_70%)]" />
        
        {/* Normal Content */}
        <div className="group-hover:opacity-0 transition-opacity duration-300">
           <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FiSearch className="w-4 h-4 text-zinc-500" />
           </div>
        </div>

        {/* Hover Overlay (Pinterest style) */}
        <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-4">
          <p className="text-zinc-300 font-mono text-[10px] leading-relaxed line-clamp-[6] text-center">
            {prompt.promptText}
          </p>
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest hover:bg-violet-600/40 transition"
            >
              {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 60% = Content */}
      <div className="p-4">
        <h3 className="text-white text-[15px] font-bold leading-tight line-clamp-1 mb-1 group-hover:text-violet-400 transition">
          {prompt.title}
        </h3>
        <p className="text-zinc-500 text-xs font-normal mb-3 line-clamp-1">
          @{prompt.username || 'anonymous'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags?.slice(0, 2).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-violet-500/5 border border-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-widest">
              {t}
            </span>
          ))}
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition ${isLiked ? 'text-pink-500' : 'text-zinc-600 hover:text-pink-500'}`}
          >
            <FiHeart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
            {likes}
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-zinc-800">
            <FiBookmark className="w-3.5 h-3.5" />
            {prompt.saveCount}
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
      const params = new URLSearchParams({ q: debouncedQuery, tag: activeTag, sort, limit: '20', offset: String(currentOffset) })
      const res = await fetch(`/api/social/search?${params}`)
      const data = await res.json()
      if (data.success) {
        const items = data.items.map((item: any) => ({ ...item, username: item.user?.username, userAvatar: item.user?.avatarUrl }))
        setPrompts(prev => reset ? items : [...prev, ...items])
        setHasMore(data.hasMore)
        setOffset(reset ? 20 : currentOffset + 20)
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
    <div className="w-full min-h-screen bg-black">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-black text-white tracking-tight">Discovery</h1>
             {activeTag && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-600/10 border border-violet-500/20 rounded-full text-violet-400 text-[10px] font-black tracking-widest uppercase">
                  #{activeTag}
                  <button onClick={() => setActiveTag('')} className="hover:text-white transition"><FiX className="w-3 h-3" /></button>
                </span>
             )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search prompt studio..."
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl text-white placeholder-zinc-600 text-sm outline-none transition-all"
              />
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sort === opt.value ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="p-6">
        {loading && prompts.length === 0 ? (
          <div className="masonry-grid gap-6 space-y-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="break-inside-avoid bg-zinc-950 border border-white/5 rounded-2xl aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="py-32 text-center">
            <FiSearch className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <p className="text-white font-black text-2xl tracking-tight mb-2">No results found</p>
            <p className="text-zinc-600 text-sm">Try searching for "Claude", "Modern UI", or "GPT-4"</p>
          </div>
        ) : (
          <div className="masonry-grid gap-6 space-y-6">
            {prompts.map(p => <PinterestCard key={p.id} prompt={p} />)}
          </div>
        )}
        
        {hasMore && !loading && (
          <div className="flex justify-center mt-12 mb-20">
            <button 
              onClick={() => fetchPrompts(false)} 
              className="px-8 py-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition"
            >
              Load More Results
            </button>
          </div>
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
