'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePrompts } from '@/presentation/hooks/usePrompts'
import { PromptList } from '@/presentation/components/prompts/PromptList'
import { createClient } from '@/lib/supabase/client'
import { FiArrowLeft } from 'react-icons/fi'

export default function UserPromptsPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { getUserPrompts, loading } = usePrompts()
  const [prompts, setPrompts] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    loadUserAndPrompts()
  }, [username])

  const loadUserAndPrompts = async () => {
    const supabase = createClient()
    
    // Get user by username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('username', username)
      .single()

    if (profile) {
      setUserProfile(profile)
      
      const result = await getUserPrompts(profile.id)
      if (result.success && 'data' in result && result.data) {
        // Only show published prompts
        const publishedOnly = result.data.prompts
          .filter((p: any) => !p.isDraft && p.visibility === 'public')
          .map((p: any) => ({
            ...p,
            user: {
              username: profile.username,
              avatarUrl: profile.avatar_url
            }
          }))
        setPrompts(publishedOnly)
      }
    }
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
          <span>Back</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {userProfile?.full_name || username}'s Prompts
          </h1>
          <p className="text-gray-400 mt-1">Public prompts shared by this user</p>
        </div>

        <PromptList prompts={prompts} loading={loading} />
      </div>
    </div>
  )
}