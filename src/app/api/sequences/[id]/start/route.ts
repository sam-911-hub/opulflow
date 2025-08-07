import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { contactIds } = await request.json();
    
    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json({ error: 'Contact IDs are required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const sequenceRef = db.collection('emailSequences').doc(params.id);
    
    const sequenceDoc = await sequenceRef.get();
    if (!sequenceDoc.exists || sequenceDoc.data()?.userId !== authResult.uid) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    // Create sequence runs for each contact
    const batch = db.batch();
    contactIds.forEach(contactId => {
      const runRef = db.collection('sequenceRuns').doc();
      batch.set(runRef, {
        sequenceId: params.id,
        contactId,
        userId: authResult.uid,
        status: 'active',
        currentStep: 0,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    return NextResponse.json({ success: true, started: contactIds.length });
  } catch (error) {
    console.error('Start sequence error:', error);
    return NextResponse.json({ error: 'Failed to start sequence' }, { status: 500 });
  }
}