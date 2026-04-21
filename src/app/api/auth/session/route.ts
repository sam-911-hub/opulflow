import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session');
    
    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value);
    const userId = decodedToken.uid;

    // Get user from Auth
    const user = await getFirebaseAdminAuth().getUser(userId);

    // Get user data from Firestore
    const db = getFirebaseAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists() ? userDoc.data() : {};

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: userData?.credits || 0,
        accountType: userData?.accountType || 'free',
      }
    });
  } catch (error: any) {
    console.error('Session GET error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

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