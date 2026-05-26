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
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are an expert prompt engineer. Evaluate the user\'s prompt and provide constructive feedback to improve it. You MUST respond ONLY with a valid JSON object. No preamble, no explanation outside the JSON.',
      prompt: `Evaluate the following prompt:\n\n"""\n${prompt}\n"""\n\nRespond with this JSON structure:\n{\n  "score": number (0-100),\n  "feedback": {\n    "clarity": "string",\n    "specificity": "string",\n    "creativity": "string",\n    "overall": "string"\n  },\n  "suggestions": ["suggestion 1", "suggestion 2"]\n}`,
    });

    try {
      // Find the first { and last } to handle any preamble/postamble if the model ignores the instruction
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('Invalid JSON response');
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      // Return a fallback object
      return {
        score: 0,
        feedback: {
          clarity: 'N/A',
          specificity: 'N/A',
          creativity: 'N/A',
          overall: 'AI response failed to parse.'
        },
        suggestions: ['Try refining your prompt and scoring again.']
      };
    }
  }
}
