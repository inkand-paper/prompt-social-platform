import { PromptVariables } from '../../interfaces/IAIService';

export class AIGenerationUseCase {
  /**
   * Prepares the prompt text by replacing bracketed variables with user inputs.
   * Example: "Write a poem about [subject]" with inputs { subject: "cats" } 
   * becomes "Write a poem about cats".
   */
  preparePrompt(promptText: string, inputs: PromptVariables): string {
    let finalPrompt = promptText;

    // Detect variables in [brackets] or {{mustache}} format
    const variableRegex = /\[([^\]]+)\]|\{\{([^}]+)\}\}/g;
    
    finalPrompt = finalPrompt.replace(variableRegex, (match, bracketVar, mustacheVar) => {
      const varName = bracketVar || mustacheVar;
      return inputs[varName] || match; // Replace with input or keep original if not provided
    });

    return finalPrompt;
  }
}
