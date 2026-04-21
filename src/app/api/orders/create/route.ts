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
    const { userId: bodyUserId, userEmail, productName, platforms, quantity, tone, instructions, totalCost } = body;

    // Verify user owns the session
    if (userId !== bodyUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get user credits from Firestore
    const db = getFirebaseAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;

    // Check if user has enough credits
    if (currentCredits < totalCost) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        currentCredits,
        requiredCredits: totalCost
      }, { status: 400 });
    }

    // Generate order ID
    const orderId = `OPF-${Date.now()}`;
    const timestamp = new Date();

    // Create order document
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.set({
      orderId,
      userId,
      userEmail,
      productName,
      platforms,
      quantity,
      tone,
      instructions: instructions || '',
      totalCost,
      creditsUsed: totalCost,
      status: 'pending',
      createdAt: timestamp,
    });

    // Deduct credits from user
    await userRef.update({
      credits: currentCredits - totalCost,
    });

    // Send email notification to admin (non-blocking)
    try {
      await fetch(`${request.nextUrl.origin}/api/orders/send-admin-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userEmail,
          productName,
          platforms,
          quantity,
          tone,
          instructions,
          totalCost,
          status: 'pending',
          createdAt: timestamp.toISOString(),
        }),
      });
    } catch (emailError) {
      console.error('Failed to send admin email (non-blocking):', emailError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully. We will process your order soon!',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}