import { IPromptRepository } from '@/core/repositories/IPromptRepository'

export class DeletePromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(promptId: string, userId: string) {
    if (!promptId) {
      return { 
        success: false, 
        error: { code: 'MISSING_ID', message: 'Prompt ID is required' } 
      }
    }
    
    // Check ownership
    const isOwner = await this.promptRepository.checkOwnership(promptId, userId)
    if (!isOwner) {
      return { 
        success: false, 
        error: { code: 'FORBIDDEN', message: 'You don\'t own this prompt' } 
      }
    }
    
    try {
      await this.promptRepository.delete(promptId, userId)
      return { success: true, data: { message: 'Prompt deleted successfully' } }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'DELETE_FAILED', message: error.message || 'Failed to delete prompt' } 
      }
    }
  }
}