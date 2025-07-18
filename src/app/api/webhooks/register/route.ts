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
    const { name, url, events, description } = await request.json();
    
    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ 
        error: 'Name, URL, and at least one event are required' 
      }, { status: 400 });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    
    // Validate events
    const validEvents = [
      'contact.created', 'contact.updated', 'contact.deleted',
      'sequence.started', 'sequence.completed', 'sequence.step.sent',
      'credit.purchased', 'credit.used',
      'team.member.added', 'team.member.removed'
    ];
    
    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json({ 
        error: `Invalid events: ${invalidEvents.join(', ')}` 
      }, { status: 400 });
    }
    
    // Generate secret
    const secret = crypto.randomBytes(32).toString('hex');
    
    // Create webhook in Firestore
    const db = getAdminFirestore();
    const webhookRef = db.collection('webhooks').doc();
    
    await webhookRef.set({
      userId: uid,
      name,
      url,
      events,
      description: description || '',
      secret,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      id: webhookRef.id,
      name,
      url,
      events,
      description: description || '',
      secret,
      active: true,
    });
  } catch (error) {
    console.error('Register webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to register webhook' },
      { status: 500 }
    );
  }
}