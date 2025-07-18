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
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    
    // Query contacts from Firestore
    const db = getAdminFirestore();
    let contactsQuery = db.collection('contacts')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc');
    
    // Apply search if provided
    if (search) {
      // This is a simple implementation - in production, consider using a search service
      contactsQuery = contactsQuery.where('name', '>=', search)
        .where('name', '<=', search + '\uf8ff');
    }
    
    // Apply pagination
    contactsQuery = contactsQuery.limit(limit).offset(offset);
    
    // Execute query
    const snapshot = await contactsQuery.get();
    
    // Format results
    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Get total count (for pagination)
    const countSnapshot = await db.collection('contacts')
      .where('userId', '==', uid)
      .count()
      .get();
    
    const total = countSnapshot.data().count;
    
    return NextResponse.json({
      contacts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + contacts.length < total,
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to get contacts' },
      { status: 500 }
    );
  }
}

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
    
    // Get contact data
    const contactData = await request.json();
    
    if (!contactData.name || !contactData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Create contact in Firestore
    const db = getAdminFirestore();
    const contactRef = db.collection('contacts').doc();
    
    await contactRef.set({
      ...contactData,
      userId: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      id: contactRef.id,
    });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}