import { NextResponse } from 'next/server';

export async function GET() {
  // Temporarily allow in production for debugging
  // if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEBUG_MODE !== 'true') {
  //   return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 });
  // }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY ? 'Set' : 'Not set',
    VERCEL: process.env.VERCEL ? 'Set' : 'Not set',
    
    // Firebase Admin credentials (show length, not actual values)
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID ? `Set (${process.env.FIREBASE_ADMIN_PROJECT_ID})` : 'Not set',
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? `Set (${process.env.FIREBASE_ADMIN_CLIENT_EMAIL})` : 'Not set',
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? `Set (length: ${process.env.FIREBASE_ADMIN_PRIVATE_KEY.length})` : 'Not set',
    
    // Firebase client config
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not set',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Not set',
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Not set',
    
    // Other config
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'Set' : 'Not set',
    ADMIN_EMAILS: process.env.ADMIN_EMAILS ? 'Set' : 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    N8N_API_KEY: process.env.N8N_API_KEY ? 'Set' : 'Not set',
    PAYPAL_SECRET: process.env.PAYPAL_SECRET ? 'Set' : 'Not set',
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'Set' : 'Not set',
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    platform: process.env.NETLIFY ? 'Netlify' : process.env.VERCEL ? 'Vercel' : 'Unknown',
    environment: envVars
  });
}