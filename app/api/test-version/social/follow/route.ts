import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (user.id === userId) {
      return NextResponse.json({ success: false, error: 'Cannot follow yourself' }, { status: 400 })
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle()

      if (!existing) {
        await supabase
          .from('user_follows')
          .insert({ follower_id: user.id, following_id: userId })

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            actor_id: user.id,
            type: 'follow',
          })
      }
    } else {
      // Unfollow
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)
    }

    // Get updated counts
    const { count: followersCount } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId)

    const { count: followingCount } = await supabase
      .from('user_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId)

    return NextResponse.json({
      success: true,
      following: action === 'follow',
      followersCount: followersCount || 0,
      followingCount: followingCount || 0
    })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}