import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get notification settings from Firestore
    const db = getAdminFirestore();
    const settingsDoc = await db.collection('notificationSettings').doc(uid).get();
    
    // Default settings if not found
    const defaultSettings = {
      email: true,
      push: true,
      inApp: true,
      types: {
        credits: true,
        contacts: true,
        sequences: true,
        team: true,
        system: true,
      }
    };
    
    const settings = settingsDoc.exists ? settingsDoc.data() : defaultSettings;
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get notification settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get request data
    const settings = await request.json();
    
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }
    
    // Update notification settings in Firestore
    const db = getAdminFirestore();
    await db.collection('notificationSettings').doc(uid).set({
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}