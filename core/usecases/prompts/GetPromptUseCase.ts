import { IPromptRepository } from '@/core/repositories/IPromptRepository'

export class GetPromptUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(promptId: string, viewerId?: string) {
    if (!promptId) {
      return { 
        success: false, 
        error: { code: 'MISSING_ID', message: 'Prompt ID is required' } 
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
      
      // Check visibility permissions
      const canView = 
        prompt.visibility === 'public' ||
        (viewerId && prompt.userId === viewerId) ||
        (viewerId && prompt.visibility === 'unlisted')
      
      if (!canView) {
        return { 
          success: false, 
          error: { code: 'FORBIDDEN', message: 'You don\'t have permission to view this prompt' } 
        }
      }
      
      // Increment view count (async, don't wait for response)
      this.promptRepository.incrementViewCount(promptId).catch(() => {})
      
      return { success: true, data: prompt }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'FETCH_FAILED', message: error.message || 'Failed to fetch prompt' } 
      }
    }
  }
}