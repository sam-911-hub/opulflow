import { NextRequest, NextResponse } from 'next/server';
import { mockApiKeys } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return mock API keys
    return NextResponse.json({ apiKeys: mockApiKeys });
    
    // NOTE: In production, you would use the Firestore code below
    /*
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get API keys from Firestore
    const db = getAdminFirestore();
    const snapshot = await db.collection('apiKeys')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Format results (hide full key)
    const apiKeys = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt,
        lastUsed: data.lastUsed,
        active: data.active,
        // Only return first and last 4 chars of the key
        keyPreview: `${data.key.substring(0, 9)}...${data.key.substring(data.key.length - 4)}`,
      };
    });
    
    return NextResponse.json({ apiKeys });
    */
  } catch (error) {
    console.error('List API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}