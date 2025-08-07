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
    
    // Get request data
    const { sequenceId, contactIds } = await request.json();
    
    if (!sequenceId) {
      return NextResponse.json({ error: 'Sequence ID is required' }, { status: 400 });
    }
    
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'At least one contact ID is required' }, { status: 400 });
    }
    
    // Get sequence from Firestore
    const db = getAdminFirestore();
    const sequenceRef = db.collection('sequences').doc(sequenceId);
    const sequenceDoc = await sequenceRef.get();
    
    if (!sequenceDoc.exists) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }
    
    // Check if user owns the sequence
    const sequenceData = sequenceDoc.data();
    if (sequenceData?.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if sequence is active
    if (!sequenceData?.active) {
      return NextResponse.json({ error: 'Sequence is not active' }, { status: 400 });
    }
    
    // Verify contacts exist and belong to user
    const contactPromises = contactIds.map(contactId => 
      db.collection('contacts').doc(contactId).get()
    );
    
    const contactDocs = await Promise.all(contactPromises);
    
    const invalidContacts = contactDocs.filter(doc => 
      !doc.exists || doc.data()?.userId !== uid
    );
    
    if (invalidContacts.length > 0) {
      return NextResponse.json({ 
        error: 'One or more contacts are invalid or do not belong to you' 
      }, { status: 400 });
    }
    
    // Create sequence executions
    const batch = db.batch();
    const now = new Date();
    
    contactIds.forEach(contactId => {
      const executionRef = db.collection('sequenceExecutions').doc();
      batch.set(executionRef, {
        userId: uid,
        sequenceId,
        contactId,
        status: 'scheduled',
        currentStep: 0,
        nextStepDate: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });
    
    await batch.commit();
    
    return NextResponse.json({
      success: true,
      contactsCount: contactIds.length,
    });
  } catch (error) {
    console.error('Start sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to start sequence' },
      { status: 500 }
    );
  }
}