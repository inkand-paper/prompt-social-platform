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

    if (action === 'save') {
      const { data: existing } = await supabase
        .from('prompt_saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single()

      if (!existing) {
        await supabase
          .from('prompt_saves')
          .insert({ user_id: user.id, prompt_id: promptId })
      }
    } else {
      await supabase
        .from('prompt_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
    }

    const { count } = await supabase
      .from('prompt_saves')
      .select('id', { count: 'exact', head: true })
      .eq('prompt_id', promptId)

    return NextResponse.json({
      success: true,
      saved: action === 'save',
      saveCount: count || 0,
      total: count || 0
    })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}