import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const promptId = searchParams.get('promptId')

    if (!promptId) {
      return NextResponse.json({ success: false, error: 'Prompt ID required' }, { status: 400 })
    }

    // Get all comments for this prompt
    const { data: comments, error } = await supabase
      .from('prompt_comments')
      .select(`
        *,
        profiles:user_id (id, username, avatar_url)
      `)
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Format comments with user data
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      username: comment.profiles?.username || 'unknown',
      userAvatar: comment.profiles?.avatar_url,
      content: comment.content,
      likeCount: comment.like_count,
      parentId: comment.parent_id,
      createdAt: new Date(comment.created_at),
      replies: []
    }))

    interface Comment {
      id: string;
      userId: string;
      username: string;
      userAvatar: string | null;
      content: string;
      likeCount: number;
      parentId: string | null;
      createdAt: Date;
      replies: Comment[];
    }

    // Build comment tree
    const commentMap = new Map<string, Comment>()
    const topLevelComments: Comment[] = []

    formattedComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    formattedComments.forEach(comment => {
      const current = commentMap.get(comment.id)
      if (!current) return

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(current)
        }
      } else {
        topLevelComments.push(current)
      }
    })

    return NextResponse.json({ success: true, comments: topLevelComments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { promptId, content, parentId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content required' }, { status: 400 })
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('prompt_comments')
      .insert({
        user_id: user.id,
        prompt_id: promptId,
        parent_id: parentId || null,
        content: content.trim()
      })
      .select()
      .single()

    if (error) throw error

    // Get prompt owner for notification
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
          type: parentId ? 'reply' : 'comment',
          prompt_id: promptId,
          comment_id: comment.id,
        })
    }

    // If reply, notify parent comment owner
    if (parentId) {
      const { data: parentComment } = await supabase
        .from('prompt_comments')
        .select('user_id')
        .eq('id', parentId)
        .single()

      if (parentComment && parentComment.user_id !== user.id && parentComment.user_id !== prompt?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: parentComment.user_id,
            actor_id: user.id,
            type: 'reply',
            prompt_id: promptId,
            comment_id: comment.id,
          })
      }
    }

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error('Post comment error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ success: false, error: 'Comment ID required' }, { status: 400 })
    }

    // Verify ownership
    const { data: comment } = await supabase
      .from('prompt_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!comment || comment.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    await supabase.from('prompt_comments').delete().eq('id', commentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}