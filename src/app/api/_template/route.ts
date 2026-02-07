/**
 * SECURE API ROUTE TEMPLATE
 * 
 * Use this template for all new API routes to ensure security best practices
 */

import { NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/security/auth';
import { validateBody, validateQuery } from '@/lib/security/validation';
import { handleError, successResponse } from '@/lib/security/errorHandler';
import { rateLimit } from '@/lib/security/rateLimit';
import { sanitizeResponse } from '@/lib/security/sanitizer';
import { logger } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 30 });

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await requireAuth(request);
    
    logger.info('Operation completed', {
      userId: user.uid,
      endpoint: '/api/your-endpoint',
    });
    
    return successResponse({ message: 'Success' });
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/your-endpoint',
      method: 'POST',
    });
  }
}
