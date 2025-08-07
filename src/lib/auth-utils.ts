import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/admin';

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return { error: 'Unauthorized', status: 401 };
    }
    
    // Verify ID token with more lenient error handling
    try {
      const decodedClaims = await getAdminAuth().verifyIdToken(sessionCookie, true);
      return { uid: decodedClaims.uid, email: decodedClaims.email };
    } catch (tokenError) {
      // If token is expired, try without checking revocation
      try {
        const decodedClaims = await getAdminAuth().verifyIdToken(sessionCookie, false);
        return { uid: decodedClaims.uid, email: decodedClaims.email };
      } catch (fallbackError) {
        console.error('Token verification failed:', fallbackError);
        return { error: 'Session expired', status: 401 };
      }
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { error: 'Invalid session', status: 401 };
  }
}