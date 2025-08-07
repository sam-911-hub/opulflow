import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/admin';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { generateText } from '@/lib/openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;
    
    // Get request data
    const { prompt, style, recipient } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    // Check if user has enough credits
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const aiCredits = userData.credits?.ai_email || 0;
    
    if (aiCredits < 1) {
      return NextResponse.json({ error: 'Insufficient AI email credits' }, { status: 403 });
    }
    
    // Generate AI content using OpenAI
    const aiPrompt = `Generate a ${style || 'professional'} email ${recipient ? `to ${recipient}` : ''} based on this request: ${prompt}`;
    
    const aiResponse = await generateText({
      prompt: aiPrompt,
      maxTokens: 500,
      temperature: 0.7
    });
    
    const emailContent = aiResponse.text;
    
    // Deduct credits
    await updateDoc(userRef, {
      'credits.ai_email': aiCredits - 1
    });
    
    // Record transaction
    const transactionData = {
      type: 'consumption',
      amount: 1,
      service: 'ai_email',
      createdAt: new Date().toISOString(),
      remainingBalance: aiCredits - 1
    };
    
    await addDoc(collection(db, `users/${userId}/transactions`), transactionData);
    
    // Save the generated email
    await addDoc(collection(db, `users/${userId}/aiGenerations`), {
      type: 'email',
      prompt,
      style,
      content: emailContent,
      createdAt: new Date().toISOString()
    });
    
    // Return the generated email
    return NextResponse.json({
      text: emailContent,
      credits_remaining: aiCredits - 1
    });
    
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate AI content' }, { status: 500 });
  }
}