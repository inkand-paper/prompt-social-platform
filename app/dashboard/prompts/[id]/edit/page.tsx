'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { PromptEditor } from '@/presentation/components/prompts/PromptEditor'
import { PromptVersionHistory } from '@/presentation/components/prompts/PromptVersionHistory'
import { toast } from 'sonner'
import { FiArrowLeft, FiGitBranch } from 'react-icons/fi'

export default function EditPromptPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { getPrompt, updatePrompt, getVersions } = usePrompts()
  const [prompt, setPrompt] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const promptId = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    if (user && promptId) {
      loadPrompt()
      loadVersions()
    }
  }, [promptId, user])

  const loadPrompt = async () => {
    if (!user || !promptId) return
    
    try {
      const result = await getPrompt(promptId, user.id)
      if (result.success && 'data' in result && result.data) {
        if (result.data.userId !== user.id) {
          toast.error('You don\'t have permission to edit this prompt')
          router.push('/dashboard/prompts')
          return
        }
        setPrompt(result.data)
      } else {
        toast.error('Prompt not found')
        router.push('/dashboard/prompts')
      }
    } catch (error) {
      console.error('Error loading prompt:', error)
      toast.error('Failed to load prompt')
    } finally {
      setLoading(false)
    }
  }

  const loadVersions = async () => {
    if (!promptId) return
    
    try {
      const result = await getVersions(promptId)
      if (result.success && 'data' in result && result.data) {
        setVersions(result.data)
        console.log('Loaded versions:', result.data.length)
      } else {
        setVersions([])
      }
    } catch (error) {
      console.error('Error loading versions:', error)
      setVersions([])
    }
  }

  const handleSave = async (data: any) => {
    if (!user || !prompt) return

    setLoading(true)
    try {
      const result = await updatePrompt(prompt.id, user.id, {
        title: data.title,
        content: data.content,
        description: data.description,
        promptText: data.promptText,
        visibility: data.visibility,
        isDraft: data.isDraft,
        tags: data.tags,
        changelog: data.changelog || 'Updated prompt'
      })

      if (result.success) {
        toast.success(data.isDraft ? 'Draft saved' : 'Prompt updated')
        // Reload versions after save
        await loadVersions()
        router.push(`/dashboard/prompts/${prompt.id}`)
      } else {
        toast.error(result.error?.message || 'Failed to update')
      }
    } catch (error) {
      toast.error('An error occurred while saving')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Prompt</span>
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Edit Prompt
            </h1>
            <p className="text-gray-400 mt-1">Update your prompt content</p>
            {!prompt.isDraft && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Each time you save changes to a published prompt, a new version is created
              </p>
            )}
          </div>
          
          {/* Always show version button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center space-x-2"
          >
            <FiGitBranch className="w-4 h-4" />
            <span>
              {showHistory 
                ? 'Hide History' 
                : versions.length > 0 
                  ? `Show History (${versions.length} versions)` 
                  : 'Version History (0)'}
            </span>
          </button>
        </div>

        {/* Version History Panel */}
        {showHistory && (
          <div className="mb-8">
            <PromptVersionHistory 
              versions={versions} 
              onRestore={async (versionNumber) => {
                const version = versions.find((v: any) => v.versionNumber === versionNumber)
                if (version && confirm(`Restore version ${versionNumber}? Current content will be replaced.`)) {
                  setPrompt({
                    ...prompt,
                    title: version.title,
                    content: version.content,
                    promptText: version.promptText || version.prompt_text
                  })
                  toast.success(`Restored version ${versionNumber}. Click Save to keep changes.`)
                }
              }}
            />
          </div>
        )}

        <PromptEditor
          initialData={prompt}
          onSave={handleSave}
          isLoading={loading}
        />
      </div>
    </div>
  )
}