import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// M-PESA Configuration
const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  BUSINESS_SHORT_CODE: '174379',
  PASSKEY: process.env.MPESA_PASSKEY || '',
  RECEIVING_PHONE: '254790282363' // OpulFlow's M-PESA account
};

// Get M-PESA access token
async function getMpesaToken() {
  const auth = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.access_token;
}

// Generate M-PESA password
function generatePassword() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_CONFIG.BUSINESS_SHORT_CODE}${MPESA_CONFIG.PASSKEY}${timestamp}`).toString('base64');
  return { password, timestamp };
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, packageId } = await request.json();
    
    const accessToken = await getMpesaToken();
    const { password, timestamp } = generatePassword();
    
    const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber.substring(1)}`;
    
    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXTAUTH_URL}/api/mpesa/callback`,
      AccountReference: 'OpulFlow',
      TransactionDesc: `OpulFlow Credits - ${packageId}`
    };
    
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushData)
    });
    
    const result = await response.json();
    
    if (result.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        checkoutRequestId: result.CheckoutRequestID,
        message: 'Check your phone for M-PESA prompt'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.ResponseDescription || 'Payment failed'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('M-PESA error:', error);
    return NextResponse.json({
      success: false,
      message: 'Payment failed'
    }, { status: 500 });
  }
}