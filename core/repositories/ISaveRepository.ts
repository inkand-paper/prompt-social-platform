import { Save, CreateSaveInput, SavedPrompt } from '../entities/Save';

export interface ISaveRepository {
  create(data: CreateSaveInput): Promise<Save>;
  delete(userId: string, promptId: string): Promise<void>;
  hasSaved(userId: string, promptId: string): Promise<boolean>;
  getSavedPrompts(userId: string, limit?: number, offset?: number): Promise<SavedPrompt[]>;
  getSavesCount(promptId: string): Promise<number>;
  deleteByPromptId(promptId: string): Promise<void>;
}