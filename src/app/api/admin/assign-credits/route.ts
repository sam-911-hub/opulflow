import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, isUserAdmin } from '@/lib/admin';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const isAdmin = await isUserAdmin(authResult.uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { userEmail, credits, service } = await request.json();
    
    if (!userEmail || credits === undefined || !service) {
      return NextResponse.json({ error: 'User email, credits, and service are required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userEmail);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};
    
    const currentCredits = userData.credits || {};
    currentCredits[service] = (currentCredits[service] || 0) + Number(credits);
    
    await userRef.set({
      ...userData,
      email: userEmail,
      credits: currentCredits,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Credit assignment error:', error);
    return NextResponse.json({ error: 'Failed to assign credits' }, { status: 500 });
  }
}