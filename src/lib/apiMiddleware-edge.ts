import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './admin-edge';

// Middleware to verify authentication for API routes
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
    
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;
    
    // Call the handler with the authenticated user ID
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
    // In a real implementation, you would validate admin status via an API call
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
  // In a real implementation, you would validate credits via an API call
  return handler(request, userId);
}