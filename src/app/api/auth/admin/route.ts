import { NextRequest, NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ isAdmin: false, message: authResult.error }, { status: authResult.status });
    }
    
    const admin = await isUserAdmin(authResult.uid);
    
    if (!admin) {
      return NextResponse.json({ isAdmin: false, message: 'User is not an admin' }, { status: 403 });
    }
    
    return NextResponse.json({ isAdmin: true });
  } catch (error: any) {
    console.error('Error verifying admin status:', error);
    return NextResponse.json({ isAdmin: false, message: 'Authentication failed' }, { status: 401 });
  }
}