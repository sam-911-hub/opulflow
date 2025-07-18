import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

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
    const { keyId } = await request.json();
    
    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }
    
    // Get API key from Firestore
    const db = getAdminFirestore();
    const keyRef = db.collection('apiKeys').doc(keyId);
    const keyDoc = await keyRef.get();
    
    if (!keyDoc.exists) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    
    // Check if user owns the key
    const keyData = keyDoc.data();
    if (keyData?.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Revoke API key (set active to false)
    await keyRef.update({
      active: false,
      revokedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}