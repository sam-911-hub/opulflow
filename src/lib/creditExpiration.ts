import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface CreditExpiration {
  id: string;
  userId: string;
  creditType: string;
  amount: number;
  remaining: number;
  purchaseDate: string;
  expiresAt: string;
  reminderSent: boolean;
}

// Set up credit expiration for a user
export async function setupCreditExpiration(
  userId: string,
  creditType: string,
  amount: number,
  expirationDays: number = 30
): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (expirationDays * 24 * 60 * 60 * 1000));

  try {
    const expirationRef = await addDoc(collection(db, 'creditExpirations'), {
      userId,
      creditType,
      amount,
      remaining: amount,
      purchaseDate: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      reminderSent: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log(`Credit expiration set up for user ${userId}, expires at ${expiresAt.toISOString()}`);
    return expirationRef.id;
  } catch (error) {
    console.error('Error setting up credit expiration:', error);
    throw error;
  }
}

// Get credits that are about to expire (within 7 days)
export async function getExpiringCredits(userId: string, days: number = 7): Promise<CreditExpiration[]> {
  try {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    const expirationRef = collection(db, 'creditExpirations');
    const q = query(
      expirationRef,
      where("userId", "==", userId),
      where("expiresAt", "<=", thresholdDate.toISOString()),
      where("expiresAt", ">", now.toISOString()),
      where("remaining", ">", 0)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error getting expiring credits:', error);
    throw error;
  }
}