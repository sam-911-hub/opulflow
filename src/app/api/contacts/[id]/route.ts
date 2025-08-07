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

    const contactData = await request.json();
    const db = getAdminFirestore();
    const contactRef = db.collection('contacts').doc(params.id);
    
    const contactDoc = await contactRef.get();
    if (!contactDoc.exists || contactDoc.data()?.userId !== authResult.uid) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await contactRef.update({
      ...contactData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const db = getAdminFirestore();
    const contactRef = db.collection('contacts').doc(params.id);
    
    const contactDoc = await contactRef.get();
    if (!contactDoc.exists || contactDoc.data()?.userId !== authResult.uid) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    await contactRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}