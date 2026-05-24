'use client';

import { useState } from 'react';
import { FiBookmark } from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '@/presentation/hooks/useAuth';

interface SaveButtonProps {
  promptId: string;
  initialSaved: boolean;
  initialCount: number;
  onSaveChange?: (saved: boolean, count: number) => void;
}

export function SaveButton({ promptId, initialSaved, initialCount, onSaveChange }: SaveButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save prompts');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/social/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, action: saved ? 'unsave' : 'save' }),
      });

      const data = await response.json();

      if (data.success) {
        const newSaved = !saved;
        const newCount = saved ? count - 1 : count + 1;
        setSaved(newSaved);
        setCount(newCount);
        onSaveChange?.(newSaved, newCount);
        
        toast.success(newSaved ? 'Saved to your collection' : 'Removed from saved');
      } else {
        toast.error(data.error || 'Failed to update save');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`flex items-center space-x-2 transition ${
        saved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <FiBookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
      <span className="text-sm">{count}</span>
    </button>
  );
}