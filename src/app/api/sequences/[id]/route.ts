import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const sequenceData = await request.json();
    const db = getAdminFirestore();
    const sequenceRef = db.collection('emailSequences').doc(params.id);
    
    const sequenceDoc = await sequenceRef.get();
    if (!sequenceDoc.exists || sequenceDoc.data()?.userId !== authResult.uid) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }

    await sequenceRef.update({
      ...sequenceData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update sequence error:', error);
    return NextResponse.json({ error: 'Failed to update sequence' }, { status: 500 });
  }
}