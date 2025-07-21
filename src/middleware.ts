import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookieEdge } from './lib/admin-edge';

// Define paths that require authentication
const AUTH_PATHS = [
  '/dashboard',
  '/settings',
  '/leads',
  '/companies',
  '/ai',
  '/workflows',
  '/api/leads',
  '/api/companies',
  '/api/email',
  '/api/ai',
  '/api/n8n',
];

// Define paths that require admin access
const ADMIN_PATHS = [
  '/admin',
  '/api/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/pricing' ||
    pathname === '/about' ||
    pathname === '/contact'
  ) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiresAuth = AUTH_PATHS.some(path => pathname.startsWith(path));
  const requiresAdmin = ADMIN_PATHS.some(path => pathname.startsWith(path));
  
  if (!requiresAuth && !requiresAdmin) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  if (!sessionCookie) {
    // Redirect to login if no session cookie
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify session cookie
    const decodedToken = await verifySessionCookieEdge(sessionCookie);
    
    if (!decodedToken) {
      // Redirect to login if session is invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin access
    if (requiresAdmin && !decodedToken.token?.admin) {
      // Redirect to dashboard if not admin
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add user info to headers for route handlers
    const response = NextResponse.next();
    response.headers.set('x-user-id', decodedToken.uid);
    if (decodedToken.email) {
      response.headers.set('x-user-email', decodedToken.email);
    }
    if (decodedToken.token?.admin) {
      response.headers.set('x-user-admin', 'true');
    }
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Redirect to login on error
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};