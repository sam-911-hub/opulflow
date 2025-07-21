import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const { sessionCookie } = await request.json();
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session cookie provided' }, { status: 400 });
    }
    
    // Verify the session cookie using the admin SDK (server-side only)
    const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    
    // Get additional user data if needed
    const user = await getAdminAuth().getUser(decodedToken.uid);
    
    // Check if user is admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
    const isAdmin = adminEmails.includes(user.email || '');
    
    // Return user data
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      token: {
        admin: isAdmin
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

// Ensure this route is not bundled with Edge runtime
export const runtime = 'nodejs';