'use client';

import { useState, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiTrash2, FiHeart } from 'react-icons/fi';
import { useAuth } from '@/presentation/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  content: string;
  likeCount: number;
  parentId: string | null;
  createdAt: Date;
  replies: Comment[];
}

interface CommentSectionProps {
  promptId: string;
  initialComments?: Comment[];
}

export function CommentSection({ promptId, initialComments = [] }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [promptId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/social/comments?promptId=${promptId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          content: newComment,
          parentId: replyTo,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Comment added');
        setNewComment('');
        setReplyTo(null);
        await loadComments();
      } else {
        toast.error(data.error || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const response = await fetch(`/api/social/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Comment deleted');
        await loadComments();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReply = async () => {
      if (!user) {
        toast.error('Please login to reply');
        return;
      }
      if (!replyText.trim()) return;

      try {
        const response = await fetch('/api/social/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptId,
            content: replyText,
            parentId: comment.id,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Reply added');
          setReplyText('');
          setShowReply(false);
          await loadComments();
        } else {
          toast.error(data.error || 'Failed to add reply');
        }
      } catch (error) {
        toast.error('Something went wrong');
      }
    };

    return (
      <div className={`ml-${Math.min(depth * 4, 8)} mt-4`}>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <Link href={`/profile/${comment.username}`} className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
                {comment.userAvatar ? (
                  <Image src={comment.userAvatar} alt={comment.username} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">@{comment.username}</p>
                <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
            
            {user?.id === comment.userId && (
              <button onClick={() => handleDelete(comment.id)} className="text-gray-500 hover:text-red-500 transition">
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className="text-gray-300 mt-2 text-sm">{comment.content}</p>
          
          <div className="flex items-center space-x-4 mt-2">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-400 transition text-xs">
              <FiHeart className="w-3 h-3" />
              <span>{comment.likeCount}</span>
            </button>
            {depth < 3 && (
              <button onClick={() => setShowReply(!showReply)} className="text-gray-500 hover:text-purple-400 transition text-xs">
                Reply
              </button>
            )}
          </div>
          
          {showReply && (
            <div className="mt-3 flex items-start space-x-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
              />
              <button onClick={handleReply} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {comment.replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
        <FiMessageCircle className="w-5 h-5" />
        <span>Comments ({comments.length})</span>
      </h3>
      
      {/* New Comment Input */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Write a comment..." : "Please login to comment"}
          disabled={!user}
          className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!user || !newComment.trim() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiSend className="w-4 h-4" />
            <span>Post Comment</span>
          </button>
        </div>
        {replyTo && (
          <div className="mt-2 text-sm text-purple-400">
            Replying to comment • <button onClick={() => setReplyTo(null)} className="underline">Cancel</button>
          </div>
        )}
      </div>
      
      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}