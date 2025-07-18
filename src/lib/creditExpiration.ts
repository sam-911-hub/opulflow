import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { addDays } from 'date-fns';
import { CreditType } from '@/types/interfaces';

// Credit expiration period in days
const EXPIRATION_DAYS = 90;

/**
 * Track credit expiration for purchased credits
 * @param userId User ID
 * @param creditType Type of credit
 * @param amount Amount of credits
 * @returns Promise<string> ID of the expiration record
 */
export async function trackCreditExpiration(
  userId: string,
  creditType: CreditType,
  amount: number
): Promise<string> {
  try {
    // Calculate expiration date (90 days from now)
    const expiresAt = addDays(new Date(), EXPIRATION_DAYS).toISOString();
    
    // Create expiration record
    const expirationRef = await addDoc(collection(db, 'creditExpirations'), {
      userId,
      type: creditType,
      amount,
      remaining: amount,
      purchasedAt: new Date().toISOString(),
      expiresAt,
    });
    
    return expirationRef.id;
  } catch (error) {
    console.error('Error tracking credit expiration:', error);
    throw error;
  }
}

/**
 * Get credits expiring soon for a user
 * @param userId User ID
 * @param daysThreshold Number of days to consider "soon" (default: 7)
 * @returns Promise<Array> Array of expiration records
 */
export async function getCreditsExpiringSoon(
  userId: string,
  daysThreshold = 7
): Promise<any[]> {
  try {
    const now = new Date();
    const thresholdDate = addDays(now, daysThreshold).toISOString();
    
    // Query for credits expiring soon
    const expirationRef = collection(db, 'creditExpirations');
    const q = query(
      expirationRef,
      where("userId", "==", userId),
      where("expiresAt", "<=", thresholdDate),
      where("expiresAt", ">", now.toISOString()),
      where("remaining", ">", 0)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting credits expiring soon:', error);
    throw error;
  }
}