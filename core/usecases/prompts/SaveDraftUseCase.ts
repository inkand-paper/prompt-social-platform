import { IPromptRepository } from '@/core/repositories/IPromptRepository'

export class SaveDraftUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(promptId: string, userId: string) {
    const isOwner = await this.promptRepository.checkOwnership(promptId, userId)
    if (!isOwner) {
      return { 
        success: false, 
        error: { code: 'FORBIDDEN', message: 'You don\'t own this prompt' } 
      }
    }
    
    try {
      const updatedPrompt = await this.promptRepository.update(promptId, userId, {
        isDraft: true
      })
      
      return { success: true, data: updatedPrompt }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'SAVE_FAILED', message: error.message || 'Failed to save as draft' } 
      }
    }
  }
}