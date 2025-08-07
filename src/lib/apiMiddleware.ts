import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from './admin';

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

// Middleware to verify admin access for API routes
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
    
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;
    
    // Check if user is admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
    const user = await getAdminAuth().getUser(userId);
    
    if (!user.email || !adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Call the handler with the authenticated admin user ID
    return handler(request, userId);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Middleware to check if user has enough credits
export async function withCredits(
  request: NextRequest,
  userId: string,
  creditType: string,
  amount: number,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get user document from Firestore
    const userDoc = await getAdminFirestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const credits = userData?.credits?.[creditType] || 0;
    
    if (credits < amount) {
      return NextResponse.json({ 
        error: `Insufficient ${creditType} credits`,
        required: amount,
        available: credits
      }, { status: 403 });
    }
    
    // Call the handler with the authenticated user ID
    return handler(request, userId);
  } catch (error) {
    console.error('Credit check error:', error);
    return NextResponse.json({ error: 'Failed to check credits' }, { status: 500 });
  }
}