import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebaseClient';
import { getFirebaseAuth } from './firebaseClient';

/**
 * Fallback function to create an order directly in Firestore
 * Used when the API endpoint is not available
 */
export async function createOrderFallback(orderData: {
  service: string;
  formData: any;
  totalCost: number;
  paymentMethod: string;
  mpesaCode?: string;
  status: string;
  orderId: string;
  userEmail?: string;
}): Promise<{ success: boolean; orderId: string; message: string }> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const db = getFirebaseDb();
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found in Firestore');
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits || 0;

    // Check credits if payment method is credits
    if (orderData.paymentMethod === 'credits' && currentCredits < orderData.totalCost) {
      throw new Error('Insufficient credits');
    }

    const timestamp = new Date();
    const finalOrderId = orderData.orderId;

    // Deduct credits if paying with credits
    if (orderData.paymentMethod === 'credits' && orderData.totalCost > 0) {
      const newCredits = currentCredits - orderData.totalCost;
      await updateDoc(userRef, { credits: newCredits });
    }

    // Create order document
    const orderRef = doc(db, 'orders', finalOrderId);
    await setDoc(orderRef, {
      orderId: finalOrderId,
      userId: user.uid,
      userEmail: orderData.userEmail || userData?.email || user.email,
      service: orderData.service,
      formData: orderData.formData,
      totalCost: orderData.totalCost,
      paymentMethod: orderData.paymentMethod,
      mpesaCode: orderData.mpesaCode || null,
      status: orderData.status,
      createdAt: timestamp,
      createdVia: 'client_fallback', // Track that this was created via client fallback
      // Legacy fields for backward compatibility
      productName: orderData.formData?.productName || '',
      productLink: orderData.formData?.productLink || '',
      platforms: orderData.formData?.platforms || [],
      quantity: orderData.formData?.quantity || orderData.formData?.numInfluencers || 1,
      tone: orderData.formData?.tone || '',
      instructions: orderData.formData?.specialInstructions || orderData.formData?.keyPoints || '',
    });

    console.log('✅ Order created via Firestore fallback:', finalOrderId);

    return {
      success: true,
      orderId: finalOrderId,
      message: 'Order created successfully via offline mode. Our team will process it shortly.',
    };
  } catch (error: any) {
    console.error('Fallback order creation error:', error);
    throw error;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
