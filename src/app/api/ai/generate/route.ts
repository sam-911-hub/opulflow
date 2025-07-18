import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/admin';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';

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
    
    // In a real implementation, you would call OpenAI or another AI provider API here
    // For now, we'll return mock data
    
    // Generate a simple email based on the prompt and style
    let emailContent = '';
    
    if (style === 'professional') {
      emailContent = `Dear ${recipient || 'Valued Customer'},\n\nThank you for your interest in our services. ${prompt}\n\nWe look forward to working with you.\n\nBest regards,\n[Your Name]\n[Your Company]`;
    } else if (style === 'casual') {
      emailContent = `Hi ${recipient || 'there'},\n\nThanks for reaching out! ${prompt}\n\nLet me know if you have any questions.\n\nCheers,\n[Your Name]`;
    } else if (style === 'sales') {
      emailContent = `Hello ${recipient || 'there'},\n\nI hope this email finds you well. I wanted to reach out because ${prompt}\n\nWould you be available for a quick call to discuss how we can help?\n\nBest,\n[Your Name]\n[Your Company]`;
    } else {
      emailContent = `Dear ${recipient || 'Recipient'},\n\n${prompt}\n\nRegards,\n[Your Name]`;
    }
    
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