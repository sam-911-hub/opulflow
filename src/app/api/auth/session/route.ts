import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/admin';
import { validateBody } from '@/lib/security/validation';
import { LoginDTO } from '@/lib/security/dto';
import { handleError, successResponse } from '@/lib/security/errorHandler';
import { rateLimit } from '@/lib/security/rateLimit';
import { logger } from '@/lib/security/logger';
import { getClientIp } from '@/lib/security/auth';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 10 });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const { idToken } = await validateBody(request, LoginDTO);
    
    // Verify token
    await getAdminAuth().verifyIdToken(idToken);
    
    const expiresIn = 60 * 60 * 24 * 14; // 2 weeks
    
    const response = successResponse({ message: 'Session created' });
    
    // Store JWT in HTTP-only cookie (secure against XSS)
    response.cookies.set({
      name: 'session',
      value: idToken,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    logger.info('Session created', {
      endpoint: '/api/auth/session',
      ip: getClientIp(request),
    });
    
    return response;
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/auth/session',
      method: 'POST',
      ip: getClientIp(request),
    });
  }
}