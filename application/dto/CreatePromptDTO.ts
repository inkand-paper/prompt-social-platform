export interface CreatePromptDTO {
  title: string
  content: string
  description?: string
  promptText: string
  visibility?: 'public' | 'unlisted' | 'private'
  isDraft?: boolean
  tags?: string[]
}

export interface UpdatePromptDTO {
  title?: string
  content?: string
  description?: string
  promptText?: string
  visibility?: 'public' | 'unlisted' | 'private'
  isDraft?: boolean
  tags?: string[]
  changelog?: string
}

export interface PromptListDTO {
  prompts: {
    id: string
    title: string
    description: string | null
    promptText: string
    visibility: string
    isDraft: boolean
    viewCount: number
    likeCount: number
    saveCount: number
    tags?: string[]
    createdAt: Date
    updatedAt: Date
    user: {
      username: string
      avatarUrl: string | null
    }
  }[]
  total: number
  page: number
  limit: number
  totalPages: number
}