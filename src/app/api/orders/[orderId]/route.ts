import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const session = request.cookies.get('session');
    
    if (!session?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value);
    const userId = decodedToken.uid;

    // Get orderId from params
    const { orderId } = await params;
    
    // Get order from Firestore
    const db = getFirebaseAdminDb();
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data();

    // Verify user owns the order
    if (orderData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ order: { id: orderDoc.id, ...orderData } });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}