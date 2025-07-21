import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('Session API called - environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasFirebaseConfig: !!process.env.FIREBASE_ADMIN_PROJECT_ID
    });

    // Get ID token from request body
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;
    
    if (!idToken) {
      console.log('Missing ID token in request');
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }
    
    console.log('Creating session cookie...');
    
    // Create session cookie (valid for 2 weeks)
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 2 weeks
    const sessionCookie = await createSessionCookie(idToken, expiresIn);
    
    console.log('Session cookie created successfully');
    
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
      sameSite: 'lax', // Protect against CSRF
    });
    
    return response;
  } catch (error: any) {
    console.error('Session creation error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'ID token has expired. Please login again.' },
        { status: 401 }
      );
    } else if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { error: 'Invalid ID token. Please login again.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}

// Add a GET method for health check
export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    });
  } catch (error) {
    console.error('Session API health check failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: 'API route not working properly' 
    }, { status: 500 });
  }
}