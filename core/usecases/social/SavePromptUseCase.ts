import { ISaveRepository } from '../../repositories/ISaveRepository';

export class SavePromptUseCase {
  constructor(private saveRepository: ISaveRepository) {}

  async execute(userId: string, promptId: string): Promise<{ saved: boolean; saveCount: number }> {
    const hasSaved = await this.saveRepository.hasSaved(userId, promptId);
    const currentSaves = await this.saveRepository.getSavesCount(promptId);
    
    if (hasSaved) {
      await this.saveRepository.delete(userId, promptId);
      return { saved: false, saveCount: currentSaves - 1 };
    } else {
      await this.saveRepository.create({ user_id: userId, prompt_id: promptId });
      return { saved: true, saveCount: currentSaves + 1 };
    }
  }
}