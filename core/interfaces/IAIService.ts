export interface PromptVariables {
  [key: string]: string;
}

export interface PromptScoreResult {
  score: number; // 0-100
  feedback: {
    clarity: string;
    specificity: string;
    creativity: string;
    overall: string;
  };
  suggestions: string[];
}

export interface IAIService {
  /**
   * Generates a non-streamed response (useful for simple tasks or testing behind the scenes).
   */
  generateText(prompt: string, model: string): Promise<string>;

  /**
   * Evaluates a prompt and provides a detailed score and feedback.
   */
  scorePrompt(prompt: string): Promise<PromptScoreResult>;
}
