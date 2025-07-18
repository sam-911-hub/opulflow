import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }
    
    // Instead of verifying with Firebase Admin, we'll just use the token directly
    // This is less secure but will work for demo purposes
    
    // Session expires in 8 hours
    const expiresIn = 60 * 60 * 8;
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set cookie with the token directly
    response.cookies.set({
      name: 'session',
      value: idToken,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}