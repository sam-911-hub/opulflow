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
    const type = url.searchParams.get('type') || null;
    
    // Query files from Firestore
    const db = getAdminFirestore();
    let query = db.collection('files')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc');
    
    // Filter by type if provided
    if (type) {
      query = query.where('type', '==', type);
    }
    
    // Apply pagination
    query = query.limit(limit).offset(offset);
    
    // Execute query
    const snapshot = await query.get();
    
    // Format results
    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Get total count
    const countQuery = db.collection('files').where('userId', '==', uid);
    if (type) {
      countQuery.where('type', '==', type);
    }
    
    const countSnapshot = await countQuery.count().get();
    const total = countSnapshot.data().count;
    
    return NextResponse.json({
      files,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + files.length < total,
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}