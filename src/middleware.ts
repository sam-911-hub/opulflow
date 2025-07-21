import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // Rate limiting - get IP from headers
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
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
    
    // For authenticated API routes, we'll let the API route handle auth verification
    // since Firebase Admin SDK cannot run in Edge Runtime
  }
  
  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For admin routes, redirect to login if no session
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // We'll handle session verification in the API routes since 
    // Firebase Admin SDK cannot run in Edge Runtime
    return NextResponse.next();
  }
  
  // For dashboard routes, check if user is logged in
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // We'll handle session verification in the API routes since 
    // Firebase Admin SDK cannot run in Edge Runtime
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*',
  ],
};