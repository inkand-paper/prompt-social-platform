'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { useSocial } from '@/presentation/hooks/useSocial'
import { CommentSection } from '@/presentation/components/social/CommentSection'
import Link from 'next/link'
import { FiEdit, FiTrash2, FiHeart, FiBookmark, FiEye, FiClock, FiUser, FiArrowLeft, FiCopy, FiCheck } from 'react-icons/fi'
import { toast } from 'sonner'
import Image from 'next/image'
import { CodeHighlighter } from '@/presentation/components/prompts/SyntaxHighlighter'

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getPrompt, deletePrompt, publishPrompt, saveAsDraft } = usePrompts()
  const { toggleLike, toggleSave, checkIfLiked, checkIfSaved } = useSocial()
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const promptId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (promptId) {
      loadPrompt()
    }
  }, [promptId])

  useEffect(() => {
    if (user && prompt) {
      checkIfLiked(prompt.id).then(setIsLiked)
      checkIfSaved(prompt.id).then(setIsSaved)
    }
  }, [user, prompt])

  const loadPrompt = async () => {
    setLoading(true)
    const result = await getPrompt(promptId as string, user?.id)
    if (result.success && 'data' in result && result.data) {
      setPrompt(result.data)
    } else {
      toast.error('Prompt not found')
      router.push('/dashboard/prompts')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!user || !prompt) return
    
    if (confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      const result = await deletePrompt(prompt.id, user.id)
      if (result.success) {
        toast.success('Prompt deleted successfully')
        router.push('/dashboard/prompts')
      } else {
        toast.error(result.error?.message || 'Failed to delete')
      }
    }
  }

  const handlePublish = async () => {
    if (!user || !prompt) return
    
    const result = await publishPrompt(prompt.id, user.id)
    if (result.success) {
      toast.success('Prompt published successfully')
      loadPrompt()
    } else {
      toast.error(result.error?.message || 'Failed to publish')
    }
  }

  const handleSaveDraft = async () => {
    if (!user || !prompt) return
    
    const result = await saveAsDraft(prompt.id, user.id)
    if (result.success) {
      toast.success('Saved as draft')
      loadPrompt()
    } else {
      toast.error(result.error?.message || 'Failed to save')
    }
  }

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt.promptText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLikeClick = async () => {
    const result = await toggleLike(prompt.id, isLiked)
    if (result) {
      setIsLiked(result.liked)
      setPrompt((prev: any) => ({ ...prev, likeCount: result.count }))
    }
  }

  const handleSaveClick = async () => {
    const result = await toggleSave(prompt.id, isSaved)
    if (result) {
      setIsSaved(result.saved)
      setPrompt((prev: any) => ({ ...prev, saveCount: result.count }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading prompt...</p>
        </div>
      </div>
    )
  }

  if (!prompt) return null

  const isOwner = user?.id === prompt.userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header Actions */}
        <div className="flex justify-end items-center gap-3 mb-6">
          {isOwner && (
            <>
              <Link
                href={`/dashboard/prompts/${prompt.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit</span>
              </Link>
              
              {prompt.isDraft ? (
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  Unpublish
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {/* Prompt Content */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          {/* User Info */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
            <Link href={`/profile/${prompt.username}`} className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
                {prompt.userAvatar ? (
                  <Image
                    src={prompt.userAvatar}
                    alt={prompt.username || 'User'}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    {(prompt.username?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-semibold group-hover:text-purple-400 transition flex items-center space-x-1">
                  <FiUser className="w-4 h-4" />
                  <span>@{prompt.username}</span>
                </p>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <FiClock className="w-3 h-3" />
                    <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  </span>
                  {prompt.isDraft && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                      Draft
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Copy Button */}
            <button
              onClick={handleCopyPrompt}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <FiCheck className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">{prompt.title}</h1>
          
          {/* Description */}
          {prompt.description && (
            <p className="text-gray-300 text-lg mb-6">{prompt.description}</p>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Content:</h3>
            <div dangerouslySetInnerHTML={{ __html: prompt.content }} />
          </div>

          {/* Prompt Text with Syntax Highlighter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Prompt Text:</h3>
            <CodeHighlighter 
              code={prompt.promptText} 
              language="text"
              showLineNumbers={true}
            />
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {prompt.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="px-2 py-1 bg-gray-800 rounded-md text-xs text-gray-400 hover:text-purple-400 hover:bg-gray-700 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-6 pt-6 border-t border-gray-800">
            <button 
              onClick={handleLikeClick}
              className={`flex items-center space-x-2 transition ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{prompt.likeCount}</span>
            </button>
            
            <button 
              onClick={handleSaveClick}
              className={`flex items-center space-x-2 transition ${isSaved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <FiBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{prompt.saveCount}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <FiEye className="w-5 h-5" />
              <span>{prompt.viewCount}</span>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection promptId={prompt.id} />
        </div>
      </div>
    </div>
  )
}