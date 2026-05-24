'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { PromptEditor } from '@/presentation/components/prompts/PromptEditor'
import { toast } from 'sonner'
import { FiArrowLeft } from 'react-icons/fi'

export default function NewPromptPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createPrompt } = usePrompts()

  const handleSave = async (data: any) => {
    if (!user) {
      toast.error('You must be logged in')
      return
    }

    const result = await createPrompt(user.id, {
      title: data.title,
      content: data.content,
      description: data.description,
      promptText: data.promptText,
      visibility: data.visibility,
      isDraft: data.isDraft,
      tags: data.tags
    })

    if (result.success) {
      toast.success(data.isDraft ? 'Draft saved successfully' : 'Prompt created successfully')
      router.push('/dashboard/prompts')
    } else {
      toast.error(result.error?.message || 'Failed to create prompt')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Prompts</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Create New Prompt
          </h1>
          <p className="text-gray-400 mt-1">Share your AI prompt with the community</p>
        </div>

        <PromptEditor onSave={handleSave} />
      </div>
    </div>
  )
}