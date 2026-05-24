import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { promptId, action } = await request.json()

    if (action === 'like') {
      const { data: existing } = await supabase
        .from('prompt_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single()

      if (!existing) {
        await supabase
          .from('prompt_likes')
          .insert({ user_id: user.id, prompt_id: promptId })

        const { data: prompt } = await supabase
          .from('prompts')
          .select('user_id')
          .eq('id', promptId)
          .single()

        if (prompt && prompt.user_id !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: prompt.user_id,
              actor_id: user.id,
              type: 'like',
              prompt_id: promptId,
            })
        }
      }
    } else {
      await supabase
        .from('prompt_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
    }

    const { count } = await supabase
      .from('prompt_likes')
      .select('id', { count: 'exact', head: true })
      .eq('prompt_id', promptId)

    return NextResponse.json({
      success: true,
      liked: action === 'like',
      likeCount: count || 0
    })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}