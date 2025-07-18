import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get limit and offset from query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Get credit transactions from Firestore
    const db = getAdminFirestore();
    const transactionsRef = db.collection('creditTransactions')
      .where('userId', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);
    
    const snapshot = await transactionsRef.get();
    
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json({ 
      transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
        hasMore: transactions.length === limit,
      }
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    return NextResponse.json(
      { error: 'Failed to get credit history' },
      { status: 401 }
    );
  }
}