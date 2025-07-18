import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiMiddleware-edge';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { convertUSDToLocal } from '@/lib/currency';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Get request data
      const { phoneNumber, amount, currency = 'KES', packageId } = await req.json();
      
      if (!phoneNumber || !amount || !packageId) {
        return NextResponse.json({ 
          success: false, 
          message: 'Phone number, amount, and package ID are required' 
        }, { status: 400 });
      }
      
      // Convert amount to local currency if needed
      const localAmount = typeof amount === 'number' 
        ? convertUSDToLocal(amount, currency)
        : amount;
      
      // In a real implementation, you would call the M-PESA API here
      // For now, we'll simulate the STK push
      
      // Generate a unique checkout request ID
      const checkoutRequestId = `CRQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Save the payment request to Firestore
      await addDoc(collection(db, 'mpesaPayments'), {
        userId,
        phoneNumber,
        amount: localAmount,
        currency,
        packageId,
        checkoutRequestId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'STK push initiated. Please check your phone.',
        checkoutRequestId
      });
      
    } catch (error) {
      console.error('M-PESA STK push error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to initiate M-PESA payment' 
      }, { status: 500 });
    }
  });
}