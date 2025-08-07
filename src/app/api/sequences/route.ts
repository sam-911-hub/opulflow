import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const db = getAdminFirestore();
    const snapshot = await db.collection('emailSequences')
      .where('userId', '==', authResult.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const sequences = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ sequences });
  } catch (error) {
    console.error('Get sequences error:', error);
    return NextResponse.json({ error: 'Failed to get sequences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const sequenceData = await request.json();
    
    if (!sequenceData.name || !sequenceData.emails) {
      return NextResponse.json({ error: 'Name and emails are required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const sequenceRef = db.collection('emailSequences').doc();

    await sequenceRef.set({
      ...sequenceData,
      userId: authResult.uid,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: sequenceRef.id });
  } catch (error) {
    console.error('Create sequence error:', error);
    return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 });
  }
}