import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // Get ID token from request body
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }
    
    // Create session cookie (valid for 2 weeks)
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 2 weeks
    const sessionCookie = await createSessionCookie(idToken, expiresIn);
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set session cookie
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}