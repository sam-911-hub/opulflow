import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookies = request.cookies.getAll();
    const sessionCookie = request.cookies.get('session')?.value;
    
    console.log('Session check - cookies found:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    console.log('Session cookie present:', !!sessionCookie);
    
    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        issue: 'No session cookie found',
        allCookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        suggestion: 'User needs to log in and ensure session cookie is set'
      });
    }

    // Try to verify the session
    try {
      const decodedClaims = await verifySessionCookie(sessionCookie);
      
      return NextResponse.json({
        authenticated: true,
        userId: decodedClaims.uid,
        email: decodedClaims.email,
        sessionValid: true,
        cookieLength: sessionCookie.length
      });
      
    } catch (verifyError: any) {
      console.error('Session verification failed:', verifyError);
      
      return NextResponse.json({
        authenticated: false,
        issue: 'Session cookie invalid or expired',
        error: verifyError.message,
        cookieLength: sessionCookie.length,
        suggestion: 'User needs to log out and log back in'
      });
    }

  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({
      error: 'Session check failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Same as GET but also shows request headers
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const cookies = request.cookies.getAll();
    const sessionCookie = request.cookies.get('session')?.value;
    
    return NextResponse.json({
      method: 'POST',
      headers: {
        cookie: headers.cookie || 'No cookie header',
        authorization: headers.authorization || 'No auth header',
        userAgent: headers['user-agent'] || 'No user agent'
      },
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      sessionCookie: sessionCookie ? {
        present: true,
        length: sessionCookie.length,
        preview: sessionCookie.substring(0, 20) + '...'
      } : { present: false }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to analyze request',
      details: error.message
    }, { status: 500 });
  }
}