'use client'

import Link from 'next/link'
import { FiHeart, FiBookmark, FiEye, FiMoreHorizontal, FiEdit, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

interface PromptCardProps {
  id: string
  title: string
  description: string | null
  promptText: string
  user?: {
    username: string
    avatarUrl: string | null
  }
  tags?: string[]
  likeCount: number
  saveCount: number
  viewCount: number
  createdAt: Date
  isLiked?: boolean
  isSaved?: boolean
  isOwner?: boolean
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
}

export function PromptCard({
  id,
  title,
  description,
  promptText,
  user,
  tags = [],
  likeCount,
  saveCount,
  viewCount,
  createdAt,
  isLiked = false,
  isSaved = false,
  isOwner = false,
  onLike,
  onSave,
  onDelete,
  onEdit
}: PromptCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [likes, setLikes] = useState(likeCount)
  const [saves, setSaves] = useState(saveCount)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLike = () => {
    if (onLike) {
      onLike(id)
      setLiked(!liked)
      setLikes(prev => liked ? prev - 1 : prev + 1)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(id)
      setSaved(!saved)
      setSaves(prev => saved ? prev - 1 : prev + 1)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText)
    setCopied(true)
    toast.success('Prompt copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
    setMenuOpen(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      if (onDelete) {
        onDelete(id)
      }
    }
    setMenuOpen(false)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id)
    }
    setMenuOpen(false)
  }

  // Close menu when clicking outside
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  // Default user object if not provided
  const displayUser = user || { username: 'anonymous', avatarUrl: null }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link href={`/profile/${displayUser.username}`} className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
              {displayUser.avatarUrl ? (
                <Image
                  src={displayUser.avatarUrl}
                  alt={displayUser.username}
                  fill
                  sizes="(max-width: 768px) 40px, 40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {displayUser.username[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-medium group-hover:text-purple-400 transition">
                @{displayUser.username}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
          
          {/* 3-dot Menu Button */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </button>
            
            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20 overflow-hidden">
                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition flex items-center space-x-2"
                  >
                    {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                  
                  {/* Edit Button - Only for owner */}
                  {isOwner && (
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition flex items-center space-x-2"
                    >
                      <FiEdit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  
                  {/* Delete Button - Only for owner */}
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition flex items-center space-x-2 border-t border-gray-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <Link href={`/dashboard/prompts/${id}`}>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-white mb-2 hover:text-purple-400 transition">
              {title}
            </h3>
            {description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {description}
              </p>
            )}
            <div className="bg-gray-800 rounded-lg p-3">
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap line-clamp-3">
                {promptText}
              </pre>
            </div>
          </div>
        </Link>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${encodeURIComponent(tag)}`}
                className="px-2 py-1 bg-gray-800 rounded-md text-xs text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition"
              >
                #{tag}
              </Link>
            ))}
            {tags.length > 5 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likes}</span>
          </button>
          
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 transition ${
              saved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <FiBookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            <span className="text-sm">{saves}</span>
          </button>
          
          <div className="flex items-center space-x-2 text-gray-500">
            <FiEye className="w-5 h-5" />
            <span className="text-sm">{viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}