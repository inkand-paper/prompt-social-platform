import { IAIService, PromptScoreResult } from '../../interfaces/IAIService';

export class AIScoringUseCase {
  constructor(private aiService: IAIService) {}

  async execute(prompt: string): Promise<PromptScoreResult> {
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 5000) {
      throw new Error('Prompt is too long for scoring (max 5000 characters)');
    }

    return await this.aiService.scorePrompt(prompt);
  }
}
