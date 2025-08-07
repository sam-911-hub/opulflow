import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get callback data from M-PESA
    const callbackData = await request.json();
    
    // Extract the necessary information
    const { Body } = callbackData;
    
    if (!Body || !Body.stkCallback) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }
    
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
    
    // Find the payment record using CheckoutRequestID
    const paymentsRef = collection(db, 'mpesaPayments');
    const q = query(paymentsRef, where("checkoutRequestId", "==", CheckoutRequestID));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }
    
    const paymentDoc = querySnapshot.docs[0];
    const payment = paymentDoc.data();
    const { userId, packageId, amount } = payment;
    
    // Update payment status
    if (ResultCode === 0) {
      // Payment successful
      // Extract transaction details
      let mpesaReceiptNumber = '';
      let phoneNumber = '';
      let transactionDate = '';
      let amount = 0;
      
      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach((item: any) => {
          if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
          if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
          if (item.Name === 'TransactionDate') transactionDate = item.Value;
          if (item.Name === 'Amount') amount = item.Value;
        });
      }
      
      // Update payment record
      await updateDoc(paymentDoc.ref, {
        status: 'completed',
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate,
        amount,
        completedAt: new Date().toISOString()
      });
      
      // Process the payment (add credits to user account)
      // In a real implementation, you would call a function to process the payment
      // For example:
      // await processPayment(userId, packageId, 'mpesa', mpesaReceiptNumber);
      
      return NextResponse.json({ success: true });
    } else {
      // Payment failed
      await updateDoc(paymentDoc.ref, {
        status: 'failed',
        failureReason: ResultDesc,
        failedAt: new Date().toISOString()
      });
      
      return NextResponse.json({ success: false, reason: ResultDesc });
    }
  } catch (error) {
    console.error('M-PESA callback error:', error);
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 });
  }
}