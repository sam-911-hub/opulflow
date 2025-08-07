import { db } from './firebase';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { trackCreditExpiration } from './creditExpiration';
import { sendNotification } from './notifications';
import { CreditPackage } from '@/types';

/**
 * Process a successful payment
 * @param userId User ID
 * @param packageItem Credit package
 * @param paymentMethod Payment method
 * @param paymentId Payment ID
 * @returns Promise<boolean> Success status
 */
export async function processPayment(
  userId: string,
  packageItem: CreditPackage,
  paymentMethod: string,
  paymentId: string
): Promise<boolean> {
  try {
    // Get user reference
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Handle bundle packages with multiple credit types
    if (packageItem.includes) {
      // Update each credit type included in the bundle
      const updates: Record<string, number> = {};
      
      for (const [creditType, amount] of Object.entries(packageItem.includes)) {
        updates[`credits.${creditType}`] = ((userData?.credits?.[creditType] || 0) + amount);
        
        // Track credit expiration
        await trackCreditExpiration(userId, creditType as any, amount);
        
        // Record transaction for each credit type
        await addDoc(collection(db, `users/${userId}/transactions`), {
          type: "purchase",
          amount: amount,
          service: creditType,
          createdAt: new Date().toISOString(),
          remainingBalance: ((userData?.credits?.[creditType] || 0) + amount),
          bundleId: packageItem.id,
          paymentDetails: {
            packageName: packageItem.description,
            serviceType: creditType,
            unitPrice: packageItem.price / Object.keys(packageItem.includes).length,
            totalPrice: packageItem.price,
            paymentMethod,
            paymentId,
            purchaseDate: new Date().toISOString()
          }
        });
      }
      
      // Update user's credit balance
      await updateDoc(userRef, updates);
    } else {
      // Standard single credit type package
      const currentBalance = userData?.credits?.[packageItem.type] || 0;
      const newBalance = currentBalance + packageItem.amount;
      
      // Update user's credit balance
      await updateDoc(userRef, {
        [`credits.${packageItem.type}`]: newBalance
      });
      
      // Track credit expiration
      await trackCreditExpiration(userId, packageItem.type, packageItem.amount);
      
      // Record transaction
      await addDoc(collection(db, `users/${userId}/transactions`), {
        type: "purchase",
        amount: packageItem.amount,
        service: packageItem.type,
        createdAt: new Date().toISOString(),
        remainingBalance: newBalance,
        paymentDetails: {
          packageName: packageItem.description,
          serviceType: packageItem.type,
          unitPrice: packageItem.price / packageItem.amount,
          totalPrice: packageItem.price,
          paymentMethod,
          paymentId,
          purchaseDate: new Date().toISOString()
        }
      });
    }
    
    // Send notification
    await sendNotification(
      userId,
      `Successfully purchased ${packageItem.description}!`,
      'success'
    );
    
    return true;
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Send error notification
    await sendNotification(
      userId,
      'Failed to process payment. Please contact support.',
      'error'
    );
    
    return false;
  }
}