// app/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import ProfilePageClient from './ProfilePageClient'

async function getProfile(username: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) return null

  const { count: promptsCount } = await supabase
    .from('prompts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('is_draft', false)
    .eq('visibility', 'public')

  // FIX: fetch both followers AND following count
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ])

  return {
    profile,
    promptsCount: promptsCount || 0,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await getProfile(username)

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Profile not found</h1>
          <p className="text-gray-400">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <ProfilePageClient
      profile={data.profile}
      promptsCount={data.promptsCount}
      initialFollowersCount={data.followersCount}
      initialFollowingCount={data.followingCount}
    />
  )
}