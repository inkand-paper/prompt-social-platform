'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { PromptList } from '@/presentation/components/prompts/PromptList'
import Link from 'next/link'
import { FiPlus, FiEdit } from 'react-icons/fi'

export default function DraftsPage() {
  const { user } = useAuth()
  const { getUserPrompts, loading } = usePrompts()
  const [drafts, setDrafts] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadDrafts()
    }
  }, [user])

  const loadDrafts = async () => {
    if (!user) return
    
    const result = await getUserPrompts(user.id)
    if (result.success && 'data' in result && result.data) {
      const draftsOnly = result.data.prompts.filter((p: any) => p.isDraft)
      setDrafts(draftsOnly)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Drafts
            </h1>
            <p className="text-gray-400 mt-1">Continue working on your drafts</p>
          </div>
          
          <Link
            href="/dashboard/prompts/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Prompt</span>
          </Link>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
            <FiEdit className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No drafts yet</h3>
            <p className="text-gray-500">Create a new prompt to get started</p>
            <Link
              href="/dashboard/prompts/new"
              className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Create Prompt
            </Link>
          </div>
        ) : (
          <PromptList prompts={drafts} loading={loading} />
        )}
      </div>
    </div>
  )
}