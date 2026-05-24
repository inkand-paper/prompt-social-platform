import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: true, liked: false })
    }

    const { searchParams } = new URL(request.url)
    const promptId = searchParams.get('promptId')

    if (!promptId) {
      return NextResponse.json({ success: false, error: 'Prompt ID required' }, { status: 400 })
    }

    const { data } = await supabase
      .from('prompt_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .maybeSingle()

    return NextResponse.json({ success: true, liked: !!data })
  } catch (error) {
    console.error('Check like error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}