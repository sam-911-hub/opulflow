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
    
    // Get sequences from Firestore
    const db = getAdminFirestore();
    const snapshot = await db.collection('sequences')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();
    
    // Format results
    const sequences = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        stepsCount: data.steps?.length || 0,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
    
    // Get total count
    const countSnapshot = await db.collection('sequences')
      .where('userId', '==', uid)
      .count()
      .get();
    
    const total = countSnapshot.data().count;
    
    return NextResponse.json({
      sequences,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + sequences.length < total,
      }
    });
  } catch (error) {
    console.error('List sequences error:', error);
    return NextResponse.json(
      { error: 'Failed to list sequences' },
      { status: 500 }
    );
  }
}