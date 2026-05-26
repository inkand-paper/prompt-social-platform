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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: savedPrompts, error, count } = await supabase
      .from('prompt_saves')
      .select(`
        id,
        created_at,
        prompts:prompt_id (id, title, prompt_text, description)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const formattedPrompts = (savedPrompts || []).map(save => {
      const p = save.prompts as unknown as { id: string; title: string; prompt_text: string; description: string | null } | null
      return {
        id: save.id,
        prompt_id: p?.id,
        title: p?.title,
        prompt_text: p?.prompt_text,
        description: p?.description,
        saved_at: new Date(save.created_at),
      };
    })

    return NextResponse.json({
      success: true,
      savedPrompts: formattedPrompts,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error('Get saved prompts error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}