import { IPromptRepository, CreatePromptInput } from '@/core/repositories/IPromptRepository'
import { ITagRepository } from '@/core/repositories/ITagRepository'
import { PromptValidator } from '@/core/usecases/validators/PromptValidator'

export class CreatePromptUseCase {
  constructor(
    private promptRepository: IPromptRepository,
    private tagRepository: ITagRepository
  ) {}

  async execute(input: {
    userId: string
    title: string
    content: string
    description?: string
    promptText: string
    visibility?: 'public' | 'unlisted' | 'private'
    isDraft?: boolean
    tags?: string[]
  }) {
    // Validate input
    const validation = PromptValidator.validate(input)
    if (!validation.isValid) {
      return { 
        success: false, 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: validation.errors?.join(', ') || 'Invalid input' 
        } 
      }
    }
    
    // Validate tags
    if (input.tags && !PromptValidator.validateTags(input.tags)) {
      return { 
        success: false, 
        error: { 
          code: 'INVALID_TAGS', 
          message: 'Invalid tags. Max 10 tags, each max 30 chars, only letters, numbers, hyphens, underscores, and Chinese characters allowed' 
        } 
      }
    }
    
    try {
      // Create prompt
      const createInput: CreatePromptInput = {
        userId: input.userId,
        title: input.title,
        content: input.content,
        description: input.description,
        promptText: input.promptText,
        visibility: input.visibility || 'public',
        isDraft: input.isDraft !== undefined ? input.isDraft : true,
        tags: input.tags
      }
      
      const prompt = await this.promptRepository.create(createInput)
      
      return { success: true, data: prompt }
    } catch (error: any) {
      return { 
        success: false, 
        error: { 
          code: 'CREATE_FAILED', 
          message: error.message || 'Failed to create prompt' 
        } 
      }
    }
  }
}