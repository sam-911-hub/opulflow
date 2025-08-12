import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    
    if (!adminDb) {
      return NextResponse.json({
        contacts: [],
        pagination: { total: 0, limit: 50, offset: 0, hasMore: false }
      });
    }
    
    const snapshot = await adminDb.collection('contacts').orderBy('createdAt', 'desc').get();
    let allContacts = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    
    // Magic search
    if (search) {
      const searchLower = search.toLowerCase();
      allContacts = allContacts.filter((contact: any) => {
        return (
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.title?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return NextResponse.json({
      contacts: allContacts,
      pagination: { total: allContacts.length, limit: 50, offset: 0, hasMore: false },
      searchTerm: search
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json({
      contacts: [],
      pagination: { total: 0, limit: 50, offset: 0, hasMore: false }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contactData = await request.json();
    
    if (!contactData.name || !contactData.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    const contact = {
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await adminDb.collection('contacts').add(contact);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id, 
      contact: { id: docRef.id, ...contact }
    });
  } catch (error) {
    console.error("API /api/contacts error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error instanceof Error ? error.message : error }), { status: 500 });
  }
}