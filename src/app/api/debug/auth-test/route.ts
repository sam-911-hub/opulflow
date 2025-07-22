import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('Auth test API called');

    // Check session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    console.log('Session cookie present:', !!sessionCookie);
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        error: 'No session cookie found',
        step: 'session_check'
      }, { status: 401 });
    }

    // Try to verify session
    let decodedClaims;
    try {
      decodedClaims = await verifySessionCookie(sessionCookie);
      console.log('Session verified successfully for user:', decodedClaims.uid);
    } catch (error: any) {
      console.error('Session verification failed:', error);
      return NextResponse.json({ 
        error: 'Session verification failed',
        details: error.message,
        step: 'session_verification'
      }, { status: 401 });
    }

    const userId = decodedClaims.uid;

    // Try to get Firestore instance
    let db;
    try {
      db = getAdminFirestore();
      console.log('Firestore instance obtained');
    } catch (error: any) {
      console.error('Firestore connection failed:', error);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message,
        step: 'firestore_connection'
      }, { status: 500 });
    }

    // Try to read user document
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User document found:', userId);
        
        return NextResponse.json({
          success: true,
          userId,
          hasCredits: {
            lead_lookup: userData?.credits?.lead_lookup || 0,
            company_enrichment: userData?.credits?.company_enrichment || 0,
            email_verification: userData?.credits?.email_verification || 0
          },
          step: 'complete'
        });
      } else {
        console.log('User document not found:', userId);
        return NextResponse.json({ 
          error: 'User document not found',
          userId,
          step: 'user_document'
        }, { status: 404 });
      }
    } catch (error: any) {
      console.error('Database query failed:', error);
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        step: 'database_query'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      step: 'general_error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Auth test endpoint - use POST to test authentication flow',
    endpoints: [
      'POST /api/debug/auth-test - Test authentication flow',
      'GET /api/debug/env - Check environment variables',
      'GET /api/test-auth - Test session verification'
    ]
  });
}