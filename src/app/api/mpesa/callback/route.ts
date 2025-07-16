import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    console.log('M-PESA Callback received:', callbackData);
    
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { CallbackMetadata } = stkCallback;
      const metadata = CallbackMetadata.Item;
      
      // Extract payment details
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
      
      // Find user by phone number and update credits
      // Note: You'll need to store phone numbers during payment initiation
      // For now, we'll log the successful payment
      
      console.log('Payment successful:', {
        amount,
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate
      });
      
      // TODO: Update user credits based on payment
      // This requires linking the payment to a specific user and package
      
    } else {
      // Payment failed
      console.log('Payment failed:', stkCallback.ResultDesc);
    }
    
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
    
  } catch (error) {
    console.error('M-PESA callback error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Error' });
  }
}