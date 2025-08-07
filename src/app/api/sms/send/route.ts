import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { to, message } = await request.json();
    
    if (!to || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 });
    }

    const response = await fetch(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: process.env.ULTRAMSG_TOKEN,
        to: to,
        body: message,
      }),
    });

    if (!response.ok) {
      throw new Error('UltraMsg API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      messageId: data.id,
      status: data.sent
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}