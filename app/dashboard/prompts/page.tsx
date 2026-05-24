'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { PromptList } from '@/presentation/components/prompts/PromptList'
import Link from 'next/link'
import { FiPlus, FiFileText, FiClock, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'sonner'

export default function PromptsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getUserPrompts, deletePrompt, loading } = usePrompts()
  const [prompts, setPrompts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')

  useEffect(() => {
    if (user) {
      loadPrompts()
    }
  }, [user, activeTab])

  const loadPrompts = async () => {
  if (!user) return
  
  const result = await getUserPrompts(user.id)
  if (result.success && 'data' in result && result.data) {
    const filtered = result.data.prompts
      .filter((p: any) => activeTab === 'published' ? !p.isDraft : p.isDraft)
      .map((p: any) => ({
        ...p,
        user: {
          username: user.username || user.email?.split('@')[0] || 'user', // ✅ use username
          avatarUrl: user.avatarUrl || null
        },
        isOwner: true
      }))
    setPrompts(filtered)
  }
}
  const handleDelete = async (promptId: string) => {
    if (!user) return
    
    const result = await deletePrompt(promptId, user.id)
    if (result.success) {
      toast.success('Prompt deleted successfully')
      loadPrompts() // Refresh the list
    } else {
      toast.error(result.error?.message || 'Failed to delete')
    }
  }

  const handleEdit = (promptId: string) => {
    router.push(`/dashboard/prompts/${promptId}/edit`)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              My Prompts
            </h1>
            <p className="text-gray-400 mt-1">Manage and organize your prompts</p>
          </div>
          
          <Link
            href="/dashboard/prompts/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Prompt</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 font-medium transition relative ${
              activeTab === 'published'
                ? 'text-purple-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiFileText className="w-4 h-4" />
              <span>Published</span>
            </div>
            {activeTab === 'published' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 font-medium transition relative ${
              activeTab === 'drafts'
                ? 'text-purple-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiClock className="w-4 h-4" />
              <span>Drafts</span>
            </div>
            {activeTab === 'drafts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
            )}
          </button>
        </div>

        {/* Prompts List */}
        <PromptList 
          prompts={prompts} 
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </div>
  )
}