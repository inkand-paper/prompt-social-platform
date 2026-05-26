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

    if (!promptId) {
      return NextResponse.json({ success: false, error: 'Prompt ID required' }, { status: 400 })
    }

    if (action === 'like') {
      const { data: existing } = await supabase
        .from('prompt_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .maybeSingle()

      if (!existing) {
        await supabase.from('prompt_likes').insert({ user_id: user.id, prompt_id: promptId })

        // Update like_count — try RPC first, fallback to direct update
        const { error: rpcError } = await supabase.rpc('increment_prompt_likes', { prompt_id: promptId })
        if (rpcError) {
          const { data: current } = await supabase.from('prompts').select('like_count').eq('id', promptId).single()
          if (current) {
            await supabase.from('prompts').update({ like_count: (current.like_count || 0) + 1 }).eq('id', promptId)
          }
        }

        // Create notification (best-effort, don't fail the like if it errors)
        const { data: prompt } = await supabase.from('prompts').select('user_id').eq('id', promptId).single()
        if (prompt && prompt.user_id !== user.id) {
          try {
            await supabase.from('notifications').insert({
              user_id: prompt.user_id,
              actor_id: user.id,
              type: 'like',
              prompt_id: promptId,
            })
          } catch { /* best-effort */ }
        }
      }
    } else {
      await supabase.from('prompt_likes').delete().eq('user_id', user.id).eq('prompt_id', promptId)
      
      // Decrement like_count — try RPC first, fallback to direct update
      const { error: rpcError } = await supabase.rpc('decrement_prompt_likes', { prompt_id: promptId })
      if (rpcError) {
        const { data: current } = await supabase.from('prompts').select('like_count').eq('id', promptId).single()
        if (current) {
          await supabase.from('prompts').update({ like_count: Math.max(0, (current.like_count || 1) - 1) }).eq('id', promptId)
        }
      }
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
