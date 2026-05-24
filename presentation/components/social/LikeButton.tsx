'use client';

import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { toast } from 'sonner';

interface LikeButtonProps {
  promptId: string;
  initialLiked: boolean;
  initialCount: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export function LikeButton({ promptId, initialLiked, initialCount, onLikeChange }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, action: liked ? 'unlike' : 'like' }),
      });

      const data = await response.json();

      if (data.success) {
        const newLiked = !liked;
        const newCount = liked ? count - 1 : count + 1;
        setLiked(newLiked);
        setCount(newCount);
        onLikeChange?.(newLiked, newCount);
        
        if (!liked) {
          toast.success('Added to your likes');
        }
      } else {
        toast.error(data.error || 'Failed to update like');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-2 transition ${
        liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
      <span className="text-sm">{count}</span>
    </button>
  );
}