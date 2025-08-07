import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiMiddleware';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Get checkout request ID from query params
      const url = new URL(req.url);
      const checkoutRequestId = url.searchParams.get('checkoutRequestId');
      
      if (!checkoutRequestId) {
        return NextResponse.json({ 
          success: false, 
          message: 'Checkout request ID is required' 
        }, { status: 400 });
      }
      
      // Query Firestore for the payment
      const paymentsRef = collection(db, 'mpesaPayments');
      const q = query(
        paymentsRef, 
        where("checkoutRequestId", "==", checkoutRequestId),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return NextResponse.json({ 
          success: false, 
          message: 'Payment not found' 
        }, { status: 404 });
      }
      
      const payment = querySnapshot.docs[0].data();
      
      // Return payment status
      return NextResponse.json({
        success: true,
        status: payment.status,
        details: {
          amount: payment.amount,
          currency: payment.currency,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt || null,
          mpesaReceiptNumber: payment.mpesaReceiptNumber || null
        }
      });
      
    } catch (error) {
      console.error('M-PESA status check error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to check payment status' 
      }, { status: 500 });
    }
  });
}