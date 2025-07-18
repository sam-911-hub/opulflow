import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin
function initAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }
    
    // Session expires in 8 hours
    const expiresIn = 60 * 60 * 8 * 1000;
    
    // Initialize admin and create session cookie
    const app = initAdmin();
    const auth = getAuth(app);
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // Set cookie options
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set(options);
    
    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}