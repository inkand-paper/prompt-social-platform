import { supabase } from '@/infrastructure/database/SupabaseClient'
import { ITagRepository } from '@/core/repositories/ITagRepository'
import { PromptTag } from '@/core/entities/PromptTag'

export class SupabaseTagRepository implements ITagRepository {
  async findOrCreate(tagNames: string[]): Promise<PromptTag[]> {
    const tags: PromptTag[] = []

    for (const name of tagNames) {
      const slug = this.slugify(name)
      
      // Try to find existing tag
      let { data: existing } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!existing) {
        // Create new tag
        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({ name, slug, usage_count: 0 })
          .select()
          .single()

        if (!error && newTag) {
          existing = newTag
        }
      }

      if (existing) {
        tags.push(this.mapToTag(existing))
      }
    }

    return tags
  }

  async incrementUsage(tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      await supabase.rpc('increment_tag_usage', { tag_id: tagId })
    }
  }

  async decrementUsage(tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      await supabase.rpc('decrement_tag_usage', { tag_id: tagId })
    }
  }

  async getPopularTags(limit: number = 10): Promise<PromptTag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(t => this.mapToTag(t))
  }

  async searchTags(query: string, limit: number = 10): Promise<PromptTag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(t => this.mapToTag(t))
  }

  async getPromptTags(promptId: string): Promise<PromptTag[]> {
    const { data, error } = await supabase
      .from('prompt_tags')
      .select('tags(*)')
      .eq('prompt_id', promptId)

    if (error) throw error
    return (data || []).map((item: any) => this.mapToTag(item.tags))
  }

  async addTagsToPrompt(promptId: string, tagIds: string[]): Promise<void> {
    const inserts = tagIds.map(tagId => ({ prompt_id: promptId, tag_id: tagId }))
    
    const { error } = await supabase
      .from('prompt_tags')
      .insert(inserts)

    if (error) throw error
    
    await this.incrementUsage(tagIds)
  }

  async removeTagsFromPrompt(promptId: string, tagIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('prompt_tags')
      .delete()
      .eq('prompt_id', promptId)
      .in('tag_id', tagIds)

    if (error) throw error
    
    await this.decrementUsage(tagIds)
  }

  async replacePromptTags(promptId: string, tagIds: string[]): Promise<void> {
    // Get current tags
    const currentTags = await this.getPromptTags(promptId)
    const currentTagIds = currentTags.map(t => t.id)
    
    // Tags to remove
    const toRemove = currentTagIds.filter(id => !tagIds.includes(id))
    if (toRemove.length > 0) {
      await this.removeTagsFromPrompt(promptId, toRemove)
    }
    
    // Tags to add
    const toAdd = tagIds.filter(id => !currentTagIds.includes(id))
    if (toAdd.length > 0) {
      await this.addTagsToPrompt(promptId, toAdd)
    }
  }

  private mapToTag(data: any): PromptTag {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      usageCount: data.usage_count || 0,
      createdAt: new Date(data.created_at)
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