export type PromptVisibility = 'public' | 'unlisted' | 'private'

export interface Prompt {
  id: string
  userId: string
  username: string
  userAvatar: string | null
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
}