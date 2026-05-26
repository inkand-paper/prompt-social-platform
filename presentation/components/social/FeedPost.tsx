'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PromptResponseDTO } from '@/application/dto/PromptDTO';
import { useSocial } from '@/presentation/hooks/useSocial';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiHeart, FiBookmark, FiCopy, FiCheck, FiEye, FiTerminal, FiTag } from 'react-icons/fi';
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
    toast.success('Prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <article className="border-b border-gray-800/60 hover:bg-white/[0.02] transition-colors duration-150 p-4 lg:p-5">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile/${prompt.username || 'anonymous'}`} className="flex items-center gap-2.5 group min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
            {(prompt.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-white font-semibold text-sm group-hover:text-purple-300 transition truncate block">
              @{prompt.username || 'anonymous'}
            </span>
            <span className="text-gray-500 text-xs">{timeAgo(prompt.createdAt)}</span>
          </div>
        </Link>

        {/* Copy button top-right */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition text-xs font-mono border border-gray-700/50"
        >
          {copied ? <FiCheck className="w-3.5 h-3.5 text-green-400" /> : <FiCopy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Title + Description */}
      <Link href={`/dashboard/prompts/${prompt.id}`} className="group block mb-3">
        <h2 className="text-white font-bold text-base lg:text-lg leading-snug group-hover:text-purple-300 transition mb-1">
          {prompt.title}
        </h2>
        {prompt.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
            {prompt.description}
          </p>
        )}
      </Link>

      {/* Prompt Code Preview */}
      <Link href={`/dashboard/prompts/${prompt.id}`}>
        <div className="rounded-xl border border-gray-700/50 bg-gray-950/70 overflow-hidden mb-3">
          {/* Code bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/50 bg-gray-900/50">
            <FiTerminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-gray-500 font-mono">prompt.txt</span>
            <div className="ml-auto flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
          </div>
          <pre className="text-gray-300 font-mono text-[13px] whitespace-pre-wrap line-clamp-4 p-3 leading-relaxed">
            {prompt.promptText}
          </pre>
        </div>
      </Link>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.tags.slice(0, 4).map((t) => (
            <Link
              key={t}
              href={`/explore?tag=${t}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/20 transition"
            >
              <FiTag className="w-2.5 h-2.5" />
              {t}
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-2">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-sm font-medium ${
            isLiked
              ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
              : 'text-gray-500 hover:bg-pink-500/10 hover:text-pink-400 border border-transparent'
          }`}
        >
          <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-sm font-medium ${
            isSaved
              ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
              : 'text-gray-500 hover:bg-violet-500/10 hover:text-violet-400 border border-transparent'
          }`}
        >
          <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          <span>{saves}</span>
        </button>

        {/* Views */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 text-sm ml-auto">
          <FiEye className="w-4 h-4" />
          <span>{prompt.viewCount || 0}</span>
        </div>
      </div>
    </article>
  );
}
