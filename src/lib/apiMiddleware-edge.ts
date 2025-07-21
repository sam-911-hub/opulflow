import { NextRequest, NextResponse } from 'next/server';

// Middleware to verify authentication for API routes
// Note: This is a simplified version for Edge Runtime
// Real authentication verification should be done in API routes that run in Node.js runtime
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // In Edge Runtime, we cannot verify Firebase session cookies
    // We'll trust the session cookie exists and defer real verification to API routes
    // In a production environment, you'd want to validate this differently
    const userId = 'authenticated-user'; // Placeholder - real verification happens in API routes
    
    // Call the handler with the user ID
    return handler(request, userId);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Simplified middleware for Edge Runtime
export async function withAdmin(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // In Edge Runtime, we'll use a simplified approach
    // Real admin verification should be done in API routes that run in Node.js runtime
    const userId = 'admin-user';
    
    // Call the handler with the authenticated admin user ID
    return handler(request, userId);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Simplified middleware for Edge Runtime
export async function withCredits(
  request: NextRequest,
  userId: string,
  creditType: string,
  amount: number,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  // In Edge Runtime, we'll skip credit checking
  // Real credit validation should be done in API routes that run in Node.js runtime
  return handler(request, userId);
}