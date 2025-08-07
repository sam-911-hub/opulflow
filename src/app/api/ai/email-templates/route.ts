import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { prompt, type = 'cold_email', tone = 'professional' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const enhancedPrompt = `Generate a ${type} email with a ${tone} tone. ${prompt}. Make it compelling and personalized.`;

    const response = await fetch('https://api.deepai.org/api/text-generator', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.DEEP_AI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: enhancedPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error('Deep AI API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      email: data.output,
      type,
      tone
    });
  } catch (error) {
    console.error('Email template generation error:', error);
    return NextResponse.json({ error: 'Failed to generate email template' }, { status: 500 });
  }
}