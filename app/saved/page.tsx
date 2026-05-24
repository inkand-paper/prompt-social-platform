'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { PromptCard } from '@/presentation/components/prompts/PromptCard';
import Link from 'next/link';
import { FiBookmark, FiArrowLeft } from 'react-icons/fi';

interface SavedPrompt {
  id: string;
  prompt_id: string;
  title: string;
  prompt_text: string;
  saved_at: Date;
}

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (user) {
      loadSavedPrompts(true);
    }
  }, [user]);

  const loadSavedPrompts = async (reset: boolean = false) => {
    const currentOffset = reset ? 0 : offset;
    setLoading(true);

    try {
      const response = await fetch(`/api/social/saved?limit=10&offset=${currentOffset}`);
      const data = await response.json();

      if (data.success) {
        const prompts = data.savedPrompts.map((p: any) => ({
          ...p,
          saved_at: new Date(p.saved_at),
        }));

        if (reset) {
          setSavedPrompts(prompts);
        } else {
          setSavedPrompts(prev => [...prev, ...prompts]);
        }
        setHasMore(data.hasMore);
        if (!reset) {
          setOffset(prev => prev + 10);
        } else {
          setOffset(10);
        }
      }
    } catch (error) {
      console.error('Failed to load saved prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadSavedPrompts(false);
    }
  };

  const handleUnsave = (promptId: string) => {
    setSavedPrompts(prev => prev.filter(p => p.prompt_id !== promptId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading saved prompts...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Saved Prompts</h1>
            <p className="text-gray-400 mb-6">Please login to see your saved prompts</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center space-x-2">
            <FiBookmark className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Saved Prompts</h1>
          </div>
        </div>

        {/* Saved Prompts List */}
        <div className="space-y-6">
          {savedPrompts.length === 0 && !loading ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 text-center">
              <FiBookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No saved prompts yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Click the bookmark icon on any prompt to save it here
              </p>
              <Link
                href="/explore"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Explore Prompts
              </Link>
            </div>
          ) : (
            savedPrompts.map((saved) => (
              <div key={saved.id} className="relative">
                <PromptCard
                  id={saved.prompt_id}
                  title={saved.title}
                  description={null}
                  promptText={saved.prompt_text}
                  likeCount={0}
                  saveCount={0}
                  viewCount={0}
                  createdAt={saved.saved_at}
                  isSaved={true}
                  onSave={() => handleUnsave(saved.prompt_id)}
                />
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && hasMore && savedPrompts.length > 0 && (
            <div className="flex justify-center py-4">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}