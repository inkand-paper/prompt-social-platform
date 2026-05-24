import { PromptTag } from '@/core/entities/PromptTag'

export interface ITagRepository {
  findOrCreate(tagNames: string[]): Promise<PromptTag[]>
  incrementUsage(tagIds: string[]): Promise<void>
  decrementUsage(tagIds: string[]): Promise<void>
  getPopularTags(limit?: number): Promise<PromptTag[]>
  searchTags(query: string, limit?: number): Promise<PromptTag[]>
  getPromptTags(promptId: string): Promise<PromptTag[]>
  addTagsToPrompt(promptId: string, tagIds: string[]): Promise<void>
  removeTagsFromPrompt(promptId: string, tagIds: string[]): Promise<void>
  replacePromptTags(promptId: string, tagIds: string[]): Promise<void>
}