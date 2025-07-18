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
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Check if user has enough credits
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const verificationCredits = userData.credits?.email_verification || 0;
    
    if (verificationCredits < 1) {
      return NextResponse.json({ error: 'Insufficient email verification credits' }, { status: 403 });
    }
    
    // In a real implementation, you would call an email verification service API here
    // For now, we'll return mock data
    
    // Simple validation (this is NOT real email verification)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    
    // Mock verification result
    const verificationResult = {
      email,
      valid: isValidFormat,
      deliverable: isValidFormat && Math.random() > 0.1, // 90% chance of being deliverable if format is valid
      disposable: email.includes('temp') || email.includes('mailinator'),
      reason: isValidFormat ? 'valid_format' : 'invalid_format'
    };
    
    // Deduct credits
    await updateDoc(userRef, {
      'credits.email_verification': verificationCredits - 1
    });
    
    // Record transaction
    const transactionData = {
      type: 'consumption',
      amount: 1,
      service: 'email_verification',
      createdAt: new Date().toISOString(),
      remainingBalance: verificationCredits - 1
    };
    
    await addDoc(collection(db, `users/${userId}/transactions`), transactionData);
    
    // Return verification result
    return NextResponse.json({
      ...verificationResult,
      credits_remaining: verificationCredits - 1
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}