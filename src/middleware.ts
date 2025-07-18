import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';
import { cookies } from 'next/headers';

// Initialize Firebase Admin if not already initialized
let app;
try {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} catch (error) {
  // App already exists
  app = initializeApp();
}

export async function middleware(request: NextRequest) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
  
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Check if session exists and verify its expiration
  if (sessionCookie) {
    try {
      // Verify the session cookie
      const decodedClaims = await getAuth().verifySessionCookie(sessionCookie);
      
      // Check if the session was created more than 8 hours ago
      const sessionCreatedAt = new Date(decodedClaims.iat * 1000);
      const now = new Date();
      const sessionAgeHours = (now.getTime() - sessionCreatedAt.getTime()) / (1000 * 60 * 60);
      
      // If session is older than 8 hours, redirect to login
      if (sessionAgeHours > 8) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.set({
          name: 'session',
          value: '',
          maxAge: 0,
          path: '/',
        });
        return response;
      }
    } catch (error) {
      // Invalid session cookie, will be handled by specific routes
    }
  }
  
  // Only check admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check for session cookie again
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the session cookie
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie);
    
    // Get user details
    const user = await getAuth().getUser(decodedClaims.uid);
    
    // Check if user email is in admin list
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    // Invalid session cookie
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};