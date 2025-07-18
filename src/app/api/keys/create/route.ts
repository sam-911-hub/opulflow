import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';
import crypto from 'crypto';

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
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }
    
    // Generate API key
    const apiKey = `opul_${crypto.randomBytes(24).toString('hex')}`;
    
    // Store API key in Firestore
    const db = getAdminFirestore();
    const keyRef = db.collection('apiKeys').doc();
    
    await keyRef.set({
      userId: uid,
      name,
      key: apiKey,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      active: true,
    });
    
    return NextResponse.json({
      id: keyRef.id,
      name,
      key: apiKey,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}