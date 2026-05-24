import { Prompt, PromptVisibility } from '@/core/entities/Prompt'

export interface CreatePromptInput {
  userId: string
  title: string
  content: string
  description?: string
  promptText: string
  visibility?: PromptVisibility
  isDraft?: boolean
  tags?: string[]
}

export interface UpdatePromptInput {
  title?: string
  content?: string
  description?: string
  promptText?: string
  visibility?: PromptVisibility
  isDraft?: boolean
  tags?: string[]
}

export interface IPromptRepository {
  create(input: CreatePromptInput): Promise<Prompt>
  findById(id: string): Promise<Prompt | null>
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ prompts: Prompt[]; total: number }>
  findByUsername(username: string, page?: number, limit?: number): Promise<{ prompts: Prompt[]; total: number }>
  update(id: string, userId: string, input: UpdatePromptInput): Promise<Prompt>
  delete(id: string, userId: string): Promise<void>
  incrementViewCount(id: string): Promise<void>
  incrementLikeCount(id: string): Promise<void>
  decrementLikeCount(id: string): Promise<void>
  incrementSaveCount(id: string): Promise<void>
  decrementSaveCount(id: string): Promise<void>
  listPublic(page?: number, limit?: number, tag?: string): Promise<{ prompts: Prompt[]; total: number }>
  listUserDrafts(userId: string, page?: number, limit?: number): Promise<{ prompts: Prompt[]; total: number }>
  checkOwnership(promptId: string, userId: string): Promise<boolean>
}