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