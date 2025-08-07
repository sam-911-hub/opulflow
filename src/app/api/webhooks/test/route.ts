import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get request data
    const { webhookId, event } = await request.json();
    
    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
    }
    
    // Get webhook from Firestore
    const db = getAdminFirestore();
    const webhookRef = db.collection('webhooks').doc(webhookId);
    const webhookDoc = await webhookRef.get();
    
    if (!webhookDoc.exists) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    
    // Check if user owns the webhook
    const webhookData = webhookDoc.data();
    if (webhookData?.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if webhook is active
    if (!webhookData?.active) {
      return NextResponse.json({ error: 'Webhook is not active' }, { status: 400 });
    }
    
    // Validate event
    const testEvent = event || webhookData.events[0];
    if (!webhookData.events.includes(testEvent)) {
      return NextResponse.json({ 
        error: `Event ${testEvent} is not registered for this webhook` 
      }, { status: 400 });
    }
    
    // Create test payload
    const timestamp = new Date().toISOString();
    const payload = {
      event: testEvent,
      test: true,
      timestamp,
      data: {
        id: `test_${Date.now()}`,
        userId: uid,
      }
    };
    
    // Create signature
    const signature = crypto
      .createHmac('sha256', webhookData.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    // Send webhook
    try {
      const response = await fetch(webhookData.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpulFlow-Signature': signature,
          'X-OpulFlow-Event': testEvent,
          'X-OpulFlow-Delivery': `test_${Date.now()}`,
        },
        body: JSON.stringify(payload),
      });
      
      const responseStatus = response.status;
      let responseBody = null;
      
      try {
        responseBody = await response.json();
      } catch (e) {
        // Response might not be JSON
        responseBody = await response.text();
      }
      
      // Record webhook delivery
      await db.collection('webhookDeliveries').add({
        webhookId,
        userId: uid,
        event: testEvent,
        payload,
        response: {
          status: responseStatus,
          body: responseBody,
        },
        success: responseStatus >= 200 && responseStatus < 300,
        timestamp,
        test: true,
      });
      
      return NextResponse.json({
        success: responseStatus >= 200 && responseStatus < 300,
        status: responseStatus,
        response: responseBody,
      });
    } catch (error) {
      // Record failed delivery
      await db.collection('webhookDeliveries').add({
        webhookId,
        userId: uid,
        event: testEvent,
        payload,
        error: error.message,
        success: false,
        timestamp,
        test: true,
      });
      
      return NextResponse.json({
        success: false,
        error: 'Failed to deliver webhook',
        details: error.message,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}