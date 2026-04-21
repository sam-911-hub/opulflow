import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session');
    
    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value);
    const userId = decodedToken.uid;

    // Get orders from Firestore
    const db = getFirebaseAdminDb();
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
      return {
        id: doc.id,
        orderId: data.orderId || doc.id,
        status: data.status || 'pending',
        date: createdAt,
        amount: data.totalCost || data.creditsUsed || 0,
        quantity: data.quantity || 0,
      };
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ orders: [] });
  }
}