import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminAuth } from './lib/admin-edge';

// In-memory rate limiting (would use Redis in production)
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  store: new Map<string, { count: number, resetTime: number }>()
};

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Check if this is an API route
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Rate limiting
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;
    
    // Clean up old entries
    for (const [key, value] of rateLimit.store.entries()) {
      if (value.resetTime < windowStart) {
        rateLimit.store.delete(key);
      }
    }
    
    // Get or create rate limit entry
    let rateEntry = rateLimit.store.get(ip);
    if (!rateEntry) {
      rateEntry = { count: 0, resetTime: now + rateLimit.windowMs };
      rateLimit.store.set(ip, rateEntry);
    }
    
    // Check if rate limit exceeded
    if (rateEntry.count >= rateLimit.max) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      );
    }
    
    // Increment request count
    rateEntry.count++;
    
    // For authenticated API routes, verify session
    if (sessionCookie && !request.nextUrl.pathname.startsWith('/api/auth')) {
      try {
        // Verify session cookie
        await getAdminAuth().verifySessionCookie(sessionCookie);
      } catch (error) {
        // Invalid session cookie
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }
  
  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For admin routes, redirect to login if no session
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // We'll handle admin authorization in the API route
    return NextResponse.next();
  }
  
  // For dashboard routes, check if user is logged in
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};