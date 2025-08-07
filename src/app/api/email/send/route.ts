import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { to, subject, htmlContent, textContent, senderName = 'OpulFlow' } = await request.json();
    
    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ error: 'To, subject, and htmlContent are required' }, { status: 400 });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: 'noreply@opulflow.com'
        },
        to: Array.isArray(to) ? to : [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!response.ok) {
      throw new Error('Brevo API request failed');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      messageId: data.messageId
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}