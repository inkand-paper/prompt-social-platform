'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { useSocial } from '@/presentation/hooks/useSocial'
import { CommentSection } from '@/presentation/components/social/CommentSection'
import { FollowButton } from '@/presentation/components/social/FollowButton'
import Link from 'next/link'
import { FiEdit, FiTrash2, FiHeart, FiBookmark, FiEye, FiClock, FiArrowLeft, FiCopy, FiCheck, FiTerminal, FiHash } from 'react-icons/fi'
import { toast } from 'sonner'
import { CodeHighlighter } from '@/presentation/components/prompts/SyntaxHighlighter'

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getPrompt, deletePrompt, publishPrompt, saveAsDraft } = usePrompts()
  const { toggleLike, toggleSave, checkIfLiked, checkIfSaved } = useSocial()
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const promptId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (promptId) {
      loadPrompt()
    }
  }, [promptId])

  useEffect(() => {
    if (user && prompt) {
      checkIfLiked(prompt.id).then(setIsLiked)
      checkIfSaved(prompt.id).then(setIsSaved)
    }
  }, [user, prompt])

  const loadPrompt = async () => {
    setLoading(true)
    const result = await getPrompt(promptId as string, user?.id)
    if (result.success && 'data' in result && result.data) {
      setPrompt(result.data)
    } else {
      toast.error('Prompt not found')
      router.push('/dashboard/prompts')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!user || !prompt) return
    if (confirm('Delete this prompt permanently?')) {
      const result = await deletePrompt(prompt.id, user.id)
      if (result.success) {
        toast.success('Prompt deleted')
        router.push('/dashboard/prompts')
      }
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.promptText)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
     return (
       <div className="min-h-screen bg-black flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
       </div>
     )
  }

  if (!prompt) return null
  const isOwner = user?.id === prompt.userId

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-inter pb-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Breadcrumb Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-600 hover:text-white transition-all mb-10 group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to studio</span>
        </button>

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
           <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-none tracking-tight mb-4">
                {prompt.title}
              </h1>
              {prompt.isDraft && (
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Draft Mode
                </span>
              )}
           </div>
           
           {isOwner && (
             <div className="flex items-center gap-2 shrink-0">
               <Link 
                 href={`/dashboard/prompts/${prompt.id}/edit`}
                 className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
               >
                 <FiEdit className="w-4 h-4" />
               </Link>
               <button 
                 onClick={handleDelete}
                 className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
               >
                 <FiTrash2 className="w-4 h-4" />
               </button>
             </div>
           )}
        </div>

        {/* Author Row */}
        <div className="flex items-center justify-between p-4 surface-card rounded-2xl mb-10 border border-white/[0.06]">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {(prompt.username?.[0] || 'U').toUpperCase()}
             </div>
             <div>
                <p className="text-white font-bold text-lg leading-none mb-1">@{prompt.username}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                   <span className="flex items-center gap-1.5"><FiClock /> {new Date(prompt.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1.5"><FiEye /> {prompt.viewCount || 0} views</span>
                </div>
             </div>
          </div>
          {!isOwner && user && (
            <FollowButton userId={prompt.userId} initialFollowing={false} />
          )}
        </div>

        {/* Description */}
        {prompt.description && (
          <p className="text-lg text-zinc-300 font-normal leading-relaxed mb-10">
            {prompt.description}
          </p>
        )}

        {/* Code Block Header */}
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
             <FiTerminal className="text-violet-500" /> Prompt Source
           </h3>
           <div className="text-[10px] font-mono text-zinc-600 flex items-center gap-4">
              <span>{prompt.promptText.length} characters</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all font-inter font-bold uppercase tracking-widest"
              >
                {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
           </div>
        </div>

        {/* Terminal Style Prompt Block */}
        <div className="rounded-3xl border border-white/[0.06] bg-zinc-950 overflow-hidden mb-12 shadow-2xl">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.04] bg-zinc-900/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
          </div>
          <div className="p-8">
            <CodeHighlighter 
              code={prompt.promptText} 
              language="text"
              showLineNumbers={true}
            />
          </div>
        </div>

        {/* Engagement & Tags */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-white/[0.06] mb-12">
           <div className="flex flex-wrap gap-2">
             {prompt.tags?.map((t: string) => (
               <Link 
                 key={t}
                 href={`/explore?tag=${t}`}
                 className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest hover:bg-violet-600/20 transition-all"
               >
                 <FiHash className="w-3 h-3" /> {t}
               </Link>
             ))}
           </div>
           
           <div className="flex items-center gap-3">
             <button 
              onClick={() => toggleLike(prompt.id, isLiked)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border ${
                isLiked 
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]' 
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10'
              }`}
             >
               <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current animate-bounce' : ''}`} />
               <span>{prompt.likeCount} Likes</span>
             </button>

             <button 
              onClick={() => toggleSave(prompt.id, isSaved)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border ${
                isSaved 
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-500 shadow-[0_0_20px_rgba(124,58,237,0.2)]' 
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10'
              }`}
             >
               <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
               <span>{prompt.saveCount} Saved</span>
             </button>
           </div>
        </div>

        {/* Version History (Placeholder as per spec) */}
        <div className="mb-12">
           <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Version History</h3>
           <div className="surface-card rounded-2xl border border-white/[0.04] p-6 text-center">
              <p className="text-zinc-600 text-sm italic">Showing latest stable v1.0.0</p>
           </div>
        </div>

        {/* Comments Section */}
        <div className="pt-8">
          <CommentSection promptId={prompt.id} />
        </div>

      </div>
    </div>
  )
}