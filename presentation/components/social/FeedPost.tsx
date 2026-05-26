'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PromptResponseDTO } from '@/application/dto/PromptDTO';
import { useSocial } from '@/presentation/hooks/useSocial';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiHeart, FiBookmark, FiCopy, FiCheck, FiEye, FiTerminal, FiHash } from 'react-icons/fi';
import { toast } from 'sonner';

interface FeedPostProps {
  prompt: PromptResponseDTO;
  onPostUpdated?: (updatedPrompt: PromptResponseDTO) => void;
}

export function FeedPost({ prompt, onPostUpdated }: FeedPostProps) {
  const { user } = useAuth();
  const { toggleLike, toggleSave } = useSocial();
  const [likes, setLikes] = useState(prompt.likeCount);
  const [saves, setSaves] = useState(prompt.saveCount);
  const [isLiked, setIsLiked] = useState(prompt.isLiked ?? false);
  const [isSaved, setIsSaved] = useState(prompt.isSaved ?? false);
  const [copied, setCopied] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Log in to like prompts');
    const res = await toggleLike(prompt.id, isLiked);
    if (res) {
      setIsLiked(!isLiked);
      setLikes(res.count);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Log in to save prompts');
    const res = await toggleSave(prompt.id, isSaved);
    if (res) {
      setIsSaved(!isSaved);
      setSaves(res.count);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <article className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200 p-5 md:p-6 group relative">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/0 to-transparent group-hover:via-violet-500/30 transition-all duration-500" />
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <Link href={`/profile/${prompt.username || 'anonymous'}`} className="flex items-center gap-3 group/user min-w-0">
          {/* Avatar: Rounded-XL per spec */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.06] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg group-hover/user:shadow-violet-500/20 transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-pink-500/20 opacity-0 group-hover/user:opacity-100 transition-opacity" />
            <span className="relative">{(prompt.username?.[0] || 'U').toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <span className="text-white font-bold text-[15px] group-hover/user:text-violet-400 transition truncate block tracking-tight">
              @{prompt.username || 'anonymous'}
            </span>
            <span className="text-zinc-600 text-xs font-medium uppercase tracking-tighter">{timeAgo(prompt.createdAt)} ago</span>
          </div>
        </Link>

        {/* Copy Indicator */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs font-bold border ${
            copied 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Title */}
      <Link href={`/dashboard/prompts/${prompt.id}`} className="block mb-4">
        <h2 className="text-white font-black text-xl lg:text-2xl leading-none tracking-tight group-hover:text-violet-400 transition-colors">
          {prompt.title}
        </h2>
        {prompt.description && (
          <p className="text-zinc-400 text-sm font-normal leading-relaxed mt-2 line-clamp-2">
            {prompt.description}
          </p>
        )}
      </Link>

      {/* Terminal Style Prompt Preview */}
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 overflow-hidden mb-5 group/code transition-all hover:border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-zinc-900/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] ml-2">prompt.md</span>
        </div>
        <div className="p-4 relative">
          <pre className="text-zinc-300 font-mono text-[13px] leading-relaxed whitespace-pre-wrap line-clamp-4">
            {prompt.promptText}
          </pre>
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Tags & Stats Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {prompt.tags?.slice(0, 3).map((t) => (
            <Link
              key={t}
              href={`/explore?tag=${t}`}
              className="group/tag flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/5 border border-violet-500/10 text-violet-400/80 text-[11px] font-bold uppercase tracking-widest hover:bg-violet-500/10 hover:text-violet-300 transition-all"
            >
              <FiHash className="w-3 h-3 text-violet-500/50" />
              {t}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest group/action ${
              isLiked
                ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                : 'text-zinc-500 hover:text-pink-400 hover:bg-pink-500/5 border border-transparent'
            }`}
          >
            <FiHeart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current scale-110 animate-bounce' : 'group-hover/action:scale-110'}`} />
            <span>{likes}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest group/action ${
              isSaved
                ? 'bg-violet-500/10 text-violet-500 border border-violet-500/20'
                : 'text-zinc-500 hover:text-violet-400 hover:bg-violet-500/5 border border-transparent'
            }`}
          >
            <FiBookmark className={`w-4 h-4 transition-transform ${isSaved ? 'fill-current scale-110' : 'group-hover/action:scale-110'}`} />
            <span>{saves}</span>
          </button>

          {/* Views */}
          <div className="flex items-center gap-2 px-4 py-2 text-zinc-600 text-xs font-black uppercase tracking-widest ml-1">
            <FiEye className="w-4 h-4" />
            <span>{prompt.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
