import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, isUserAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    // Verify session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Check if user is admin
    const admin = await isUserAdmin(decodedClaims.uid);
    
    if (!admin) {
      return NextResponse.json({ isAdmin: false }, { status: 403 });
    }
    
    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}