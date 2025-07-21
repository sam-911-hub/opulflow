import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called');
    
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'No session cookie found',
        authenticated: false 
      }, { status: 401 });
    }

    console.log('Session cookie found, verifying...');
    
    // Verify the session cookie
    const decodedClaims = await verifySessionCookie(sessionCookie);
    
    console.log('Session verified successfully for user:', decodedClaims.uid);
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        email_verified: decodedClaims.email_verified
      },
      message: 'Authentication working correctly!'
    });

  } catch (error: any) {
    console.error('Test auth error:', error);
    
    return NextResponse.json({
      error: 'Authentication failed',
      authenticated: false,
      details: error.message
    }, { status: 401 });
  }
}