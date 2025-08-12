import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const snapshot = await adminDb.collection('contacts').limit(limit).get();
    const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({
      contacts,
      pagination: { total: contacts.length, limit, offset, hasMore: false }
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
    
    const contactRef = adminDb.collection('contacts').doc();
    await contactRef.set({
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true, id: contactRef.id });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}