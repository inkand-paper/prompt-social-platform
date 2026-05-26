import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    const { data: prompts, error } = await supabase
      .from('prompts')
      .select(`id, title, description, prompt_text, like_count, save_count, view_count, tags, created_at, user_id, profiles:user_id (id, username, avatar_url)`)
      .eq('is_draft', false)
      .eq('visibility', 'public')
      .order('like_count', { ascending: false })
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) throw error

    const items = (prompts || []).map((p: any) => ({
      id: p.id, title: p.title, description: p.description,
      promptText: p.prompt_text, likeCount: p.like_count || 0,
      saveCount: p.save_count || 0, viewCount: p.view_count || 0,
      tags: p.tags || [], createdAt: p.created_at,
      userId: p.user_id, username: p.profiles?.username, userAvatar: p.profiles?.avatar_url,
    }))

    return NextResponse.json({ success: true, items })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
