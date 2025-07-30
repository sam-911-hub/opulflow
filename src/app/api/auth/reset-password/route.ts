import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Send password reset email using Firebase
    await sendPasswordResetEmail(auth, email);
    
    return NextResponse.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      // For security reasons, don't reveal if the email exists or not
      return NextResponse.json(
        { success: true, message: 'If the email exists, a password reset link has been sent' },
        { status: 200 }
      );
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}