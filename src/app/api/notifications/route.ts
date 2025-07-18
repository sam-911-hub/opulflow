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
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread') === 'true';
    
    // Query notifications from Firestore
    const db = getAdminFirestore();
    let query = db.collection('notifications')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc');
    
    if (unreadOnly) {
      query = query.where('read', '==', false);
    }
    
    const snapshot = await query.limit(limit).offset(offset).get();
    
    // Format results
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Get unread count
    const unreadSnapshot = await db.collection('notifications')
      .where('userId', '==', uid)
      .where('read', '==', false)
      .count()
      .get();
    
    const unreadCount = unreadSnapshot.data().count;
    
    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}