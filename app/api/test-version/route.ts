import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const promptId = searchParams.get('promptId')
  
  if (!promptId) {
    return NextResponse.json({ error: 'Missing promptId' }, { status: 400 })
  }
  
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  
  // Get current prompt
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', promptId)
    .single()
  
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }
  
  // Check ownership
  if (prompt.user_id !== user.id) {
    return NextResponse.json({ error: 'You don\'t own this prompt' }, { status: 403 })
  }
  
  // Get next version number
  const { data: versions } = await supabase
    .from('prompt_versions')
    .select('version_number')
    .eq('prompt_id', promptId)
    .order('version_number', { ascending: false })
    .limit(1)
  
  const nextVersion = (versions?.[0]?.version_number || 0) + 1
  
  // Create a test version
  const { data: newVersion, error } = await supabase
    .from('prompt_versions')
    .insert({
      prompt_id: promptId,
      version_number: nextVersion,
      title: prompt.title + ` (v${nextVersion})`,
      content: prompt.content,
      prompt_text: prompt.prompt_text,
      changelog: `Test version ${nextVersion} - Created via API`
    })
    .select()
  
  if (error) {
    console.error('Error creating version:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ 
    success: true, 
    version: newVersion,
    message: `Created version ${nextVersion}`
  })
}