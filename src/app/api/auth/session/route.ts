import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    // Session expires in 8 hours
    const expiresIn = 60 * 60 * 8 * 1000;
    
    // Create session cookie
    const sessionCookie = await createSessionCookie(idToken, expiresIn);
    
    // Set cookie options
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set(options);
    
    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}