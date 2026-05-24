import { groq } from '@ai-sdk/groq';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { IAIService, PromptScoreResult } from '../../core/interfaces/IAIService';

export class GroqService implements IAIService {
  
  async generateText(prompt: string, model: string = 'llama3.1-8b-instant'): Promise<string> {
    const { text } = await generateText({
      model: groq(model),
      prompt: prompt,
    });
    return text;
  }

  async scorePrompt(prompt: string): Promise<PromptScoreResult> {
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'), // Using a larger model for reasoning/scoring
      system: 'You are an expert prompt engineer. Evaluate the user\'s prompt and provide constructive feedback to improve it. Be highly critical but helpful.',
      prompt: `Evaluate the following prompt:\n\n"""\n${prompt}\n"""`,
      schema: z.object({
        score: z.number().min(0).max(100).describe('A score from 0 to 100 on the overall effectiveness of the prompt'),
        feedback: z.object({
          clarity: z.string().describe('Feedback on how clear the instructions are'),
          specificity: z.string().describe('Feedback on the context and constraints'),
          creativity: z.string().describe('Feedback on the creative or structural potential of the prompt'),
          overall: z.string().describe('Overall summary statement'),
        }),
        suggestions: z.array(z.string()).describe('List of actionable suggestions to improve the prompt'),
      }),
    });

    return object;
  }
}
