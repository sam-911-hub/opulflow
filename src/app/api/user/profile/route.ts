import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { adminDb } = await import('@/lib/firebase-admin');
    const userDoc = await adminDb.collection('users').doc(email).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    return NextResponse.json({
      email,
      name: userData?.name || '',
      phone: userData?.phone || ''
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;
    
    if (!email || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const profileData = { 
      email, 
      name: name.trim(), 
      phone: phone.trim(), 
      lastUpdated: new Date().toISOString() 
    };
    
    const { adminDb } = await import('@/lib/firebase-admin');
    await adminDb.collection('users').doc(email).set(profileData, { merge: true });
    
    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}