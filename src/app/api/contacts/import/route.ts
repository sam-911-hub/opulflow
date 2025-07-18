import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

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
    
    // Get contacts data
    const { contacts } = await request.json();
    
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts provided' },
        { status: 400 }
      );
    }
    
    // Validate contacts
    const validContacts = contacts.filter(contact => 
      contact.name && contact.email && typeof contact.email === 'string'
    );
    
    if (validContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid contacts found' },
        { status: 400 }
      );
    }
    
    // Import contacts to Firestore
    const db = getAdminFirestore();
    const batch = db.batch();
    
    validContacts.forEach(contact => {
      const contactRef = db.collection('contacts').doc();
      batch.set(contactRef, {
        ...contact,
        userId: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        importedAt: new Date().toISOString(),
      });
    });
    
    await batch.commit();
    
    return NextResponse.json({
      success: true,
      imported: validContacts.length,
      total: contacts.length,
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}