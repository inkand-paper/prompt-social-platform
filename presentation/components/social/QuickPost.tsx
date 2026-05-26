'use client';

import { useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { usePrompts } from '@/presentation/hooks/usePrompts';
import { FiImage, FiSettings, FiPlus, FiZap } from 'react-icons/fi';
import { toast } from 'sonner';

interface QuickPostProps {
  onPostCreated: () => void;
}

export function QuickPost({ onPostCreated }: QuickPostProps) {
  const { user } = useAuth();
  const { createPrompt } = usePrompts();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) return toast.error('Please login to post');

    setLoading(true);
    try {
      // For QuickPost, we'll use a simplified structure: content is used for title/promptText
      const result = await createPrompt(user.id, {
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        content: content, // Now correctly including the required content field
        promptText: content,
        description: '',
        tags: [],
        visibility: 'public',
        isDraft: false,
      });

      if (result.success) {
        setContent('');
        toast.success('Prompt published!');
        onPostCreated();
      } else {
        toast.error(result.error?.message || 'Failed to post');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 lg:p-5 border-b border-gray-800/60 bg-black/50">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-violet-500/20">
          {(user.username?.[0] || 'U').toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your prompt today? Share a magical instruction..."
            className="w-full bg-transparent border-none focus:ring-0 text-white text-lg placeholder-gray-600 resize-none min-h-[50px] max-h-[300px] py-2"
          />

          <div className="flex items-center justify-between pt-3 border-t border-gray-800/40 mt-2">
            <div className="flex gap-1">
              <button disabled className="p-2 text-violet-500/50 hover:bg-violet-500/10 rounded-xl transition cursor-not-allowed" title="Coming soon: Image support">
                <FiImage className="w-4 h-4" />
              </button>
              <button disabled className="p-2 text-violet-500/50 hover:bg-violet-500/10 rounded-xl transition cursor-not-allowed" title="Coming soon: Advanced settings">
                <FiSettings className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-violet-600/30 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiZap className="w-3.5 h-3.5" />
              )}
              Post Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
