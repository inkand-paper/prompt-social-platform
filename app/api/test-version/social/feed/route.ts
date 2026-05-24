import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'following'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('prompts')
      .select(`
        *,
        profiles:user_id (id, username, full_name, avatar_url)
      `)
      .eq('is_draft', false)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (type === 'following') {
      // Get users that the current user follows
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = following?.map(f => f.following_id) || []
      
      if (followingIds.length === 0) {
        return NextResponse.json({ success: true, items: [], hasMore: false })
      }
      
      query = query.in('user_id', followingIds)
    } else if (type === 'trending') {
      // Order by engagement score
      query = query.order('like_count', { ascending: false }).order('view_count', { ascending: false })
    }

    const { data: prompts, error, count } = await query
      .range(offset, offset + limit - 1)
      .overrideTypes<Array<{
        id: string
        title: string
        content: string
        description: string | null
        prompt_text: string
        like_count: number
        save_count: number
        view_count: number
        created_at: string
        profiles: { id: string; username: string; full_name: string | null; avatar_url: string | null }
      }>>()

    if (error) throw error

    // Check if user liked/saved each prompt
    const items = await Promise.all((prompts || []).map(async (prompt: any) => {
      const [isLiked, isSaved] = await Promise.all([
        supabase.from('prompt_likes').select('id').eq('user_id', user.id).eq('prompt_id', prompt.id).maybeSingle(),
        supabase.from('prompt_saves').select('id').eq('user_id', user.id).eq('prompt_id', prompt.id).maybeSingle(),
      ])

      return {
        id: prompt.id,
        type: 'prompt',
        prompt: {
          id: prompt.id,
          title: prompt.title,
          content: prompt.content,
          description: prompt.description,
          promptText: prompt.prompt_text,
          likeCount: prompt.like_count,
          saveCount: prompt.save_count,
          viewCount: prompt.view_count,
          createdAt: new Date(prompt.created_at),
          userId: prompt.user_id,
          username: prompt.profiles?.username,
          userAvatar: prompt.profiles?.avatar_url,
          tags: [],
          isLiked: !!isLiked.data,
          isSaved: !!isSaved.data,
        },
        createdAt: new Date(prompt.created_at),
      }
    }))

    return NextResponse.json({
      success: true,
      items,
      hasMore: (count || 0) > offset + limit,
      nextOffset: offset + limit
    })
  } catch (error) {
    console.error('Feed error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}