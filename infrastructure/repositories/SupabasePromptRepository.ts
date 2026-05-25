import { supabase } from '@/infrastructure/database/SupabaseClient'
import { IPromptRepository, CreatePromptInput, UpdatePromptInput } from '@/core/repositories/IPromptRepository'
import { Prompt, PromptVisibility } from '@/core/entities/Prompt'

export class SupabasePromptRepository implements IPromptRepository {
  async create(input: CreatePromptInput): Promise<Prompt> {
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        user_id: input.userId,
        title: input.title,
        content: input.content,
        description: input.description || null,
        prompt_text: input.promptText,
        visibility: input.visibility || 'public',
        is_draft: input.isDraft !== undefined ? input.isDraft : true,
        published_at: !input.isDraft ? new Date().toISOString() : null,
        tags: input.tags || []
      })
      .select()
      .single()

    if (error) throw error

    // Handle tags
    if (input.tags && input.tags.length > 0) {
      const { data: tags } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', input.tags)

      if (tags) {
        const existingTagNames = tags.map(t => t.name)
        const newTags = input.tags.filter(t => !existingTagNames.includes(t))
        
        // Create new tags
        if (newTags.length > 0) {
          const { data: createdTags } = await supabase
            .from('tags')
            .insert(newTags.map(name => ({ name, slug: this.slugify(name) })))
            .select()
          
          const allTags = [...(tags || []), ...(createdTags || [])]
          
          // Link tags to prompt
          await supabase
            .from('prompt_tags')
            .insert(allTags.map(tag => ({ prompt_id: prompt.id, tag_id: tag.id })))
        } else {
          await supabase
            .from('prompt_tags')
            .insert(tags.map(tag => ({ prompt_id: prompt.id, tag_id: tag.id })))
        }
      }
    }

    return this.mapToPrompt(prompt)
  }

  async findById(id: string): Promise<Prompt | null> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*, prompt_tags(tags(*))')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.mapToPrompt(data)
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ prompts: Prompt[]; total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const prompts = await Promise.all((data || []).map(async (p) => this.mapToPrompt(p)))
    return { prompts, total: count || 0 }
  }

  async findByUsername(username: string, page: number = 1, limit: number = 10): Promise<{ prompts: Prompt[]; total: number }> {
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!user) return { prompts: [], total: 0 }

    return this.findByUserId(user.id, page, limit)
  }

  async update(id: string, userId: string, input: UpdatePromptInput): Promise<Prompt> {
    const updateData: any = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.description !== undefined) updateData.description = input.description
    if (input.promptText !== undefined) updateData.prompt_text = input.promptText
    if (input.visibility !== undefined) updateData.visibility = input.visibility
    if (input.isDraft !== undefined) {
      updateData.is_draft = input.isDraft
      if (!input.isDraft && !updateData.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }
    updateData.updated_at = new Date().toISOString()
    // Sync the tags[] column for search
    if (input.tags !== undefined) {
      updateData.tags = input.tags
    }

    const { data: prompt, error } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    // Update tags if provided
    if (input.tags !== undefined) {
      // Remove existing tags
      await supabase
        .from('prompt_tags')
        .delete()
        .eq('prompt_id', id)

      if (input.tags.length > 0) {
        const { data: tags } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', input.tags)

        if (tags) {
          const existingTagNames = tags.map(t => t.name)
          const newTags = input.tags.filter(t => !existingTagNames.includes(t))
          
          if (newTags.length > 0) {
            const { data: createdTags } = await supabase
              .from('tags')
              .insert(newTags.map(name => ({ name, slug: this.slugify(name) })))
              .select()
            
            const allTags = [...(tags || []), ...(createdTags || [])]
            await supabase
              .from('prompt_tags')
              .insert(allTags.map(tag => ({ prompt_id: id, tag_id: tag.id })))
          } else {
            await supabase
              .from('prompt_tags')
              .insert(tags.map(tag => ({ prompt_id: id, tag_id: tag.id })))
          }
        }
      }
    }

    return this.mapToPrompt(prompt)
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  async incrementViewCount(id: string): Promise<void> {
    await supabase.rpc('increment_prompt_views', { prompt_id: id })
  }

  async incrementLikeCount(id: string): Promise<void> {
    await supabase.rpc('increment_prompt_likes', { prompt_id: id })
  }

  async decrementLikeCount(id: string): Promise<void> {
    await supabase.rpc('decrement_prompt_likes', { prompt_id: id })
  }

  async incrementSaveCount(id: string): Promise<void> {
    await supabase.rpc('increment_prompt_saves', { prompt_id: id })
  }

  async decrementSaveCount(id: string): Promise<void> {
    await supabase.rpc('decrement_prompt_saves', { prompt_id: id })
  }

  async listPublic(page: number = 1, limit: number = 10, tag?: string): Promise<{ prompts: Prompt[]; total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('visibility', 'public')
      .eq('is_draft', false)
      .order('created_at', { ascending: false })

    if (tag) {
      const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', this.slugify(tag))
        .single()

      if (tagData) {
        const { data: promptIds } = await supabase
          .from('prompt_tags')
          .select('prompt_id')
          .eq('tag_id', tagData.id)

        if (promptIds && promptIds.length > 0) {
          query = query.in('id', promptIds.map(p => p.prompt_id))
        }
      }
    }

    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    const prompts = await Promise.all((data || []).map(async (p) => this.mapToPrompt(p)))
    return { prompts, total: count || 0 }
  }

  async listUserDrafts(userId: string, page: number = 1, limit: number = 10): Promise<{ prompts: Prompt[]; total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_draft', true)
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    const prompts = await Promise.all((data || []).map(async (p) => this.mapToPrompt(p)))
    return { prompts, total: count || 0 }
  }

  async checkOwnership(promptId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', promptId)
      .eq('user_id', userId)
      .single()

    return !error && !!data
  }

  private async mapToPrompt(data: any): Promise<Prompt> {
  // Use the tags[] column if available (avoids extra DB query)
  let tags: string[] = []
  if (Array.isArray(data.tags) && data.tags.length > 0) {
    tags = data.tags
  } else {
    // Fallback: read from prompt_tags join table
    const { data: promptTags } = await supabase
      .from('prompt_tags')
      .select('tags(name)')
      .eq('prompt_id', data.id)
    if (promptTags) {
      tags = promptTags.map((pt: any) => pt.tags?.name).filter(Boolean)
    }
  }

  // Get username and avatar from profiles
  let username = 'unknown'
  let userAvatar = null
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', data.user_id)
    .single()

  if (profile) {
    username = profile.username
    userAvatar = profile.avatar_url
  }

  return {
    id: data.id,
    userId: data.user_id,
    username,
    userAvatar,
    title: data.title,
    content: data.content,
    description: data.description,
    promptText: data.prompt_text,
    visibility: data.visibility as PromptVisibility,
    isDraft: data.is_draft,
    viewCount: data.view_count || 0,
    likeCount: data.like_count || 0,
    saveCount: data.save_count || 0,
    tags,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    publishedAt: data.published_at ? new Date(data.published_at) : null
  }
}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}