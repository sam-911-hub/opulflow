import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { sanitizeString } from '@/lib/validation';

const ULTRAMSG_API_URL = 'https://api.ultramsg.com/instance134306';
const ULTRAMSG_TOKEN = 'vvjtttowv8jvwwcz';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'sms-sender');
    if (rateLimitResponse) return rateLimitResponse;

    // Verify authentication
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get request body
    const { 
      to, // Phone number (required)
      body, // Message text (required)
      priority = 'normal',
      referenceId
    } = await request.json();

    // Validate inputs
    if (!to) {
      return NextResponse.json({ 
        error: 'Recipient phone number is required' 
      }, { status: 400 });
    }

    if (!body) {
      return NextResponse.json({ 
        error: 'Message body is required' 
      }, { status: 400 });
    }

    // Validate phone number format (should include country code)
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(to.replace(/\s+/g, ''))) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Use international format with country code' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const smsCredits = userData?.credits?.sms_messages || 0;

    const creditsNeeded = 1; // 1 credit per SMS
    const costPerSms = 0.03; // $0.03 per SMS

    if (smsCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. SMS requires ${creditsNeeded} credit ($${costPerSms.toFixed(2)})` 
      }, { status: 402 });
    }

    // Prepare UltraMsg API request for SMS
    const cleanPhoneNumber = to.replace(/\s+/g, '').replace(/^\+/, '');
    const messageData = {
      token: ULTRAMSG_TOKEN,
      to: cleanPhoneNumber,
      body: sanitizeString(body, 1600), // SMS character limit
      priority: priority === 'high' ? '1' : '10',
      referenceId: referenceId || `sms_${Date.now()}`
    };

    console.log('Sending SMS via UltraMsg:', {
      to: cleanPhoneNumber,
      messageLength: body.length,
      priority
    });

    // Send SMS via UltraMsg API
    const ultraResponse = await fetch(`${ULTRAMSG_API_URL}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(messageData).toString()
    });

    if (!ultraResponse.ok) {
      const errorData = await ultraResponse.text();
      console.error('UltraMsg SMS API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'sms_messages', costPerSms, false, {
        error: errorData,
        to: cleanPhoneNumber
      });

      return NextResponse.json({ 
        error: 'Failed to send SMS',
        details: errorData,
        service: 'SMS Messaging'
      }, { status: 500 });
    }

    const ultraData = await ultraResponse.json();
    console.log('SMS sent successfully:', ultraData);

    // Check if message was sent successfully
    if (ultraData.sent !== true && ultraData.success !== true) {
      // Track failed API cost
      await trackApiCost(userId, 'sms_messages', costPerSms, false, {
        error: ultraData.error || 'Message not sent',
        to: cleanPhoneNumber
      });

      return NextResponse.json({ 
        error: 'Failed to send SMS',
        details: ultraData.error || 'Unknown error from UltraMsg',
        service: 'SMS Messaging'
      }, { status: 500 });
    }

    // Deduct credits
    await userRef.update({
      'credits.sms_messages': smsCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'sms_messages',
      amount: creditsNeeded,
      cost: costPerSms,
      provider: 'Communication Service',
      recipient: cleanPhoneNumber,
      messageId: ultraData.id || ultraData.messageId,
      status: ultraData.sent ? 'sent' : 'pending',
      messageLength: body.length,
      createdAt: new Date().toISOString(),
      remainingBalance: smsCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'sms_messages', costPerSms, true, {
      messageId: ultraData.id,
      to: cleanPhoneNumber
    });

    return NextResponse.json({
      success: true,
      messageId: ultraData.id || ultraData.messageId,
      status: ultraData.sent ? 'sent' : 'pending',
      to: cleanPhoneNumber,
      messageLength: body.length,
      creditsUsed: creditsNeeded,
      remainingCredits: smsCredits - creditsNeeded,
      cost: costPerSms,
      provider: 'Communication Service',
      sentAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('UltraMsg SMS sending error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Professional SMS Messaging',
    cost: '$0.03 per SMS sent',
    description: 'Send SMS messages globally with delivery tracking',
    features: [
      'Global SMS delivery',
      'Delivery status tracking',
      'Priority messaging',
      'Character count optimization',
      'International number support'
    ],
    limitations: {
      maxCharacters: 1600,
      supportedFormats: ['Plain text only', 'No multimedia support'],
      deliveryTime: 'Usually within seconds to minutes'
    },
    parameters: {
      required: ['to', 'body'],
      optional: ['priority', 'referenceId']
    },
    example: {
      to: '+1234567890',
      body: 'Hello! This is a test SMS from our platform.',
      priority: 'normal'
    }
  });
}