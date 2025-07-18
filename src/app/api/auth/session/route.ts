import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin with proper error handling
let firebaseApp;
try {
  // Check if app is already initialized
  firebaseApp = admin.apps.length 
    ? admin.app() 
    : admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
} catch (error) {
  console.error('Firebase admin initialization error:', error);
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }
    
    // Session expires in 8 hours
    const expiresIn = 60 * 60 * 8 * 1000;
    
    let sessionCookie;
    
    try {
      // Try to create a session cookie with Firebase Admin
      if (firebaseApp) {
        sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
      } else {
        // Fallback to using the token directly if Firebase Admin fails
        console.warn('Using ID token directly as session cookie (Firebase Admin not initialized)');
        sessionCookie = idToken;
      }
    } catch (error) {
      console.error('Error creating session cookie:', error);
      // Fallback to using the token directly
      sessionCookie = idToken;
    }
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000, // Convert to seconds
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