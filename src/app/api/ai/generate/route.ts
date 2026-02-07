import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/security/auth';
import { validateBody } from '@/lib/security/validation';
import { AIGenerateDTO } from '@/lib/security/dto';
import { handleError, successResponse } from '@/lib/security/errorHandler';
import { rateLimit } from '@/lib/security/rateLimit';
import { creditService } from '@/services/creditService';
import { generateText } from '@/lib/openai';
import { logger } from '@/lib/security/logger';
import { getAdminFirestore } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 20 });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const user = await requireAuth(request);
    
    // Validate input with DTO
    const { prompt, type, context } = await validateBody(request, AIGenerateDTO);
    
    // Check and deduct credits
    await creditService.deductCredits(user.uid, 'ai', 1);
    
    // Generate AI content
    const aiPrompt = buildPrompt(type, prompt, context);
    const aiResponse = await generateText({
      prompt: aiPrompt,
      maxTokens: 500,
      temperature: 0.7
    });
    
    // Save generation record
    const db = getAdminFirestore();
    await db.collection(`users/${user.uid}/aiGenerations`).add({
      type,
      prompt,
      content: aiResponse.text,
      createdAt: new Date().toISOString(),
    });
    
    logger.info('AI content generated', {
      userId: user.uid,
      type,
    });
    
    // Return only the generated text, no internal data
    return successResponse({ text: aiResponse.text });
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/ai/generate',
      method: 'POST',
    });
  }
}

function buildPrompt(type: string, prompt: string, context?: any): string {
  const templates: Record<string, string> = {
    email: `Generate a professional email based on: ${prompt}`,
    script: `Generate a sales call script for: ${prompt}`,
    message: `Generate a professional message: ${prompt}`,
  };
  
  return templates[type] || prompt;
}