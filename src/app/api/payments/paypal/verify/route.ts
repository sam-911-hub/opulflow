import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

// PayPal API base URL based on environment
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}

// Credit packages mapping (amount in USD to credits)
const CREDIT_PACKAGES: Record<number, number> = {
  5: 100,
  10: 250,
  25: 750,
  50: 1750,
  100: 4000,
};

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get request data
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Verify PayPal order
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const orderData = await response.json();
    
    if (orderData.error) {
      throw new Error(orderData.error.message);
    }
    
    // Check if payment is completed
    if (orderData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
    
    // Get payment amount
    const amount = parseFloat(orderData.purchase_units[0].payments.captures[0].amount.value);
    
    // Calculate credits based on amount
    let credits = 0;
    if (amount in CREDIT_PACKAGES) {
      credits = CREDIT_PACKAGES[amount];
    } else {
      // Default conversion: $1 = 15 credits
      credits = Math.floor(amount * 15);
    }
    
    // Update user credits in Firestore
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(uid);
    
    // Use transaction to safely update credits
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentCredits = userData?.credits || 0;
      
      transaction.update(userRef, {
        credits: currentCredits + credits,
        updatedAt: new Date().toISOString(),
      });
      
      // Record transaction
      const transactionRef = db.collection('creditTransactions').doc();
      transaction.set(transactionRef, {
        userId: uid,
        amount,
        credits,
        orderId,
        paymentMethod: 'paypal',
        timestamp: new Date().toISOString(),
        type: 'purchase',
      });
    });
    
    return NextResponse.json({
      success: true,
      credits,
      orderId,
    });
  } catch (error: any) {
    console.error('PayPal verify order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify PayPal order' },
      { status: 500 }
    );
  }
}