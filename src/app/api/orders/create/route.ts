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

    // Send email notification to admin
    const adminEmail = process.env.FROM_EMAIL || 'opulflow.inc@gmail.com';
    
    const emailBody = `
New Order Received!

Order ID: ${orderId}
User Email: ${userEmail}

Product/Service: ${productName}
Platforms: ${platforms.join(', ')}
Quantity: ${quantity}
Tone: ${tone}
Instructions: ${instructions || 'None'}

Cost: ${totalCost} credits
Status: pending
Date: ${timestamp.toISOString()}
    `.trim();

    // Log for now (email sending would require additional setup)
    console.log(`ORDER EMAIL TO ${adminEmail}:`);
    console.log(emailBody);

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}