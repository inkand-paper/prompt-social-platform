import { supabase } from '@/infrastructure/database/SupabaseClient'
import { IPromptVersionRepository } from '@/core/repositories/IPromptVersionRepository'
import { PromptVersion } from '@/core/entities/PromptVersion'

export class SupabasePromptVersionRepository implements IPromptVersionRepository {
  async createVersion(
  promptId: string,
  versionNumber: number,
  title: string,
  content: string,
  promptText: string,
  changelog?: string
): Promise<PromptVersion> {
  console.log('Creating version:', { promptId, versionNumber, title })
  
  // First, verify the user owns this prompt
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    throw new Error('Not authenticated')
  }
  
  // Check if user owns the prompt
  const { data: prompt } = await supabase
    .from('prompts')
    .select('user_id')
    .eq('id', promptId)
    .single()
  
  if (!prompt || prompt.user_id !== user.user.id) {
    throw new Error('You do not own this prompt')
  }
  
  const { data, error } = await supabase
    .from('prompt_versions')
    .insert({
      prompt_id: promptId,
      version_number: versionNumber,
      title: title,
      content: content,
      prompt_text: promptText,
      changelog: changelog || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating version:', error)
    throw new Error(`Failed to create version: ${error.message}`)
  }

  console.log('Version created:', data)
  return this.mapToVersion(data)
}

  async getVersions(promptId: string): Promise<PromptVersion[]> {
    console.log('Getting versions for prompt:', promptId)
    
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false })

    if (error) {
      console.error('Error getting versions:', error)
      return []
    }

    console.log('Versions found:', data?.length || 0)
    return (data || []).map(v => this.mapToVersion(v))
  }

  async getLatestVersion(promptId: string): Promise<PromptVersion | null> {
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return this.mapToVersion(data)
  }

  async getVersion(promptId: string, versionNumber: number): Promise<PromptVersion | null> {
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', promptId)
      .eq('version_number', versionNumber)
      .single()

    if (error || !data) return null
    return this.mapToVersion(data)
  }

  async getNextVersionNumber(promptId: string): Promise<number> {
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('version_number')
      .eq('prompt_id', promptId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.log('No existing versions, starting at 1')
      return 1
    }
    
    const nextVersion = data.version_number + 1
    console.log('Next version number:', nextVersion)
    return nextVersion
  }

  private mapToVersion(data: any): PromptVersion {
    return {
      id: data.id,
      promptId: data.prompt_id,
      versionNumber: data.version_number,
      title: data.title,
      content: data.content,
      promptText: data.prompt_text,
      changelog: data.changelog,
      createdAt: new Date(data.created_at)
    }
  }
}