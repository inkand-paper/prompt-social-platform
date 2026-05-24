'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PromptResponseDTO } from '@/application/dto/PromptDTO';
import { useSocial } from '@/presentation/hooks/useSocial';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FiHeart, FiMessageCircle, FiBookmark, FiRepeat, FiCopy, FiCheck, FiMoreHorizontal } from 'react-icons/fi';
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
  const [isLiked, setIsLiked] = useState(false); // Can be tied to a prop in v2 if feed returns user state
  const [isSaved, setIsSaved] = useState(false);
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
    toast.success('Prompt copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const dateStr = new Date(prompt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="flex gap-4 p-4 lg:p-5 border-b border-gray-800 hover:bg-gray-900/30 transition cursor-pointer">
      {/* Avatar column */}
      <Link href={`/profile/${prompt.username || 'anonymous'}`} className="shrink-0">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
          {(prompt.username?.[0] || 'U').toUpperCase()}
        </div>
      </Link>

      {/* Main Content Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <Link href={`/dashboard/prompts/${prompt.id}`} className="group min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-white group-hover:underline truncate">
                 {prompt.title}
              </span>
              <span className="text-gray-500 text-sm truncate">@{prompt.username || 'anonymous'}</span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{dateStr}</span>
            </div>
          </Link>
          <button className="text-gray-500 hover:text-white p-1 rounded-full transition hover:bg-gray-800">
            <FiMoreHorizontal />
          </button>
        </div>

        {/* Text Body */}
        <Link href={`/dashboard/prompts/${prompt.id}`}>
          {prompt.description && (
            <p className="text-gray-300 mt-1 mb-2 text-[15px] leading-snug">
              {prompt.description}
            </p>
          )}

          {/* Prompt Code Block */}
          <div className="mt-2 bg-gray-950/50 border border-gray-800 rounded-xl p-3 relative group">
            <pre className="text-gray-400 font-mono text-sm whitespace-pre-wrap line-clamp-4">
              {prompt.promptText}
            </pre>
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition"
            >
              {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
            </button>
          </div>
        </Link>
        
        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {prompt.tags.map((t) => (
              <Link key={t} href={`/explore?tag=${t}`} className="text-purple-400 text-sm hover:underline" onClick={(e) => e.stopPropagation()}>
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between mt-4 max-w-md text-gray-500">
          <button className="flex items-center gap-2 group transition" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <div className="p-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-400 transition">
              <FiMessageCircle className="w-[18px] h-[18px]" />
            </div>
            <span className="text-sm group-hover:text-blue-400 transition">{prompt.viewCount || 0}</span> {/* Using view count as replies placeholder for now */}
          </button>

          <button className="flex items-center gap-2 group transition" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
             <div className="p-2 rounded-full group-hover:bg-green-500/10 group-hover:text-green-400 transition">
              <FiRepeat className="w-[18px] h-[18px]" />
            </div>
          </button>

          <button className={`flex items-center gap-2 group transition ${isLiked ? 'text-pink-500' : ''}`} onClick={handleLike}>
             <div className={`p-2 rounded-full transition ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10 group-hover:text-pink-500'}`}>
              <FiHeart className={`w-[18px] h-[18px] ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className={`text-sm ${isLiked ? 'text-pink-500' : 'group-hover:text-pink-500'} transition`}>{likes}</span>
          </button>

          <button className={`flex items-center gap-2 group transition ${isSaved ? 'text-purple-500' : ''}`} onClick={handleSave}>
             <div className={`p-2 rounded-full transition ${isSaved ? 'bg-purple-500/10' : 'group-hover:bg-purple-500/10 group-hover:text-purple-500'}`}>
              <FiBookmark className={`w-[18px] h-[18px] ${isSaved ? 'fill-current' : ''}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}