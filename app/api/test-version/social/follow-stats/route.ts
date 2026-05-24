import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const [followersResult, followingResult] = await Promise.all([
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
    ])

    return NextResponse.json({
      success: true,
      followers: followersResult.count || 0,
      following: followingResult.count || 0
    })
  } catch (error) {
    console.error('Follow stats error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}