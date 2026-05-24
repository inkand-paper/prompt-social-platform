import { IPromptRepository, UpdatePromptInput } from '@/core/repositories/IPromptRepository'
import { IPromptVersionRepository } from '@/core/repositories/IPromptVersionRepository'
import { ITagRepository } from '@/core/repositories/ITagRepository'
import { PromptValidator } from '@/core/usecases/validators/PromptValidator'

export class UpdatePromptUseCase {
  constructor(
    private promptRepository: IPromptRepository,
    private versionRepository: IPromptVersionRepository,
    private tagRepository: ITagRepository
  ) {}

  async execute(
    promptId: string,
    userId: string,
    input: {
      title?: string
      content?: string
      description?: string
      promptText?: string
      visibility?: 'public' | 'unlisted' | 'private'
      isDraft?: boolean
      tags?: string[]
      changelog?: string
    }
  ) {
    // Check ownership
    const isOwner = await this.promptRepository.checkOwnership(promptId, userId)
    if (!isOwner) {
      return { 
        success: false, 
        error: { code: 'FORBIDDEN', message: 'You don\'t own this prompt' } 
      }
    }
    
    // Get current prompt for versioning
    const currentPrompt = await this.promptRepository.findById(promptId)
    if (!currentPrompt) {
      return { 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Prompt not found' } 
      }
    }
    
    // Check if content actually changed
    const hasContentChanged = 
      (input.title !== undefined && input.title !== currentPrompt.title) ||
      (input.content !== undefined && input.content !== currentPrompt.content) ||
      (input.promptText !== undefined && input.promptText !== currentPrompt.promptText)
    
    console.log('Content changed:', hasContentChanged)
    console.log('Is draft:', currentPrompt.isDraft, '->', input.isDraft)
    
    // Create version ONLY if:
    // 1. Content actually changed
    // 2. The prompt is NOT a draft (published)
    // 3. The update is NOT setting it to draft (unpublishing)
    const shouldCreateVersion = hasContentChanged && !currentPrompt.isDraft && input.isDraft !== true
    
    if (shouldCreateVersion) {
      try {
        const nextVersion = await this.versionRepository.getNextVersionNumber(promptId)
        console.log('Creating version:', nextVersion)
        
        await this.versionRepository.createVersion(
          promptId,
          nextVersion,
          input.title || currentPrompt.title,
          input.content || currentPrompt.content,
          input.promptText || currentPrompt.promptText,
          input.changelog || `Version ${nextVersion} update`
        )
      } catch (error) {
        console.error('Failed to create version:', error)
        // Don't fail the whole update if version creation fails
      }
    }
    
    // Update prompt
    const updateInput: UpdatePromptInput = {}
    if (input.title !== undefined) updateInput.title = input.title
    if (input.content !== undefined) updateInput.content = input.content
    if (input.description !== undefined) updateInput.description = input.description
    if (input.promptText !== undefined) updateInput.promptText = input.promptText
    if (input.visibility !== undefined) updateInput.visibility = input.visibility
    if (input.isDraft !== undefined) updateInput.isDraft = input.isDraft
    if (input.tags !== undefined) updateInput.tags = input.tags
    
    try {
      const updatedPrompt = await this.promptRepository.update(promptId, userId, updateInput)
      return { success: true, data: updatedPrompt }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'UPDATE_FAILED', message: error.message || 'Failed to update prompt' } 
      }
    }
  }
}