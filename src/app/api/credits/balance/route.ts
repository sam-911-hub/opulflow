import { NextRequest, NextResponse } from 'next/server';
import { mockDashboardStats } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return mock credits data
    return NextResponse.json({ credits: mockDashboardStats.currentCredits });
    
    // NOTE: In production, you would use the Firestore code below
    /*
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get user credits from Firestore
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const credits = userData?.credits || 0;
    
    return NextResponse.json({ credits });
    */
  } catch (error) {
    console.error('Get credits balance error:', error);
    return NextResponse.json(
      { error: 'Failed to get credits balance' },
      { status: 500 }
    );
  }
}