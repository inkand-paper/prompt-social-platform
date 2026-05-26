import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { AIGenerationUseCase } from '@/core/usecases/ai/AIGenerationUseCase';

export const maxDuration = 30; // 30 seconds max duration

export async function POST(req: Request) {
  try {
    const { promptText, variables, model } = await req.json();

    if (!promptText) {
      return new Response('Missing promptText', { status: 400 });
    }

    // Prepare prompt with variables
    const agUseCase = new AIGenerationUseCase();
    const finalPrompt = agUseCase.preparePrompt(promptText, variables || {});

    // Stream text using Groq
    const result = streamText({
      model: groq(model || 'llama3-8b-8192'),
      prompt: finalPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Execute Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}
