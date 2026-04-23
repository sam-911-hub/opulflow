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
    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { service, formData, totalCost, paymentMethod, mpesaCode, status = 'pending', orderId } = body;

    if (!service || !totalCost || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from Firestore to get email
    const db = getFirebaseAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const userEmail = userData?.email || decodedToken.email;

    // Use provided orderId or generate new one
    const finalOrderId = orderId || `OPF-${Date.now()}-${service.toUpperCase()}`;
    const timestamp = new Date();

    // Create order document with service-specific data
    const orderRef = db.collection('orders').doc(finalOrderId);
    await orderRef.set({
      orderId: finalOrderId,
      userId,
      userEmail,
      service,
      formData,
      totalCost,
      paymentMethod,
      mpesaCode: mpesaCode || null,
      status,
      createdAt: timestamp,
      // Legacy fields for backward compatibility
      productName: formData.productName || '',
      platforms: formData.platforms || [],
      quantity: formData.quantity || formData.numInfluencers || 1,
      tone: formData.tone || '',
      instructions: formData.specialInstructions || formData.keyPoints || '',
    });

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
      message: 'Order placed successfully. We will process your order soon!',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}