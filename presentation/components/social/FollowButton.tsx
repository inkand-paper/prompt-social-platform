'use client';

import { useState } from 'react';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '@/presentation/hooks/useAuth';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({ userId, initialFollowing, onFollowChange }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please login to follow users');
      return;
    }
    
    if (user.id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: following ? 'unfollow' : 'follow' }),
      });

      const data = await response.json();

      if (data.success) {
        const newFollowing = !following;
        setFollowing(newFollowing);
        onFollowChange?.(newFollowing);
        
        toast.success(newFollowing ? `Started following` : `Unfollowed`);
      } else {
        toast.error(data.error || 'Failed to update follow');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading || user?.id === userId}
      className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
        following
          ? 'bg-gray-700 text-white hover:bg-gray-600'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      } ${loading || user?.id === userId ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {following ? (
        <>
          <FiUserCheck className="w-4 h-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <FiUserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}