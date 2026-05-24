import { NextResponse } from 'next/server';
import { GroqService } from '@/infrastructure/services/GroqService';
import { AIScoringUseCase } from '@/core/usecases/ai/AIScoringUseCase';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { promptText } = await req.json();

    if (!promptText) {
      return NextResponse.json({ success: false, error: 'Missing promptText' }, { status: 400 });
    }

    const aiService = new GroqService();
    const scoringUseCase = new AIScoringUseCase(aiService);
    
    const result = await scoringUseCase.execute(promptText);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('AI Score Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
