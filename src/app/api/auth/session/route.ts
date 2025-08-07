import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }
    
    // Validate ID token before storing
    await getAdminAuth().verifyIdToken(idToken);
    
    const expiresIn = 60 * 60 * 24 * 14; // 2 weeks in seconds
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'session',
      value: idToken,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    
    return response;
  } catch (error: any) {
    console.error('Session creation error:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'ID token has expired. Please login again.' },
        { status: 401 }
      );
    } else if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { error: 'Invalid ID token. Please login again.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}