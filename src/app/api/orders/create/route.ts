import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { getFirebaseAdminDb } from '@/lib/firebaseAdmin';
import { getUserFriendlyErrorMessage } from '@/lib/errorMessages';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session');

    if (!session?.value) {
      console.warn('Order creation: No session cookie found');
      return NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 });
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = await getFirebaseAdminAuth().verifyIdToken(session.value);
    } catch (authError) {
      console.error('Order creation: Token verification failed:', authError);
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { service, formData, totalCost, paymentMethod, mpesaCode, status = 'pending', orderId } = body;

    if (!service || !formData || totalCost === undefined) {
      console.warn('Order creation: Missing required fields', { service, formData: !!formData, totalCost });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from Firestore to get email and credits
    let db;
    try {
      db = getFirebaseAdminDb();
    } catch (dbError) {
      console.error('Order creation: Failed to initialize database:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const userRef = db.collection('users').doc(userId);
    let userDoc;
    try {
      userDoc = await userRef.get();
    } catch (getError) {
      console.error('Order creation: Failed to fetch user:', getError);
      return NextResponse.json({ error: 'Failed to fetch user information' }, { status: 500 });
    }

    let userData;
    if (!userDoc.exists) {
      console.log('Order creation: User document not found, creating default:', userId);
      // Create default user document
      const defaultUserData = {
        uid: userId,
        email: decodedToken.email,
        displayName: decodedToken.email?.split('@')[0] || '',
        credits: 20,
        freeCreditsGiven: true,
        accountType: 'free',
        createdAt: new Date().toISOString(),
      };

      try {
        await userRef.set(defaultUserData);
        console.log('✅ User document created in order API');
        userData = defaultUserData;
      } catch (createError) {
        console.error('Order creation: Failed to create user document:', createError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }
    } else {
      userData = userDoc.data();
    }

    const userEmailFinal = userData?.email || decodedToken.email;

    // Use provided orderId or generate new one
    const finalOrderId = orderId || `OPF-${Date.now()}-${service.toUpperCase()}`;
    const timestamp = new Date();

    // Create order document with service-specific data
    const orderRef = db.collection('orders').doc(finalOrderId);
    try {
      await orderRef.set({
        orderId: finalOrderId,
        userId,
        userEmail: userEmailFinal,
        service,
        formData,
        totalCost,
        paymentMethod,
        mpesaCode: mpesaCode || null,
        status,
        createdAt: timestamp,
        // Legacy fields for backward compatibility
        productName: formData.productName || '',
        productLink: formData.productLink || '',
        platforms: formData.platforms || [],
        quantity: formData.quantity || formData.numInfluencers || 1,
        tone: formData.tone || '',
        instructions: formData.specialInstructions || formData.keyPoints || formData.instructions || '',
      });

      console.log('✅ Order created successfully:', finalOrderId, 'for user:', userId);

      return NextResponse.json({
        success: true,
        orderId: finalOrderId,
        message: 'Order placed successfully. We will process your order soon!',
      });
    } catch (setError) {
      console.error('Order creation: Failed to create order document:', setError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Order creation: Unexpected error:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }
}