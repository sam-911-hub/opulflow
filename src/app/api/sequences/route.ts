import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ sequences: [] });
    }

    const snapshot = await adminDb.collection('emailSequences')
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
    return NextResponse.json({ sequences: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sequenceData = await request.json();
    
    if (!sequenceData.name || !sequenceData.emails) {
      return NextResponse.json({ error: 'Name and emails are required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const sequenceRef = adminDb.collection('emailSequences').doc();

    await sequenceRef.set({
      ...sequenceData,
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