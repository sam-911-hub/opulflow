import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, isUserAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ isAdmin: false, message: 'No session found' }, { status: 401 });
    }
    
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true); // Check if revoked
    
    if (!decodedClaims || !decodedClaims.uid) {
      return NextResponse.json({ isAdmin: false, message: 'Invalid session' }, { status: 401 });
    }
    
    // Check if user is admin
    const admin = await isUserAdmin(decodedClaims.uid);
    
    if (!admin) {
      return NextResponse.json({ isAdmin: false, message: 'User is not an admin' }, { status: 403 });
    }
    
    return NextResponse.json({ isAdmin: true });
  } catch (error: any) {
    console.error('Error verifying admin status:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/session-cookie-expired') {
      return NextResponse.json({ isAdmin: false, message: 'Session expired' }, { status: 401 });
    } else if (error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ isAdmin: false, message: 'Session revoked' }, { status: 401 });
    }
    
    return NextResponse.json({ isAdmin: false, message: 'Authentication failed' }, { status: 401 });
  }
}