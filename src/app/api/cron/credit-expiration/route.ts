import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// This route should be protected with a cron job secret
// It should be called by a scheduled task (e.g., Vercel Cron)

export async function GET(request: NextRequest) {
  try {
    // Verify cron job secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all credit expirations that are due
    const expirationDate = new Date().toISOString();
    const expirationRef = collection(db, 'creditExpirations');
    const q = query(expirationRef, where("expiresAt", "<=", expirationDate));
    const querySnapshot = await getDocs(q);
    
    // Process each expiration
    const results = {
      processed: 0,
      errors: 0
    };
    
    for (const doc of querySnapshot.docs) {
      try {
        const expiration = doc.data();
        const { userId, creditId, type, remaining } = expiration;
        
        if (remaining > 0) {
          // Update user's credit balance
          const userRef = doc(db, "users", userId);
          const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", userId)));
          
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            const currentCredits = userData.credits?.[type] || 0;
            
            // Deduct expired credits
            await updateDoc(userRef, {
              [`credits.${type}`]: Math.max(0, currentCredits - remaining)
            });
            
            // Record transaction
            await addDoc(collection(db, `users/${userId}/transactions`), {
              type: 'expiration',
              amount: remaining,
              service: type,
              createdAt: new Date().toISOString(),
              remainingBalance: Math.max(0, currentCredits - remaining)
            });
          }
        }
        
        // Delete the expiration record
        await doc.ref.delete();
        
        results.processed++;
      } catch (error) {
        console.error('Error processing credit expiration:', error);
        results.errors++;
      }
    }
    
    return NextResponse.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('Credit expiration cron error:', error);
    return NextResponse.json({ error: 'Failed to process credit expirations' }, { status: 500 });
  }
}