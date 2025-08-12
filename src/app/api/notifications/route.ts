import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unread') === 'true';

    if (!adminDb) {
      return NextResponse.json({ notifications: [] });
    }

    let query = adminDb.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (unreadOnly) {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, message, type = 'info' } = await request.json();
    
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const notificationRef = adminDb.collection('notifications').doc();

    await notificationRef.set({
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: notificationRef.id });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}