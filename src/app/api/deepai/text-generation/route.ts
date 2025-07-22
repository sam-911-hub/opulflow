import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { sanitizeString } from '@/lib/validation';

const DEEPAI_API_KEY = '49284644-89a8-4717-9e17-ddcaa66fb4f1';
const DEEPAI_BASE_URL = 'https://api.deepai.org/api';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'text-generation');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get request body
    const { 
      text,
      model = 'text-generator',
      maxLength = 500,
      temperature = 0.7
    } = await request.json();

    // Validate inputs
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Text input is required and must be a string' 
      }, { status: 400 });
    }

    const sanitizedText = sanitizeString(text, 5000);
    if (!sanitizedText) {
      return NextResponse.json({ 
        error: 'Text input is too long or invalid' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const aiCredits = userData?.credits?.ai_generation || 0;

    const creditsNeeded = 1; // 1 credit per text generation

    if (aiCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. Text generation requires ${creditsNeeded} credit ($0.10)` 
      }, { status: 402 });
    }

    console.log('Generating text with DeepAI:', {
      model,
      textLength: sanitizedText.length,
      maxLength,
      temperature
    });

    // Prepare DeepAI API request
    const formData = new FormData();
    formData.append('text', sanitizedText);
    if (maxLength) formData.append('max_length', maxLength.toString());
    if (temperature) formData.append('temperature', temperature.toString());

    // Make request to DeepAI API
    const deepaiResponse = await fetch(`${DEEPAI_BASE_URL}/${model}`, {
      method: 'POST',
      headers: {
        'api-key': DEEPAI_API_KEY,
      },
      body: formData
    });

    if (!deepaiResponse.ok) {
      const errorData = await deepaiResponse.text();
      console.error('DeepAI API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'ai_generation', 0.10, false, {
        error: errorData,
        model,
        inputLength: sanitizedText.length
      });

      return NextResponse.json({ 
        error: 'Failed to generate text with DeepAI',
        details: errorData,
        service: 'AI Text Generation'
      }, { status: 500 });
    }

    const deepaiData = await deepaiResponse.json();
    console.log('DeepAI text generation successful');

    const result = {
      generatedText: deepaiData.output || deepaiData.text || '',
      model: model,
      inputText: sanitizedText.substring(0, 100) + (sanitizedText.length > 100 ? '...' : ''),
      generatedAt: new Date().toISOString(),
      provider: 'DeepAI',
      tokenCount: deepaiData.output?.length || 0
    };

    // Deduct credits
    await userRef.update({
      'credits.ai_generation': aiCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'ai_generation',
      subService: 'text_generation',
      amount: creditsNeeded,
      cost: 0.10,
      provider: 'DeepAI',
      model: model,
      inputLength: sanitizedText.length,
      outputLength: result.tokenCount,
      createdAt: new Date().toISOString(),
      remainingBalance: aiCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'ai_generation', 0.10, true, {
      model,
      inputLength: sanitizedText.length,
      outputLength: result.tokenCount
    });

    return NextResponse.json({
      success: true,
      result,
      creditsUsed: creditsNeeded,
      remainingCredits: aiCredits - creditsNeeded,
      cost: 0.10,
      provider: 'DeepAI'
    });

  } catch (error: any) {
    console.error('DeepAI text generation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Text Generation',
    cost: '$0.10 per generation',
    description: 'Generate text content using advanced AI models',
    provider: 'DeepAI',
    features: [
      'Text completion and generation',
      'Multiple AI models available',
      'Customizable parameters',
      'High-quality output'
    ],
    parameters: {
      required: ['text'],
      optional: ['model', 'maxLength', 'temperature']
    },
    models: [
      'text-generator',
      'text-summarizer'
    ],
    example: {
      text: 'Write a professional email about...',
      model: 'text-generator',
      maxLength: 500,
      temperature: 0.7
    }
  });
}