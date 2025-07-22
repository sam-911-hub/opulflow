import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie, getAdminFirestore } from '@/lib/admin';
import { rateLimitMiddleware, trackApiCost } from '@/app/api/middleware-rate-limit';
import { sanitizeString } from '@/lib/validation';

const ULTRAMSG_API_URL = 'https://api.ultramsg.com/instance134306';
const ULTRAMSG_TOKEN = 'vvjtttowv8jvwwcz';


export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, 'whatsapp-sender');
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
      body, // Message text (required unless sending media)
      type = 'text', // text, image, document, audio, video
      filename,
      caption,
      priority = 'normal',
      referenceId
    } = await request.json();

    // Validate inputs
    if (!to) {
      return NextResponse.json({ 
        error: 'Recipient phone number is required' 
      }, { status: 400 });
    }

    // Validate phone number format (should include country code)
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(to.replace(/\s+/g, ''))) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Use international format with country code' 
      }, { status: 400 });
    }

    if (!body && type === 'text') {
      return NextResponse.json({ 
        error: 'Message body is required for text messages' 
      }, { status: 400 });
    }

    // Check user credits
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const whatsappCredits = userData?.credits?.whatsapp_messages || 0;

    const creditsNeeded = 1; // 1 credit per message
    const costPerMessage = 0.05; // $0.05 per WhatsApp message

    if (whatsappCredits < creditsNeeded) {
      return NextResponse.json({ 
        error: `Insufficient credits. WhatsApp message requires ${creditsNeeded} credit ($${costPerMessage.toFixed(2)})` 
      }, { status: 402 });
    }

    // Prepare UltraMsg API request
    const cleanPhoneNumber = to.replace(/\s+/g, '').replace(/^\+/, '');
    const messageData: any = {
      token: ULTRAMSG_TOKEN,
      to: cleanPhoneNumber,
      body: sanitizeString(body || '', 4096),
      priority: priority === 'high' ? '1' : '10', // UltraMsg priority format
      referenceId: referenceId || `msg_${Date.now()}`
    };

    let endpoint = '/messages/chat';

    // Handle different message types
    switch (type) {
      case 'text':
        // Default endpoint and data already set
        break;
        
      case 'image':
        endpoint = '/messages/image';
        if (!body) {
          return NextResponse.json({ 
            error: 'Image URL is required for image messages' 
          }, { status: 400 });
        }
        messageData.image = body; // URL to image
        messageData.caption = caption ? sanitizeString(caption, 1024) : undefined;
        delete messageData.body;
        break;
        
      case 'document':
        endpoint = '/messages/document';
        if (!body) {
          return NextResponse.json({ 
            error: 'Document URL is required for document messages' 
          }, { status: 400 });
        }
        messageData.document = body; // URL to document
        messageData.filename = filename || 'document';
        messageData.caption = caption ? sanitizeString(caption, 1024) : undefined;
        delete messageData.body;
        break;
        
      case 'audio':
        endpoint = '/messages/audio';
        if (!body) {
          return NextResponse.json({ 
            error: 'Audio URL is required for audio messages' 
          }, { status: 400 });
        }
        messageData.audio = body; // URL to audio
        delete messageData.body;
        break;
        
      case 'video':
        endpoint = '/messages/video';
        if (!body) {
          return NextResponse.json({ 
            error: 'Video URL is required for video messages' 
          }, { status: 400 });
        }
        messageData.video = body; // URL to video
        messageData.caption = caption ? sanitizeString(caption, 1024) : undefined;
        delete messageData.body;
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid message type. Supported types: text, image, document, audio, video' 
        }, { status: 400 });
    }

    // Remove undefined fields
    Object.keys(messageData).forEach(key => {
      if (messageData[key] === undefined) {
        delete messageData[key];
      }
    });

    console.log('Sending WhatsApp message via UltraMsg:', {
      to: cleanPhoneNumber,
      type,
      messageLength: body?.length || 0,
      hasCaption: !!caption,
      endpoint
    });

    // Send message via UltraMsg API
    const ultraResponse = await fetch(`${ULTRAMSG_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(messageData).toString()
    });

    if (!ultraResponse.ok) {
      const errorData = await ultraResponse.text();
      console.error('UltraMsg API error:', errorData);
      
      // Track failed API cost
      await trackApiCost(userId, 'whatsapp_messages', costPerMessage, false, {
        error: errorData,
        to: cleanPhoneNumber,
        type
      });

      return NextResponse.json({ 
        error: 'Failed to send WhatsApp message',
        details: errorData,
        service: 'WhatsApp Messaging'
      }, { status: 500 });
    }

    const ultraData = await ultraResponse.json();
    console.log('WhatsApp message sent successfully:', ultraData);

    // Check if message was sent successfully
    if (ultraData.sent !== true && ultraData.success !== true) {
      // Track failed API cost
      await trackApiCost(userId, 'whatsapp_messages', costPerMessage, false, {
        error: ultraData.error || 'Message not sent',
        to: cleanPhoneNumber,
        type
      });

      return NextResponse.json({ 
        error: 'Failed to send WhatsApp message',
        details: ultraData.error || 'Unknown error from UltraMsg',
        service: 'WhatsApp Messaging'
      }, { status: 500 });
    }

    // Deduct credits
    await userRef.update({
      'credits.whatsapp_messages': whatsappCredits - creditsNeeded
    });

    // Log transaction
    await db.collection(`users/${userId}/transactions`).add({
      type: 'usage',
      service: 'whatsapp_messages',
      amount: creditsNeeded,
      cost: costPerMessage,
      provider: 'Communication Service',
      messageType: type,
      recipient: cleanPhoneNumber,
      messageId: ultraData.id || ultraData.messageId,
      status: ultraData.sent ? 'sent' : 'pending',
      createdAt: new Date().toISOString(),
      remainingBalance: whatsappCredits - creditsNeeded
    });

    // Track successful API cost
    await trackApiCost(userId, 'whatsapp_messages', costPerMessage, true, {
      messageId: ultraData.id,
      to: cleanPhoneNumber,
      type
    });

    return NextResponse.json({
      success: true,
      messageId: ultraData.id || ultraData.messageId,
      status: ultraData.sent ? 'sent' : 'pending',
      to: cleanPhoneNumber,
      type,
      creditsUsed: creditsNeeded,
      remainingCredits: whatsappCredits - creditsNeeded,
      cost: costPerMessage,
      provider: 'Communication Service',
      sentAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('UltraMsg WhatsApp sending error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'WhatsApp Business Messaging',
    cost: '$0.05 per message sent',
    description: 'Send WhatsApp messages including text, images, documents, audio, and video',
    features: [
      'Text messages with formatting',
      'Image messages with captions',
      'Document sharing',
      'Audio messages',
      'Video messages with captions',
      'Delivery status tracking',
      'Priority messaging'
    ],
    messageTypes: {
      text: 'Plain text messages (up to 4096 characters)',
      image: 'Image messages with optional captions',
      document: 'Document sharing with custom filenames',
      audio: 'Audio messages and voice notes',
      video: 'Video messages with optional captions'
    },
    parameters: {
      required: ['to'],
      optional: ['body', 'type', 'caption', 'filename', 'priority', 'referenceId']
    },
    example: {
      to: '+1234567890',
      body: 'Hello! This is a test message from our platform.',
      type: 'text',
      priority: 'normal'
    }
  });
}