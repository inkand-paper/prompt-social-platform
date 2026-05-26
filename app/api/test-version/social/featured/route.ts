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

    const items = (prompts || []).map((p) => {
      const prompt = p as unknown as { 
        id: string; title: string; description: string | null; prompt_text: string; 
        like_count: number; save_count: number; view_count: number; tags: string[]; 
        user_id: string; created_at: string; profiles: { username: string; avatar_url: string | null } | null 
      }
      return {
        id: prompt.id, title: prompt.title, description: prompt.description,
        promptText: prompt.prompt_text, likeCount: prompt.like_count || 0,
        saveCount: prompt.save_count || 0, viewCount: prompt.view_count || 0,
        tags: prompt.tags || [], createdAt: prompt.created_at,
        userId: prompt.user_id, username: prompt.profiles?.username, userAvatar: prompt.profiles?.avatar_url,
      }
    })

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Featured items error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
