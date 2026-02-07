import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/security/auth';
import { handleError, successResponse } from '@/lib/security/errorHandler';
import { creditService } from '@/services/creditService';
import { sanitizeCredits } from '@/lib/security/sanitizer';
import { rateLimit } from '@/lib/security/rateLimit';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 100 });

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const user = await requireAuth(request);
    
    // Business logic in service layer
    const credits = await creditService.getBalance(user.uid);
    
    // Sanitize response - only return credit balances
    return successResponse({ credits: sanitizeCredits(credits) });
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/credits/balance',
      method: 'GET',
    });
  }
}