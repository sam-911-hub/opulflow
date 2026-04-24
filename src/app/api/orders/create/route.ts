import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin';
import { getUserFriendlyErrorMessage } from '@/lib/errorMessages';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session');

    if (!session?.value) {
      return NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 });
    }

    // Verify token
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value);
    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { userId: requestUserId, userEmail, productName, productLink, platforms, quantity, tone, instructions, totalCost } = body;

    if (!productName || !platforms || !quantity || !totalCost) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from Firestore to get email (but use provided email as fallback)
    const db = getFirebaseAdminDb();
    let userEmailFinal = userEmail || decodedToken.email;

    // Try to get user from Firestore for updated email
    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        userEmailFinal = userData?.email || userEmailFinal;
      }
    } catch (firestoreError) {
      // Continue with provided email if Firestore fails
      console.error('User lookup error:', firestoreError);
    }

    // Generate order ID
    const finalOrderId = `OPF-${Date.now()}-COMMENTS`;
    const timestamp = new Date();

    // Create order document
    const orderRef = db.collection('orders').doc(finalOrderId);
    await orderRef.set({
      orderId: finalOrderId,
      userId,
      userEmail: userEmailFinal,
      service: 'comments',
      formData: {
        productName,
        productLink,
        platforms,
        quantity,
        tone,
        instructions,
      },
      totalCost,
      paymentMethod: 'pending', // Will be updated when payment is confirmed
      mpesaCode: null,
      status: 'pending',
      createdAt: timestamp,
    });

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
      message: 'Order placed successfully. We will process your order soon!',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}