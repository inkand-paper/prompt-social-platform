import { IPromptRepository } from '@/core/repositories/IPromptRepository'

export class ListUserPromptsUseCase {
  constructor(private promptRepository: IPromptRepository) {}

  async execute(userId: string, page: number = 1, limit: number = 10) {
    if (!userId) {
      return { 
        success: false, 
        error: { code: 'MISSING_USER', message: 'User ID is required' } 
      }
    }
    
    try {
      const result = await this.promptRepository.findByUserId(userId, page, limit)
      return { 
        success: true, 
        data: {
          prompts: result.prompts,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: { code: 'FETCH_FAILED', message: error.message || 'Failed to fetch prompts' } 
      }
    }
  }
}