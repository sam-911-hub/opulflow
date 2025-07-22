// API Rate Limiting Middleware
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  service: string;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'email-finder': { windowMs: 60000, maxRequests: 10, service: 'email_finder' }, // 10 req/minute
  'email-verifier': { windowMs: 60000, maxRequests: 15, service: 'email_verification' }, // 15 req/minute
  'lead-lookup': { windowMs: 300000, maxRequests: 5, service: 'lead_lookup' }, // 5 req/5minutes (expensive)
  'company-enrichment': { windowMs: 300000, maxRequests: 3, service: 'company_enrichment' }, // 3 req/5minutes
  'email-sender': { windowMs: 60000, maxRequests: 20, service: 'email_delivery' }, // 20 emails/minute
  'whatsapp-sender': { windowMs: 60000, maxRequests: 15, service: 'whatsapp_messages' }, // 15 WhatsApp/minute
  'sms-sender': { windowMs: 60000, maxRequests: 10, service: 'sms_messages' }, // 10 SMS/minute
  'text-generation': { windowMs: 60000, maxRequests: 30, service: 'ai_generation' }, // 30 req/minute
  'image-generation': { windowMs: 60000, maxRequests: 15, service: 'ai_generation' }, // 15 req/minute (more expensive)
  'crm-integration': { windowMs: 60000, maxRequests: 25, service: 'crm_integration' }, // 25 req/minute
  'tech-analysis': { windowMs: 300000, maxRequests: 10, service: 'tech_analysis' } // 10 req/5minutes
};

export async function rateLimitMiddleware(
  request: NextRequest, 
  service: keyof typeof RATE_LIMITS
): Promise<NextResponse | null> {
  try {
    // Get user ID from session
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    const config = RATE_LIMITS[service];
    if (!config) {
      return null; // No rate limit configured
    }

    const db = getAdminFirestore();
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get recent API calls for this user and service
    const recentCallsQuery = await db
      .collection(`users/${userId}/api_calls`)
      .where('service', '==', service)
      .where('timestamp', '>', windowStart)
      .orderBy('timestamp', 'desc')
      .limit(config.maxRequests + 1)
      .get();

    const recentCalls = recentCallsQuery.docs;

    // Check if rate limit exceeded
    if (recentCalls.length >= config.maxRequests) {
      const oldestCall = recentCalls[recentCalls.length - 1];
      const resetTime = oldestCall.data().timestamp + config.windowMs;
      const resetInSeconds = Math.ceil((resetTime - now) / 1000);

      return NextResponse.json({
        error: 'Rate limit exceeded',
        message: `Too many requests for ${service}. Try again in ${resetInSeconds} seconds.`,
        retryAfter: resetInSeconds,
        limit: config.maxRequests,
        window: `${config.windowMs / 1000} seconds`
      }, { 
        status: 429,
        headers: {
          'Retry-After': resetInSeconds.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString()
        }
      });
    }

    // Log this API call
    await db.collection(`users/${userId}/api_calls`).add({
      service,
      timestamp: now,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
          request.headers.get('x-real-ip') || 
          request.headers.get('cf-connecting-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Clean up old entries (optional, helps with performance)
    if (recentCalls.length > 0 && Math.random() < 0.1) { // 10% chance to cleanup
      const batch = db.batch();
      const cutoff = now - (config.windowMs * 2); // Keep double the window for safety
      
      const oldCallsQuery = await db
        .collection(`users/${userId}/api_calls`)
        .where('service', '==', service)
        .where('timestamp', '<', cutoff)
        .limit(10)
        .get();

      oldCallsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    }

    return null; // Continue to main handler

  } catch (error) {
    console.error('Rate limiting error:', error);
    return null; // Don't block on rate limiting errors
  }
}

// Cost tracking utility
export async function trackApiCost(
  userId: string, 
  service: string, 
  cost: number, 
  success: boolean,
  metadata?: any
) {
  try {
    const db = getAdminFirestore();
    await db.collection(`users/${userId}/cost_tracking`).add({
      service,
      cost,
      success,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD for daily aggregation
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Cost tracking error:', error);
  }
}