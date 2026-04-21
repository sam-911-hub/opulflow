import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session');
    
    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value);
    const userEmail = decodedToken.email;

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(userEmail || '')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { userEmail: targetEmail, creditsToAdd } = body;

    if (!targetEmail || !creditsToAdd) {
      return NextResponse.json({ error: 'Email and credits amount required' }, { status: 400 });
    }

    // Find user by email in Firestore
    const db = getFirebaseAdminDb();
    const usersSnapshot = await db.collection('users')
      .where('email', '==', targetEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;

    // Update credits
    await userDoc.ref.update({
      credits: currentCredits + creditsToAdd,
    });

    return NextResponse.json({
      success: true,
      message: `Added ${creditsToAdd} credits to ${targetEmail}`,
      newCredits: currentCredits + creditsToAdd,
    });
  } catch (error: any) {
    console.error('Add credits error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}