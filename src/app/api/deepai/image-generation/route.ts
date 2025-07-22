import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { sanitizeString } from '@/lib/validation';

const DEEPAI_API_KEY = '49284644-89a8-4717-9e17-ddcaa66fb4f1';
const DEEPAI_BASE_URL = 'https://api.deepai.org/api';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'image-generation');
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
      model = 'text2img',
      width = 512,
      height = 512,
      style = 'default'
    } = await request.json();

    // Validate inputs
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        error: 'Text prompt is required and must be a string' 
      }, { status: 400 });
    }

    const sanitizedText = sanitizeString(text, 1000);
    if (!sanitizedText) {
      return NextResponse.json({ 
        error: 'Text prompt is too long or invalid' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const aiCredits = userData?.credits?.ai_generation || 0;

    const creditsNeeded = 2; // 2 credits per image generation

    if (aiCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. Image generation requires ${creditsNeeded} credits ($0.20)` 
      }, { status: 402 });
    }

    console.log('Generating image with DeepAI:', {
      model,
      prompt: sanitizedText.substring(0, 50),
      width,
      height,
      style
    });

    // Prepare DeepAI API request
    const formData = new FormData();
    formData.append('text', sanitizedText);
    if (width && height) {
      formData.append('width', width.toString());
      formData.append('height', height.toString());
    }
    if (style && style !== 'default') {
      formData.append('style', style);
    }

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
      await trackApiCost(userId, 'ai_generation', 0.20, false, {
        error: errorData,
        model,
        prompt: sanitizedText.substring(0, 100)
      });

      return NextResponse.json({ 
        error: 'Failed to generate image with DeepAI',
        details: errorData,
        service: 'AI Image Generation'
      }, { status: 500 });
    }

    const deepaiData = await deepaiResponse.json();
    console.log('DeepAI image generation successful');

    const result = {
      imageUrl: deepaiData.output_url || deepaiData.url || '',
      prompt: sanitizedText,
      model: model,
      width: width,
      height: height,
      style: style,
      generatedAt: new Date().toISOString(),
      provider: 'DeepAI',
      id: deepaiData.id || 'deepai-' + Date.now()
    };

    // Deduct credits
    await userRef.update({
      'credits.ai_generation': aiCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'ai_generation',
      subService: 'image_generation',
      amount: creditsNeeded,
      cost: 0.20,
      provider: 'DeepAI',
      model: model,
      prompt: sanitizedText.substring(0, 100),
      imageUrl: result.imageUrl,
      createdAt: new Date().toISOString(),
      remainingBalance: aiCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'ai_generation', 0.20, true, {
      model,
      prompt: sanitizedText.substring(0, 100),
      imageGenerated: !!result.imageUrl
    });

    return NextResponse.json({
      success: true,
      result,
      creditsUsed: creditsNeeded,
      remainingCredits: aiCredits - creditsNeeded,
      cost: 0.20,
      provider: 'DeepAI'
    });

  } catch (error: any) {
    console.error('DeepAI image generation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Image Generation',
    cost: '$0.20 per image',
    description: 'Generate images from text prompts using advanced AI models',
    provider: 'DeepAI',
    features: [
      'Text-to-image generation',
      'Multiple AI models',
      'Customizable dimensions',
      'Various art styles',
      'High-quality output'
    ],
    parameters: {
      required: ['text'],
      optional: ['model', 'width', 'height', 'style']
    },
    models: [
      'text2img',
      'stable-diffusion',
      'cute-creature-generator',
      'fantasy-world-generator'
    ],
    styles: [
      'default',
      'photorealistic',
      'artistic',
      'cartoon',
      'anime'
    ],
    example: {
      text: 'A beautiful sunset over mountains with a lake in the foreground',
      model: 'text2img',
      width: 512,
      height: 512,
      style: 'photorealistic'
    }
  });
}