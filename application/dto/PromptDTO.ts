import { Prompt, PromptVisibility } from '@/core/entities/Prompt'
import { PromptVersion } from '@/core/entities/PromptVersion'

export interface PromptResponseDTO {
  id: string
  userId: string
  username?: string
  userAvatar?: string
  title: string
  content: string
  description: string | null
  promptText: string
  visibility: PromptVisibility
  isDraft: boolean
  viewCount: number
  likeCount: number
  saveCount: number
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  isLiked?: boolean
  isSaved?: boolean
}

export interface PromptVersionDTO {
  id: string
  versionNumber: number
  title: string
  content: string
  promptText: string
  changelog: string | null
  createdAt: Date
}

export function mapToPromptResponse(prompt: Prompt, userPrompt?: { username: string; avatarUrl: string | null }): PromptResponseDTO {
  return {
    id: prompt.id,
    userId: prompt.userId,
    username: userPrompt?.username,
    userAvatar: userPrompt?.avatarUrl || undefined,
    title: prompt.title,
    content: prompt.content,
    description: prompt.description,
    promptText: prompt.promptText,
    visibility: prompt.visibility,
    isDraft: prompt.isDraft,
    viewCount: prompt.viewCount,
    likeCount: prompt.likeCount,
    saveCount: prompt.saveCount,
    tags: prompt.tags,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
    publishedAt: prompt.publishedAt
  }
}

export function mapToVersionDTO(version: PromptVersion): PromptVersionDTO {
  return {
    id: version.id,
    versionNumber: version.versionNumber,
    title: version.title,
    content: version.content,
    promptText: version.promptText,
    changelog: version.changelog,
    createdAt: version.createdAt
  }
}