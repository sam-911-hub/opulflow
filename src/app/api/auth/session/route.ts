import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'ID token required' }, { status: 400 });
    }

    // Verify the ID token
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get user info
    const user = await getFirebaseAdminAuth().getUser(userId);

    const response = NextResponse.json({ 
      success: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName 
      } 
    });

    // Set session cookie (14 days)
    const sessionCookie = idToken;
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}