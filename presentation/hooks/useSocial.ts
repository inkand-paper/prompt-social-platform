'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface LikeState {
  liked: boolean;
  count: number;
}

interface SaveState {
  saved: boolean;
  count: number;
}

interface FollowState {
  following: boolean;
  followersCount: number;
  followingCount: number;
}

export function useSocial() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const likePrompt = useCallback(async (promptId: string): Promise<LikeState> => {
    if (!user) {
      toast.error('Please login to like prompts');
      return { liked: false, count: 0 };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, action: 'like' }),
      });

      const data = await response.json();
      if (data.success) {
        return { liked: data.liked, count: data.likeCount };
      } else {
        toast.error(data.error || 'Failed to like');
        return { liked: false, count: 0 };
      }
    } catch (error) {
      toast.error('Something went wrong');
      return { liked: false, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unlikePrompt = useCallback(async (promptId: string): Promise<LikeState> => {
    if (!user) {
      toast.error('Please login');
      return { liked: false, count: 0 };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, action: 'unlike' }),
      });

      const data = await response.json();
      if (data.success) {
        return { liked: data.liked, count: data.likeCount };
      } else {
        toast.error(data.error || 'Failed to unlike');
        return { liked: true, count: 0 };
      }
    } catch (error) {
      toast.error('Something went wrong');
      return { liked: true, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePrompt = useCallback(async (promptId: string): Promise<SaveState> => {
    if (!user) {
      toast.error('Please login to save prompts');
      return { saved: false, count: 0 };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, action: 'save' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Saved to collection');
        return { saved: data.saved, count: data.saveCount };
      } else {
        toast.error(data.error || 'Failed to save');
        return { saved: false, count: 0 };
      }
    } catch (error) {
      toast.error('Something went wrong');
      return { saved: false, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unsavePrompt = useCallback(async (promptId: string): Promise<SaveState> => {
    if (!user) {
      toast.error('Please login');
      return { saved: false, count: 0 };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, action: 'unsave' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Removed from saved');
        return { saved: data.saved, count: data.saveCount };
      } else {
        toast.error(data.error || 'Failed to unsave');
        return { saved: true, count: 0 };
      }
    } catch (error) {
      toast.error('Something went wrong');
      return { saved: true, count: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleLike = useCallback(async (promptId: string, currentLiked: boolean): Promise<LikeState> => {
    if (currentLiked) {
      return await unlikePrompt(promptId);
    } else {
      return await likePrompt(promptId);
    }
  }, [likePrompt, unlikePrompt]);

  const toggleSave = useCallback(async (promptId: string, currentSaved: boolean): Promise<SaveState> => {
    if (currentSaved) {
      return await unsavePrompt(promptId);
    } else {
      return await savePrompt(promptId);
    }
  }, [savePrompt, unsavePrompt]);

  const followUser = useCallback(async (userId: string): Promise<FollowState> => {
    if (!user) {
      toast.error('Please login to follow users');
      return { following: false, followersCount: 0, followingCount: 0 };
    }

    if (user.id === userId) {
      toast.error('You cannot follow yourself');
      return { following: false, followersCount: 0, followingCount: 0 };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'follow' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Started following');
        return { 
          following: data.following, 
          followersCount: data.followersCount,
          followingCount: data.followingCount 
        };
      } else {
        toast.error(data.error || 'Failed to follow');
        return { following: false, followersCount: 0, followingCount: 0 };
      }
    } catch (error) {
      toast.error('Something went wrong');
      return { following: false, followersCount: 0, followingCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unfollowUser = useCallback(async (userId: string): Promise<FollowState> => {
    if (!user) {
      toast.error('Please login');
      return { following: false, followersCount: 0, followingCount: 0 };
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'unfollow' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Unfollowed');
        return { 
          following: data.following, 
          followersCount: data.followersCount,
          followingCount: data.followingCount 
        };
      } else {
        toast.error(data.error || 'Failed to unfollow');
        return { following: true, followersCount: 0, followingCount: 0 };
      }
    } catch (error) {
      toast.error('Something went wrong');
      return { following: true, followersCount: 0, followingCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleFollow = useCallback(async (userId: string, currentFollowing: boolean): Promise<FollowState> => {
    if (currentFollowing) {
      return await unfollowUser(userId);
    } else {
      return await followUser(userId);
    }
  }, [followUser, unfollowUser]);

  const checkIfLiked = useCallback(async (promptId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/social/check-like?promptId=${promptId}`);
      const data = await response.json();
      return data.liked || false;
    } catch (error) {
      return false;
    }
  }, [user]);

  const checkIfSaved = useCallback(async (promptId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/social/check-save?promptId=${promptId}`);
      const data = await response.json();
      return data.saved || false;
    } catch (error) {
      return false;
    }
  }, [user]);

  const checkIfFollowing = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/social/check-follow?userId=${userId}`);
      const data = await response.json();
      return data.following || false;
    } catch (error) {
      return false;
    }
  }, [user]);

  return {
    loading,
    likePrompt,
    unlikePrompt,
    savePrompt,
    unsavePrompt,
    toggleLike,
    toggleSave,
    followUser,
    unfollowUser,
    toggleFollow,
    checkIfLiked,
    checkIfSaved,
    checkIfFollowing,
  };
}