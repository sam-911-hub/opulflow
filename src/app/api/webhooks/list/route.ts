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
    
    // Get webhooks from Firestore
    const db = getAdminFirestore();
    const snapshot = await db.collection('webhooks')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Format results (hide full secret)
    const webhooks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        url: data.url,
        events: data.events,
        description: data.description,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // Only return first and last 4 chars of the secret
        secretPreview: `${data.secret.substring(0, 4)}...${data.secret.substring(data.secret.length - 4)}`,
      };
    });
    
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('List webhooks error:', error);
    return NextResponse.json(
      { error: 'Failed to list webhooks' },
      { status: 500 }
    );
  }
}