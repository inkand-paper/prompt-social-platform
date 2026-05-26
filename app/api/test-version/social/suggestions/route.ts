import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get IDs the current user already follows
    const { data: following } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = (following || []).map(f => f.following_id)
    // Always exclude self
    const excludeIds = [...followingIds, user.id]

    // Fetch random public profiles not yet followed
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .not('username', 'is', null)
      .limit(10)

    // Shuffle and take 5
    const shuffled = (profiles || []).sort(() => Math.random() - 0.5).slice(0, 5)

    return NextResponse.json({ success: true, profiles: shuffled })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json({ success: false, profiles: [] }, { status: 500 })
  }
}
