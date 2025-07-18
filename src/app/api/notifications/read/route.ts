import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function PUT(request: NextRequest) {
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
    const { notificationIds, all } = await request.json();
    
    const db = getAdminFirestore();
    
    // Mark all notifications as read
    if (all === true) {
      // Get all unread notifications
      const snapshot = await db.collection('notifications')
        .where('userId', '==', uid)
        .where('read', '==', false)
        .get();
      
      // Update in batches
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: new Date().toISOString(),
        });
      });
      
      await batch.commit();
      
      return NextResponse.json({
        success: true,
        count: snapshot.size,
      });
    }
    
    // Mark specific notifications as read
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'Notification IDs are required' }, { status: 400 });
    }
    
    // Verify notifications belong to user
    const notificationPromises = notificationIds.map(id => 
      db.collection('notifications').doc(id).get()
    );
    
    const notificationDocs = await Promise.all(notificationPromises);
    
    const batch = db.batch();
    let validCount = 0;
    
    notificationDocs.forEach(doc => {
      if (doc.exists && doc.data()?.userId === uid) {
        batch.update(doc.ref, {
          read: true,
          readAt: new Date().toISOString(),
        });
        validCount++;
      }
    });
    
    await batch.commit();
    
    return NextResponse.json({
      success: true,
      count: validCount,
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}