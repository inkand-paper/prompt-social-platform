'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { FeedPost } from '@/presentation/components/social/FeedPost';
import { PromptResponseDTO } from '@/application/dto/PromptDTO';
import Link from 'next/link';
import { FiTrendingUp, FiUsers, FiClock, FiArrowLeft } from 'react-icons/fi';

type FeedType = 'following' | 'trending';

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [feedType, setFeedType] = useState<FeedType>('following');
  const [posts, setPosts] = useState<PromptResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (user) {
      loadFeed(true);
    }
  }, [user, feedType]);

  const loadFeed = async (reset: boolean = false) => {
    const currentOffset = reset ? 0 : offset;
    setLoading(true);

    try {
      const response = await fetch(`/api/social/feed?type=${feedType}&limit=10&offset=${currentOffset}`);
      const data = await response.json();

      if (data.success) {
        if (reset) {
          setPosts(data.items);
        } else {
          setPosts(prev => [...prev, ...data.items]);
        }
        setHasMore(data.hasMore);
        if (!reset) {
          setOffset(prev => prev + 10);
        } else {
          setOffset(10);
        }
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadFeed(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Welcome to the Feed</h1>
            <p className="text-gray-400 mb-6">Please login to see posts from people you follow</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Go to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Sticky */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Home</h1>
      </div>

      <div className="p-4">

        {/* Feed Type Tabs */}
        <div className="flex border-b border-gray-800 mb-2">
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 flex justify-center py-4 text-sm font-bold transition hover:bg-gray-900/50 ${
              feedType === 'following'
                ? 'text-white border-b-4 border-purple-500'
                : 'text-gray-500'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setFeedType('trending')}
            className={`flex-1 flex justify-center py-4 text-sm font-bold transition hover:bg-gray-900/50 ${
              feedType === 'trending'
                ? 'text-white border-b-4 border-purple-500'
                : 'text-gray-500'
            }`}
          >
            Trending
          </button>
        </div>

        {/* Feed Posts */}
        <div className="flex flex-col">
          {posts.length === 0 && !loading ? (
            <div className="p-8 text-center text-gray-500">
              {feedType === 'following' ? (
                <>
                  <p className="mb-4 text-white font-bold text-lg">Welcome to your timeline</p>
                  <p className="mb-6">Follow people to see their prompts here.</p>
                  <Link
                    href="/explore"
                    className="inline-flex items-center px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition"
                  >
                    Find people to follow
                  </Link>
                </>
              ) : (
                <p>No trending posts yet</p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <FeedPost key={post.id} prompt={post} />
            ))
          )}

          {loading && (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && hasMore && posts.length > 0 && (
            <div className="flex justify-center p-6 border-b border-gray-800">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition text-sm font-bold"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}