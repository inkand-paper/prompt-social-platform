import { PromptVersion } from '@/core/entities/PromptVersion'

export interface IPromptVersionRepository {
  createVersion(
    promptId: string,
    versionNumber: number,
    title: string,
    content: string,
    promptText: string,
    changelog?: string
  ): Promise<PromptVersion>
  
  getVersions(promptId: string): Promise<PromptVersion[]>
  
  getLatestVersion(promptId: string): Promise<PromptVersion | null>
  
  getVersion(promptId: string, versionNumber: number): Promise<PromptVersion | null>
  
  getNextVersionNumber(promptId: string): Promise<number>
}