export interface PromptVersion {
  id: string
  promptId: string
  versionNumber: number
  title: string
  content: string
  promptText: string
  changelog: string | null
  createdAt: Date
}