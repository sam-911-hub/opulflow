import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/admin';
import { AppError } from '@/lib/api-error-handler';
import { logger } from '@/lib/security/logger';

export async function getAuthenticatedUser(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  
  if (!sessionCookie) {
    throw new AppError(401, 'Unauthorized');
  }
  
  try {
    const decodedClaims = await getAdminAuth().verifyIdToken(sessionCookie, true);
    return { uid: decodedClaims.uid, email: decodedClaims.email };
  } catch (error: any) {
    logger.warn('Authentication failed', {
      endpoint: request.nextUrl.pathname,
    });
    
    if (error.code === 'auth/id-token-expired') {
      throw new AppError(401, 'Session expired');
    }
    
    throw new AppError(401, 'Invalid session');
  }
}