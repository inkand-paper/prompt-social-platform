'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/presentation/hooks/useAuth'
import { ProfileSettingsForm } from '@/presentation/components/profile/ProfileSettingsForm'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { User } from '@/core/entities/User'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ProfileSettingsPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const userRepository = (new SupabaseUserRepository() as any)

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/')
      return
    }

    const loadUser = async () => {
      if (authUser) {
        const fullUser = await userRepository.findById(authUser.id)
        setUser(fullUser)
      }
      setLoading(false)
    }

    loadUser()
  }, [authUser, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href={`/profile/${user.username}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400 mb-8">Update your profile information and how others see you</p>

          <ProfileSettingsForm
            user={user}
            profileRepository={userRepository}
            onUpdate={setUser}
          />
        </div>
      </div>
    </div>
  )
}