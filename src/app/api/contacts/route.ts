import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      // Return empty contacts for unauthenticated users
      return NextResponse.json({
        contacts: [],
        pagination: {
          total: 0,
          limit: 50,
          offset: 0,
          hasMore: false,
        },
        authenticated: false
      });
    }
    
    const uid = authResult.uid;
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    
    // Query contacts from Firestore
    const db = getAdminFirestore();
    
    try {
      let contactsQuery = db.collection('contacts')
        .where('userId', '==', uid)
        .limit(Math.min(limit, 100)); // Cap at 100
      
      // Apply offset if provided
      if (offset > 0) {
        contactsQuery = contactsQuery.offset(offset);
      }
      
      // Execute query
      const snapshot = await contactsQuery.get();
      
      // Format results
      const contacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Simple total count fallback
      const total = contacts.length;
    
      return NextResponse.json({
        contacts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + contacts.length < total,
        }
      });
    } catch (queryError) {
      console.error('Contacts query error:', queryError);
      // Return empty contacts instead of error
      return NextResponse.json({
        contacts: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
        authenticated: true
      });
    }
  } catch (error) {
    console.error('Get contacts error:', error);
    // Return empty contacts instead of error
    return NextResponse.json({
      contacts: [],
      pagination: {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
      },
      authenticated: false
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const uid = authResult.uid;
    
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