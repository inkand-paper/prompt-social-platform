import { IPromptRepository } from '@/core/repositories/IPromptRepository'
import { PromptValidator } from '@/core/usecases/validators/PromptValidator'

export class PublishPromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(promptId: string, userId: string) {
    // Check ownership
    const isOwner = await this.promptRepository.checkOwnership(promptId, userId)
    if (!isOwner) {
      return { 
        success: false, 
        error: { code: 'FORBIDDEN', message: 'You don\'t own this prompt' } 
      }
    }
    
    try {
      const prompt = await this.promptRepository.findById(promptId)
      
      if (!prompt) {
        return { 
          success: false, 
          error: { code: 'NOT_FOUND', message: 'Prompt not found' } 
        }
      }
      
      // Validate before publishing
      const validation = PromptValidator.validate({
        title: prompt.title,
        content: prompt.content,
        promptText: prompt.promptText,
        description: prompt.description,
        visibility: prompt.visibility
      })
      
      if (!validation.isValid) {
        return { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Cannot publish: ' + (validation.errors?.join(', ') || 'Invalid data') 
          } 
        }
      }
      
      const updatedPrompt = await this.promptRepository.update(promptId, userId, {
        isDraft: false
      })
      
      return { success: true, data: updatedPrompt }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'PUBLISH_FAILED', message: error.message || 'Failed to publish prompt' } 
      }
    }
  }
}