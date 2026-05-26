import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''
    const sort = searchParams.get('sort') || 'newest'   // newest | trending | most_saved
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    let dbQuery = supabase
      .from('prompts')
      .select(`
        id,
        title,
        content,
        description,
        prompt_text,
        like_count,
        save_count,
        view_count,
        tags,
        created_at,
        user_id,
        profiles:user_id (id, username, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('is_draft', false)
      .eq('visibility', 'public')

    // Full-text search on title + description + prompt_text
    if (query.trim()) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,prompt_text.ilike.%${query}%`
      )
    }

    // Tag filter — tags stored as text[] column
    if (tag.trim()) {
      dbQuery = dbQuery.contains('tags', [tag])
    }

    // Sorting
    switch (sort) {
      case 'trending':
        dbQuery = dbQuery
          .order('like_count', { ascending: false })
          .order('view_count', { ascending: false })
        break
      case 'most_saved':
        dbQuery = dbQuery.order('save_count', { ascending: false })
        break
      case 'oldest':
        dbQuery = dbQuery.order('created_at', { ascending: true })
        break
      case 'newest':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    const { data: prompts, error, count } = await dbQuery
      .range(offset, offset + limit - 1)

    if (error) throw error

    const items = (prompts || []).map((p) => {
      const prompt = p as unknown as {
        id: string; title: string; description: string | null; prompt_text: string;
        like_count: number; save_count: number; view_count: number; tags: string[];
        user_id: string; created_at: string; 
        profiles: { username: string; avatar_url: string | null } | null
      }
      return {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        promptText: prompt.prompt_text,
        likeCount: prompt.like_count ?? 0,
        saveCount: prompt.save_count ?? 0,
        viewCount: prompt.view_count ?? 0,
        tags: prompt.tags ?? [],
        createdAt: prompt.created_at,
        userId: prompt.user_id,
        user: prompt.profiles
          ? {
              username: prompt.profiles.username,
              avatarUrl: prompt.profiles.avatar_url,
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      items,
      total: count ?? 0,
      hasMore: (count ?? 0) > offset + limit,
      nextOffset: offset + limit,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
