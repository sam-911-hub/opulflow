import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/admin';
import { AppError } from './errorHandler';
import { logger } from './logger';

export interface AuthUser {
  uid: string;
  email: string;
  role?: string;
}

export async function authenticate(request: NextRequest): Promise<AuthUser> {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    throw new AppError(401, 'Unauthorized');
  }

  try {
    const decodedClaims = await getAdminAuth().verifyIdToken(sessionCookie, true);
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || '',
      role: decodedClaims.role,
    };
  } catch (error: any) {
    logger.warn('Authentication failed', {
      endpoint: request.nextUrl.pathname,
      error: error.code,
    });

    if (error.code === 'auth/id-token-expired') {
      throw new AppError(401, 'Session expired');
    }

    throw new AppError(401, 'Invalid session');
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  return authenticate(request);
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await authenticate(request);

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

  if (!adminEmails.includes(user.email)) {
    logger.warn('Admin access denied', {
      userId: user.uid,
      email: user.email,
      endpoint: request.nextUrl.pathname,
    });
    throw new AppError(403, 'Access denied');
  }

  return user;
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}
