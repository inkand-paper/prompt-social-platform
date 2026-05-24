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

    const items = (prompts || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      promptText: p.prompt_text,
      likeCount: p.like_count ?? 0,
      saveCount: p.save_count ?? 0,
      viewCount: p.view_count ?? 0,
      tags: p.tags ?? [],
      createdAt: p.created_at,
      userId: p.user_id,
      user: p.profiles
        ? {
            username: p.profiles.username,
            avatarUrl: p.profiles.avatar_url,
          }
        : null,
    }))

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
