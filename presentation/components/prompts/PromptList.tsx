'use client'

import { PromptCard } from './PromptCard'
import { FiLoader } from 'react-icons/fi'

interface PromptListProps {
  prompts: any[]
  loading?: boolean
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function PromptList({ 
  prompts, 
  loading = false, 
  onLike, 
  onSave, 
  onDelete, 
  onEdit 
}: PromptListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiLoader className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No prompts yet</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to create a prompt!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          id={prompt.id}
          title={prompt.title}
          description={prompt.description}
          promptText={prompt.promptText}
          user={prompt.user}
          tags={prompt.tags}
          likeCount={prompt.likeCount || 0}
          saveCount={prompt.saveCount || 0}
          viewCount={prompt.viewCount || 0}
          createdAt={prompt.createdAt}
          isLiked={prompt.isLiked || false}
          isSaved={prompt.isSaved || false}
          isOwner={prompt.isOwner || false}
          onLike={onLike}
          onSave={onSave}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}