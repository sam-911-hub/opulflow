import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For admin routes, redirect to login if no session
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // We'll handle admin authorization in the API route
    // since we can't use Firebase Admin in middleware
    return NextResponse.next();
  }
  
  // For non-admin routes, just check session expiration
  if (sessionCookie) {
    try {
      // Parse the JWT to get the issued at time (iat)
      // This is a simplified approach - in production you'd verify the JWT properly
      const payload = JSON.parse(Buffer.from(sessionCookie.split('.')[1], 'base64').toString());
      
      if (payload.iat) {
        const sessionCreatedAt = new Date(payload.iat * 1000);
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
      }
    } catch (error) {
      // If we can't parse the cookie, continue
      console.error('Error parsing session cookie:', error);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};