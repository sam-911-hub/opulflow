import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/security/auth';
import { validateBody } from '@/lib/security/validation';
import { AssignCreditsDTO } from '@/lib/security/dto';
import { handleError, successResponse } from '@/lib/security/errorHandler';
import { rateLimit } from '@/lib/security/rateLimit';
import { creditService } from '@/services/creditService';
import { logger } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({ windowMs: 60000, maxRequests: 50 });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Admin authentication
    const admin = await requireAdmin(request);
    
    // Validate input with DTO
    const { userId, credits } = await validateBody(request, AssignCreditsDTO);
    
    // Business logic in service
    await creditService.addCredits(userId, credits);
    
    logger.info('Credits assigned by admin', {
      adminId: admin.uid,
      targetUserId: userId,
      credits,
    });
    
    return successResponse({ message: 'Credits assigned successfully' });
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/admin/assign-credits',
      method: 'POST',
    });
  }
}