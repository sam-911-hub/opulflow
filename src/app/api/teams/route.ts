import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ teams: [] });
    }

    const snapshot = await adminDb.collection('teams')
      .orderBy('createdAt', 'desc')
      .get();

    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ teams: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const teamRef = adminDb.collection('teams').doc();

    await teamRef.set({
      name,
      description: description || '',
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: teamRef.id });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}