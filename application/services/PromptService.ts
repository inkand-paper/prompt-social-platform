import { IPromptRepository } from '@/core/repositories/IPromptRepository'
import { IPromptVersionRepository } from '@/core/repositories/IPromptVersionRepository'
import { ITagRepository } from '@/core/repositories/ITagRepository'
import { IUserRepository } from '@/core/repositories/IUserRepository'
import { CreatePromptUseCase } from '@/core/usecases/prompts/CreatePromptUseCase'
import { GetPromptUseCase } from '@/core/usecases/prompts/GetPromptUseCase'
import { UpdatePromptUseCase } from '@/core/usecases/prompts/UpdatePromptUseCase'
import { DeletePromptUseCase } from '@/core/usecases/prompts/DeletePromptUseCase'
import { ListUserPromptsUseCase } from '@/core/usecases/prompts/ListUserPromptsUseCase'
import { PublishPromptUseCase } from '@/core/usecases/prompts/PublishPromptUseCase'
import { SaveDraftUseCase } from '@/core/usecases/prompts/SaveDraftUseCase'
import { CreatePromptDTO, UpdatePromptDTO } from '@/application/dto/CreatePromptDTO'
import { mapToPromptResponse, mapToVersionDTO } from '@/application/dto/PromptDTO'

export class PromptService {
  private createPromptUseCase: CreatePromptUseCase
  private getPromptUseCase: GetPromptUseCase
  private updatePromptUseCase: UpdatePromptUseCase
  private deletePromptUseCase: DeletePromptUseCase
  private listUserPromptsUseCase: ListUserPromptsUseCase
  private publishPromptUseCase: PublishPromptUseCase
  private saveDraftUseCase: SaveDraftUseCase

  constructor(
    private promptRepository: IPromptRepository,
    private versionRepository: IPromptVersionRepository,
    private tagRepository: ITagRepository,
    private userRepository: IUserRepository
  ) {
    this.createPromptUseCase = new CreatePromptUseCase(promptRepository, tagRepository)
    this.getPromptUseCase = new GetPromptUseCase(promptRepository)
    this.updatePromptUseCase = new UpdatePromptUseCase(promptRepository, versionRepository, tagRepository)
    this.deletePromptUseCase = new DeletePromptUseCase(promptRepository)
    this.listUserPromptsUseCase = new ListUserPromptsUseCase(promptRepository)
    this.publishPromptUseCase = new PublishPromptUseCase(promptRepository)
    this.saveDraftUseCase = new SaveDraftUseCase(promptRepository)
  }

  async createPrompt(userId: string, input: CreatePromptDTO) {
    return await this.createPromptUseCase.execute({ userId, ...input })
  }

  async getPrompt(promptId: string, viewerId?: string) {
    const result = await this.getPromptUseCase.execute(promptId, viewerId)
    
    if (result.success && result.data) {
      const user = await this.userRepository.findById(result.data.userId)
      return {
        ...result,
        data: mapToPromptResponse(result.data, user ? { username: user.username, avatarUrl: user.avatarUrl } : undefined)
      }
    }
    
    return result
  }

  async updatePrompt(promptId: string, userId: string, input: UpdatePromptDTO) {
    const result = await this.updatePromptUseCase.execute(promptId, userId, input)
    
    if (result.success && result.data) {
      const user = await this.userRepository.findById(result.data.userId)
      return {
        ...result,
        data: mapToPromptResponse(result.data, user ? { username: user.username, avatarUrl: user.avatarUrl } : undefined)
      }
    }
    
    return result
  }

  async deletePrompt(promptId: string, userId: string) {
    return await this.deletePromptUseCase.execute(promptId, userId)
  }

  async getUserPrompts(userId: string, page: number = 1, limit: number = 10) {
    const result = await this.listUserPromptsUseCase.execute(userId, page, limit)
    
    if (result.success && result.data) {
      const promptsWithUsers = await Promise.all(
        result.data.prompts.map(async (prompt: any) => {
          const user = await this.userRepository.findById(prompt.userId)
          return mapToPromptResponse(prompt, user ? { username: user.username, avatarUrl: user.avatarUrl } : undefined)
        })
      )
      
      return {
        ...result,
        data: {
          ...result.data,
          prompts: promptsWithUsers
        }
      }
    }
    
    return result
  }

  async publishPrompt(promptId: string, userId: string) {
    return await this.publishPromptUseCase.execute(promptId, userId)
  }

  async saveAsDraft(promptId: string, userId: string) {
    return await this.saveDraftUseCase.execute(promptId, userId)
  }

  async getPromptVersions(promptId: string) {
    const versions = await this.versionRepository.getVersions(promptId)
    return { success: true, data: versions.map(mapToVersionDTO) }
  }
}