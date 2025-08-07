import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Create user in Firebase Auth
    const userRecord = await getAdminAuth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
    });
    
    // Create user document in Firestore
    const db = getAdminFirestore();
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: new Date().toISOString(),
      credits: 0,
      role: 'user',
    });
    
    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid 
    });
  } catch (error: any) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 400 }
    );
  }
}